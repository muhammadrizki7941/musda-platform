const { dbPromise: db } = require('../utils/db');
const slugify = (str) =>
  str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

async function ensureUniqueSlug(base, attempt = 0) {
  const slug = attempt === 0 ? base : `${base}-${attempt}`;
  const [rows] = await db.query('SELECT id FROM news_articles WHERE slug = ? LIMIT 1', [slug]);
  if (rows.length === 0) return slug;
  return ensureUniqueSlug(base, attempt + 1);
}

async function createArticle(data) {
  if (!data.title) throw new Error('Title required');
  // Slug generation
  const baseSlug = slugify(data.slug || data.title || 'untitled');
  const slug = await ensureUniqueSlug(baseSlug);
  const now = new Date();
  const isPublished = data.is_published ? 1 : 0;
  const publishedAt = isPublished ? now : null;
  // Fallbacks without forcing NULL when empty string intentionally provided
  const contentHtml = data.content_html !== undefined ? data.content_html : '';
  const contentText = data.content_text !== undefined ? data.content_text : (contentHtml ? contentHtml.replace(/<[^>]*>?/g,' ').replace(/\s+/g,' ').trim() : '');
  const excerpt = data.excerpt !== undefined ? data.excerpt : (contentText ? contentText.slice(0,180) : (data.title || '').slice(0,180));
  const seoTitle = data.seo_title !== undefined ? data.seo_title : data.title;
  const seoDescription = data.seo_description !== undefined ? data.seo_description : (excerpt ? excerpt.slice(0,160) : data.title.slice(0,160));
  const seoKeywords = data.seo_keywords !== undefined ? data.seo_keywords : null;
  const canonicalUrl = data.canonical_url !== undefined ? data.canonical_url : null;
  const thumbPath = data.thumbnail_path !== undefined ? data.thumbnail_path : null;
  const userId = data.user_id || null;
  const [result] = await db.query(
    `INSERT INTO news_articles (slug,title,excerpt,content_html,content_text,thumbnail_path,seo_title,seo_description,seo_keywords,canonical_url,is_published,published_at,created_by,updated_by,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      slug,
      data.title,
      excerpt,
      contentHtml,
      contentText,
      thumbPath,
      seoTitle,
      seoDescription,
      seoKeywords,
      canonicalUrl,
      isPublished,
      publishedAt,
      userId,
      userId,
      now,
      now
    ]
  );
  return { id: result.insertId, slug };
}

async function updateArticle(id, data) {
  const fields = [];
  const values = [];
  const allowed = ['title','excerpt','content_html','content_text','thumbnail_path','seo_title','seo_description','seo_keywords','canonical_url','is_published'];
  allowed.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(data, k)) {
      fields.push(`${k} = ?`);
      values.push(data[k]);
    }
  });
  // Auto maintain content_text if only content_html provided
  if (Object.prototype.hasOwnProperty.call(data,'content_html') && !Object.prototype.hasOwnProperty.call(data,'content_text')) {
    fields.push('content_text = ?');
    values.push((data.content_html || '').replace(/<[^>]*>?/g,' ').replace(/\s+/g,' ').trim());
  }
  // Auto generate excerpt if empty string and content_text available
  if (Object.prototype.hasOwnProperty.call(data,'excerpt') && (data.excerpt === undefined || data.excerpt === '')) {
    fields.push('excerpt = ?');
    values.push(((data.content_text)|| (data.content_html||'').replace(/<[^>]*>?/g,' ').replace(/\s+/g,' ').trim()).slice(0,180));
  }
  if (data.is_published === 1 || data.is_published === true) {
    fields.push('published_at = IF(published_at IS NULL, NOW(), published_at)');
  }
  if (!fields.length) return { updated: 0 };
  values.push(id);
  const [result] = await db.query(`UPDATE news_articles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
  return { updated: result.affectedRows };
}

async function listArticles({ page = 1, pageSize = 10, search, admin = false }) {
  const offset = (page - 1) * pageSize;
  const params = [];
  let where = 'WHERE 1=1';
  if (!admin) {
    where += ' AND is_published = 1';
  }
  if (search) {
    where += ' AND (title LIKE ? OR excerpt LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  const [rows] = await db.query(
    `SELECT SQL_CALC_FOUND_ROWS id, slug, title, excerpt, thumbnail_path, views, likes, is_published, published_at, created_at
     FROM news_articles ${where}
     ORDER BY published_at DESC, created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const [countRows] = await db.query('SELECT FOUND_ROWS() as total');
  return { data: rows, total: countRows[0].total, page, pageSize };
}

async function getBySlug(slug) {
  const [rows] = await db.query('SELECT * FROM news_articles WHERE slug = ? LIMIT 1', [slug]);
  return rows[0];
}

async function getById(id) {
  const [rows] = await db.query('SELECT * FROM news_articles WHERE id = ? LIMIT 1', [id]);
  return rows[0];
}

async function incrementView(id) {
  await db.query('UPDATE news_articles SET views = views + 1 WHERE id = ?', [id]);
}

async function likeArticle(id, fingerprint) {
  try {
    await db.query('INSERT INTO news_likes (article_id, client_fingerprint) VALUES (?, ?)', [id, fingerprint]);
    await db.query('UPDATE news_articles SET likes = likes + 1 WHERE id = ?', [id]);
    return { liked: true };
  } catch (e) {
    return { liked: false, duplicate: true };
  }
}

async function addComment(articleId, data) {
  const [result] = await db.query(
    'INSERT INTO news_comments (article_id, user_name, user_email, content, is_approved, ip_address, created_at) VALUES (?,?,?,?,0,?,NOW())',
    [articleId, data.user_name, data.user_email || null, data.content, data.ip_address || null]
  );
  return { id: result.insertId };
}

async function listComments(articleId, { admin = false }) {
  const [rows] = await db.query(
    `SELECT id, user_name, content, created_at, is_approved FROM news_comments WHERE article_id = ? ${admin ? '' : 'AND is_approved = 1'} ORDER BY created_at ASC`,
    [articleId]
  );
  return rows;
}

async function approveComment(id) {
  await db.query('UPDATE news_comments SET is_approved = 1 WHERE id = ?', [id]);
}

async function deleteComment(id) {
  await db.query('DELETE FROM news_comments WHERE id = ?', [id]);
}

module.exports = {
  createArticle,
  updateArticle,
  listArticles,
  getBySlug,
  getById,
  incrementView,
  likeArticle,
  addComment,
  listComments,
  approveComment,
  deleteComment
};
