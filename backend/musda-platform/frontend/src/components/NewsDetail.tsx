import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleBySlug, fetchComments, postComment, likeArticle, resolveMedia, type NewsArticle, type NewsComment } from '../news/api';
import { MetaTags } from './MetaTags';
import { ArrowLeft, ThumbsUp, Share2, MessageSquare } from 'lucide-react';
import { Header } from './Header';

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [likes, setLikes] = useState<number>(0);
  const [liking, setLiking] = useState(false);

  async function load() {
    if (!slug) return;
    setLoading(true); setError('');
    try {
      const a = await fetchArticleBySlug(slug);
      setArticle(a);
      setLikes(a.likes);
      const c = await fetchComments(slug);
      setComments(c.filter(c=>c.approved === 1));
    } catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, [slug]);

  async function handleLike() {
    if (liking) return;
    setLiking(true);
    try {
      const res: any = await likeArticle(slug!);
      if (typeof res.likes === 'number') {
        setLikes(res.likes);
      } else {
        // fallback increment jika tidak ada likes
        setLikes(l => l + (res.duplicate ? 0 : 1));
      }
      if (res.duplicate) {
        // Opsional: beri feedback bahwa sudah like
        console.info('Sudah pernah like (duplicate)');
      }
    } catch (e:any) { alert(e.message); }
    finally { setLiking(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) return;
    setPosting(true);
    try {
      await postComment(slug!, { name, content: commentText });
      setName(''); setCommentText('');
      alert('Komentar dikirim & menunggu persetujuan');
    } catch (e:any) { alert(e.message); }
    finally { setPosting(false); }
  }

  function shareWhatsApp() {
    const url = window.location.href;
    const text = encodeURIComponent(article?.title + '\n' + url);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950">
      <Header />
      <div className="pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/news" className="inline-flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition"><ArrowLeft className="w-4 h-4" /> Kembali ke Berita</Link>
      </div>
      {loading && <div className="text-gray-400">Memuat...</div>}
      {error && <div className="p-3 bg-red-900/40 border border-red-600 text-red-300 rounded text-sm">{error}</div>}
      {article && !loading && (
        <article className="space-y-6">
          <MetaTags title={article.title} description={article.meta_description || undefined} keywords={article.meta_keywords || undefined} canonical={window.location.href} />
          <header className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-yellow-500/80 font-semibold">Musda Himperra</div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent leading-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
              <span>{new Date(article.created_at).toLocaleDateString('id-ID')}</span>
              <span>{article.views} views</span>
              <span>{likes} likes</span>
            </div>
            {article.meta_description && <p className="text-sm text-gray-300 italic">{article.meta_description}</p>}
            <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900/60 shadow-lg">
              {article.thumbnail_url ? (
                <img
                  src={resolveMedia(article.thumbnail_url)}
                  alt={article.title}
                  className="w-full max-h-[480px] object-cover transition duration-700 ease-out"
                  onError={(e)=>{
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.dataset.fallbackApplied) return;
                    img.dataset.fallbackApplied = '1';
                    img.src='/images/placeholder-hero.png';
                  }}
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Tidak ada gambar</div>
              )}
            </div>
          </header>
          <div className="prose prose-invert max-w-none prose-headings:text-yellow-300 prose-a:text-yellow-400 prose-img:rounded-lg" dangerouslySetInnerHTML={{ __html: article.content }} />
          <div className="flex gap-3 pt-6 border-t border-gray-800">
            <button disabled={liking} onClick={handleLike} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded text-sm"><ThumbsUp className="w-4 h-4" /> Suka ({likes})</button>
            <button onClick={shareWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-sm"><Share2 className="w-4 h-4" /> Share WA</button>
          </div>
          <section className="pt-10 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-yellow-300"><MessageSquare className="w-5 h-5" /> Komentar</h2>
            {comments.length === 0 && <div className="text-sm text-gray-400">Belum ada komentar.</div>}
            <ul className="space-y-4">
              {comments.map(c => (
                <li key={c.id} className="p-3 rounded border border-gray-800 bg-gray-900/50">
                  <div className="text-xs text-gray-400 mb-1">{new Date(c.created_at).toLocaleString('id-ID')} • <span className="text-yellow-400 font-medium">{c.name}</span></div>
                  <div className="text-sm text-gray-200 whitespace-pre-line">{c.content}</div>
                </li>
              ))}
            </ul>
            <form onSubmit={handleSubmit} className="space-y-3 border border-gray-800 rounded-lg p-5 bg-gray-900/50 backdrop-blur">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1 uppercase tracking-wide text-gray-400">Nama</label>
                  <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" placeholder="Nama Anda" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1 uppercase tracking-wide text-gray-400">Komentar</label>
                  <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} rows={4} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" placeholder="Tulis komentar" />
                </div>
              </div>
              <button disabled={posting} className="px-5 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium disabled:opacity-50">{posting ? 'Mengirim...' : 'Kirim'}</button>
            </form>
          </section>
        </article>
      )}
      </div>
      </div>
    </div>
  );
}
