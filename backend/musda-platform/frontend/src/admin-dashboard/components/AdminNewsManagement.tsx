import React, { useEffect, useState } from 'react';
import { fetchAdminArticles, approveComment, deleteComment, fetchArticleBySlug, type NewsArticle } from '../../news/api';
import { FilePlus2, RefreshCw, Filter, Eye, MessageSquare, Check, Trash2, Pencil } from 'lucide-react';

interface CommentModerationItem {
  id: number;
  article_id: number;
  title?: string;
  name: string;
  content: string;
  created_at: string;
  approved: number;
}

export default function AdminNewsManagement() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showComments, setShowComments] = useState(false);
  const [moderationQueue, setModerationQueue] = useState<CommentModerationItem[]>([]);

  const pageCount = Math.ceil(total / limit) || 1;

  async function loadArticles() {
    setLoading(true); setError('');
    try {
      const data = await fetchAdminArticles({ page, limit, status: statusFilter || undefined });
      setArticles(data.data);
      setTotal(data.total);
    } catch (e:any) {
      setError(e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadArticles(); }, [page, statusFilter]);

  // For now we lazily fetch comments per article only when opening moderation panel.
  async function buildModerationQueue() {
    setLoading(true); setError('');
    try {
      const queue: CommentModerationItem[] = [];
      for (const a of articles) {
        // fetch each article detail to get comments? backend has separate endpoint by slug
        const detail = await fetchArticleBySlug(a.slug);
        if ((detail as any).comments) {
          (detail as any).comments.forEach((c: any) => {
            if (c.approved === 0) queue.push({ ...c, article_id: a.id, title: a.title });
          });
        }
      }
      setModerationQueue(queue.sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (showComments) buildModerationQueue(); }, [showComments]);

  async function handleApprove(id: number) {
    try {
      await approveComment(id);
      setModerationQueue(q => q.filter(c => c.id !== id));
    } catch (e:any) { alert(e.message); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Hapus komentar ini?')) return;
    try {
      await deleteComment(id);
      setModerationQueue(q => q.filter(c => c.id !== id));
    } catch (e:any) { alert(e.message); }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-yellow-400 flex items-center gap-2"><Eye className="w-6 h-6" /> Berita</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowComments(s => !s)}
            className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" /> {showComments ? 'Tutup Moderasi' : 'Moderasi Komentar'}
          </button>
          <button
            onClick={() => (window as any).setActiveTab && (window as any).setActiveTab('news-editor')}
            className="px-3 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium flex items-center gap-2"
          >
            <FilePlus2 className="w-4 h-4" /> Artikel Baru
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <select value={statusFilter} onChange={e => { setPage(1); setStatusFilter(e.target.value); }} className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm">
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button onClick={loadArticles} className="flex items-center gap-1 text-sm px-3 py-2 bg-gray-700 rounded hover:bg-gray-600">
          <RefreshCw className={"w-4 h-4"} /> Reload
        </button>
      </div>

      {error && <div className="p-3 bg-red-800/50 border border-red-600 text-red-200 rounded text-sm">{error}</div>}
      {loading && <div className="text-sm text-gray-400">Memuat...</div>}

      <div className="overflow-x-auto border border-gray-700 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Judul</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Views</th>
              <th className="px-4 py-2 text-left">Likes</th>
              <th className="px-4 py-2 text-left">Dibuat</th>
              <th className="px-4 py-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(a => (
              <tr key={a.id} className="border-t border-gray-700 hover:bg-gray-800/60">
                <td className="px-4 py-2 font-medium text-yellow-300 max-w-xs truncate" title={a.title}>{a.title}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${a.status === 'published' ? 'bg-green-600/30 text-green-300' : 'bg-gray-600/30 text-gray-200'}`}>{a.status}</span>
                </td>
                <td className="px-4 py-2">{a.views}</td>
                <td className="px-4 py-2">{a.likes}</td>
                <td className="px-4 py-2">{new Date(a.created_at).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => (window as any).editArticle && (window as any).editArticle(a)} className="inline-flex items-center p-1.5 rounded bg-blue-600/60 hover:bg-blue-500" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && articles.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Tidak ada artikel.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div>Halaman {page} / {pageCount} (Total {total})</div>
        <div className="flex gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40">Prev</button>
          <button disabled={page>=pageCount} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40">Next</button>
        </div>
      </div>

      {/* Comment Moderation Panel */}
      {showComments && (
        <div className="border border-gray-700 rounded-lg p-4 space-y-4 bg-gray-900/60">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-indigo-300"><MessageSquare className="w-5 h-5" /> Komentar Menunggu Persetujuan</h2>
          {moderationQueue.length === 0 && <div className="text-sm text-gray-400">Tidak ada komentar pending.</div>}
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {moderationQueue.map(c => (
              <li key={c.id} className="p-3 rounded border border-gray-700 bg-gray-800/50">
                <div className="flex justify-between items-start">
                  <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('id-ID')} • <span className="text-yellow-400">{c.title}</span></div>
                  <div className="flex gap-1">
                    <button onClick={()=>handleApprove(c.id)} className="p-1 rounded bg-green-600/60 hover:bg-green-500" title="Setujui"><Check className="w-4 h-4" /></button>
                    <button onClick={()=>handleDelete(c.id)} className="p-1 rounded bg-red-600/60 hover:bg-red-500" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="mt-1 text-sm text-gray-200"><strong className="text-indigo-300">{c.name}:</strong> {c.content}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
