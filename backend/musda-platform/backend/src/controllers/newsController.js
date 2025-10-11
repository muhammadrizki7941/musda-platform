const sanitizeHtml = require('sanitize-html');
const {
  createArticle,
  updateArticle,
  listArticles,
  getBySlug,
  incrementView,
  likeArticle,
  addComment,
  listComments,
  approveComment,
  deleteComment
} = require('../models/newsModel');

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','h1','h2','h3','figure','figcaption','span','iframe']),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src','width','height','allow','allowfullscreen','frameborder'],
    '*': ['style','class']
  },
  allowedSchemes: ['http','https','mailto','tel','data']
};

function fingerprint(req){
  const ua = (req.headers['user-agent']||'').slice(0,120);
  const ip = req.ip || req.connection?.remoteAddress || '0.0.0.0';
  return Buffer.from(ip+'|'+ua).toString('base64');
}

exports.create = async (req,res) => {
  try {
    const {
      title,
      content,          // from frontend (rich html)
      status,           // 'draft' | 'published'
      metaDescription,
      metaKeywords,
      thumbnailUrl,
      excerpt,
      seo_title,
      seo_description,
      seo_keywords,
      canonical_url,
      is_published      // optional legacy
    } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    // Determine publication flag
    const publishFlag = typeof is_published === 'number' ? is_published : status === 'published' ? 1 : 0;
    const rawHtml = content || req.body.content_html || '';
    let cleanHtml = rawHtml ? sanitizeHtml(rawHtml, sanitizeOptions) : '';
    const plain = cleanHtml.replace(/<[^>]*>?/g,' ').replace(/\s+/g,' ').trim();
    const result = await createArticle({
      title,
      excerpt: excerpt || plain.slice(0,180),
      content_html: cleanHtml,
      content_text: plain,
      thumbnail_path: thumbnailUrl || null,
      seo_title: seo_title || title,
      seo_description: seo_description || metaDescription || plain.slice(0,160),
      seo_keywords: seo_keywords || metaKeywords || null,
      canonical_url: canonical_url || null,
      is_published: publishFlag,
      user_id: req.user?.id || null
    });
    res.json({ success:true, id: result.id, slug: result.slug });
  } catch(e){
    console.error(e);res.status(500).json({ error:'Failed create article'});
  }
};

exports.update = async (req,res)=>{
  try {
    const id = req.params.id;
    const {
      title,
      content,
      status,
      metaDescription,
      metaKeywords,
      thumbnailUrl,
      excerpt
    } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) {
      const clean = sanitizeHtml(content, sanitizeOptions);
      data.content_html = clean;
      data.content_text = clean.replace(/<[^>]*>?/g,' ').replace(/\s+/g,' ').trim();
    }
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (thumbnailUrl !== undefined) data.thumbnail_path = thumbnailUrl;
    if (metaDescription !== undefined) data.seo_description = metaDescription;
    if (metaKeywords !== undefined) data.seo_keywords = metaKeywords;
    if (status !== undefined) data.is_published = status === 'published' ? 1 : 0;
    const result = await updateArticle(id, data);
    res.json({ success:true, updated: result.updated });
  } catch(e){ console.error(e); res.status(500).json({ error:'Failed update article' }); }
};

exports.listPublic = async (req,res)=>{
  try {
    const { page, pageSize, search } = req.query;
    const r = await listArticles({ page: Number(page)||1, pageSize: Number(pageSize)||10, search, admin:false });
    const mapped = r.data.map(a => ({
      ...a,
      thumbnail_url: a.thumbnail_path || null,
      status: a.is_published ? 'published' : 'draft'
    }));
    res.json({ success:true, data: mapped, total: r.total, page: r.page, pageSize: r.pageSize });
  } catch(e){ res.status(500).json({ error:'Failed list'}); }
};

exports.listAdmin = async (req,res)=>{
  try {
    const { page, pageSize, search } = req.query;
    const r = await listArticles({ page: Number(page)||1, pageSize: Number(pageSize)||10, search, admin:true });
    const mapped = r.data.map(a => ({
      ...a,
      thumbnail_url: a.thumbnail_path || null,
      status: a.is_published ? 'published' : 'draft'
    }));
    res.json({ success:true, data: mapped, total: r.total, page: r.page, pageSize: r.pageSize });
  } catch(e){ res.status(500).json({ error:'Failed list'}); }
};

exports.detail = async (req,res)=>{
  try {
    const slug = req.params.slug;
    const article = await getBySlug(slug);
    if (!article || (!article.is_published && !req.user)) return res.status(404).json({ error:'Not found' });
  await incrementView(article.id);
  article.views += 1;
  article.thumbnail_url = article.thumbnail_path || null;
  article.status = article.is_published ? 'published' : 'draft';
  res.json({ success:true, article });
  } catch(e){ res.status(500).json({ error:'Failed detail'}); }
};

exports.like = async (req,res)=>{
  try {
    const slug = req.params.slug;
    const article = await getBySlug(slug);
    if (!article || !article.is_published) return res.status(404).json({ error:'Not found' });
    const fp = fingerprint(req);
    const r = await likeArticle(article.id, fp);
    // Ambil likes terbaru agar frontend tahu angka aktual
    const { dbPromise: db } = require('../utils/db');
    try {
      const [rows] = await db.query('SELECT likes FROM news_articles WHERE id = ? LIMIT 1', [article.id]);
      const latest = rows && rows[0] ? rows[0].likes : article.likes;
      res.json({ success:true, liked: r.liked, duplicate: r.duplicate, likes: latest });
    } catch (e2) {
      // fallback jika select gagal
      res.json({ success:true, liked: r.liked, duplicate: r.duplicate });
    }
  } catch(e){ res.status(500).json({ error:'Failed like'}); }
};

exports.comment = async (req,res)=>{
  try {
    const slug = req.params.slug;
    const article = await getBySlug(slug);
    if (!article || !article.is_published) return res.status(404).json({ error:'Not found' });
    const { user_name, content, user_email } = req.body;
    if (!user_name || !content) return res.status(400).json({ error:'Name & content required' });
    const r = await addComment(article.id, { user_name, content, user_email, ip_address: req.ip });
    res.json({ success:true, id:r.id, pending:true });
  } catch(e){ res.status(500).json({ error:'Failed comment'}); }
};

exports.comments = async (req,res)=>{
  try {
    const slug = req.params.slug;
    const article = await getBySlug(slug);
    if (!article) return res.status(404).json({ error:'Not found' });
    const admin = !!req.user;
    const rows = await listComments(article.id, { admin });
    res.json({ success:true, comments: rows });
  } catch(e){ res.status(500).json({ error:'Failed comments'}); }
};

exports.approveComment = async (req,res)=>{
  try {
    await approveComment(req.params.id);
    res.json({ success:true });
  } catch(e){ res.status(500).json({ error:'Failed approve'}); }
};

exports.deleteComment = async (req,res)=>{
  try {
    await deleteComment(req.params.id);
    res.json({ success:true });
  } catch(e){ res.status(500).json({ error:'Failed delete'}); }
};
