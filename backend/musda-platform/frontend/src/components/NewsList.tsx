import React, { useEffect, useState, useMemo } from 'react';
import { fetchPublicArticles, extractPlainExcerpt, resolveMedia, type NewsArticle } from '../news/api';
import { Link } from 'react-router-dom';
import { MetaTags } from './MetaTags';
import { Eye, ThumbsUp, Calendar } from 'lucide-react';
import { Header } from './Header';

export default function NewsList() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
  const [error, setError] = useState('');

  const pageCount = Math.ceil(total / limit) || 1;

  async function load(currentSearch = '') {
    setLoading(true); setError('');
    try {
      const params: any = { page, limit };
      if (currentSearch.trim()) params.search = currentSearch.trim();
      const data = await fetchPublicArticles(params);
      setArticles(data.data);
      setTotal(data.total);
    } catch (e:any) { setError(e.message); }
    finally { setLoading(false); }
  }
  // Debounce search: trigger reload 400ms setelah berhenti mengetik
  useEffect(()=>{
    const t = setTimeout(()=>{
      setSearch(pendingSearch);
      setPage(1);
    }, 400);
    return ()=>clearTimeout(t);
  }, [pendingSearch]);

  useEffect(()=>{ load(search); }, [page, search]);

  // Derived sorted data for 'popular'
  const displayedArticles = useMemo(()=>{
    if (activeTab === 'popular') {
      return [...articles].sort((a,b)=> (b.likes||0) - (a.likes||0));
    }
    return articles;
  }, [articles, activeTab]);

  // Skeleton placeholder cards
  const skeletons = Array.from({ length: 6 }).map((_,i)=>(
    <div key={i} className="rounded-xl bg-gray-900/40 border border-gray-800 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700/70 rounded w-3/4" />
        <div className="h-3 bg-gray-700/50 rounded w-full" />
        <div className="h-3 bg-gray-700/40 rounded w-2/3" />
        <div className="h-3 bg-gray-700/60 rounded w-1/3 mt-4" />
      </div>
    </div>
  ));

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900/60 to-gray-950">
      <Header />
      <div className="pt-28 max-w-7xl mx-auto px-4 lg:px-8 pb-16">
      <MetaTags title="Berita" description="Kumpulan berita terbaru kegiatan MUSDA HIMPERRA" keywords="berita,musda,himperra" canonical={window.location.href} />
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-yellow-500/80 font-semibold">Musda Himperra</div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Berita</h1>
            <p className="text-sm text-gray-400">Update informasi & kegiatan terbaru.</p>
            <Link to="/" className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-yellow-300 transition group">
              <span className="group-hover:underline">&larr; Kembali ke halaman utama</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative">
              <input
                value={pendingSearch}
                onChange={e=>setPendingSearch(e.target.value)}
                placeholder="Cari berita..."
                className="w-full sm:w-64 bg-gray-900/70 border border-gray-800 focus:border-yellow-500/60 rounded-lg px-10 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-3.8-3.8"/></svg>
              {pendingSearch && (
                <button onClick={()=>{ setPendingSearch(''); setSearch(''); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">×</button>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-400 justify-end">
              <span className="px-2.5 py-1 rounded-full bg-gray-800 border border-gray-700">Total {total}</span>
              <span className="hidden sm:inline text-gray-600">•</span>
              <span>Hal. {page} / {pageCount}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 border-b border-gray-800 pb-1 text-sm">
          <button onClick={()=>setActiveTab('latest')} className={`relative pb-2 font-medium transition ${activeTab==='latest' ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'}`}>
            Terbaru
            {activeTab==='latest' && <span className="absolute left-0 -bottom-px h-[2px] w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500" />}
          </button>
          <button onClick={()=>setActiveTab('popular')} className={`relative pb-2 font-medium transition ${activeTab==='popular' ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-300'}`}>
            Populer
            {activeTab==='popular' && <span className="absolute left-0 -bottom-px h-[2px] w-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500" />}
          </button>
        </div>
      </div>
      {error && <div className="p-3 bg-red-900/50 border border-red-600 text-red-200 rounded text-sm mb-6">{error}</div>}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {loading && skeletons}
  {!loading && displayedArticles.map(a => {
          const excerpt = a.meta_description || a.excerpt || (a.content ? extractPlainExcerpt(a.content,120) : '');
          return (
            <Link key={a.id} to={`/news/${a.slug}`}
              className="group relative flex flex-col rounded-xl bg-gradient-to-b from-gray-900/70 via-gray-900/40 to-gray-900/10 border border-gray-800 hover:border-yellow-500/50 shadow-lg hover:shadow-yellow-500/10 transition overflow-hidden min-h-[380px]">
              <div className="relative aspect-[16/10] overflow-hidden">
                {a.thumbnail_url ? (
                  <img
                    src={resolveMedia(a.thumbnail_url)}
                    alt={a.title}
                    className="w-full h-full object-cover transform-gpu transition duration-700 ease-out group-hover:scale-[1.06]"
                    onError={(e)=>{
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.dataset.fallbackApplied) return;
                      img.dataset.fallbackApplied='1';
                      img.src='/images/placeholder-thumb.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 bg-gray-800">NO IMAGE</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/10 to-transparent opacity-80 group-hover:opacity-90 transition" />
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[10px] font-medium tracking-wide text-yellow-300 border border-yellow-500/30">{new Date(a.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="flex flex-col flex-1 px-4 pt-4 pb-5">
                <h2 className="font-semibold text-base md:text-lg leading-snug text-yellow-300 group-hover:text-yellow-200 line-clamp-2 mb-2">{a.title}</h2>
                <p className="text-xs md:text-sm text-gray-300/90 line-clamp-3 mb-4 flex-1">{excerpt}</p>
                <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-800/70 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {a.views}</span>
                  <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {a.likes}</span>
                </div>
              </div>
              <span className="pointer-events-none absolute inset-0 ring-0 ring-yellow-400/0 group-hover:ring-2 group-hover:ring-yellow-400/40 rounded-xl transition" />
            </Link>
          );
        })}
      </div>
      {!loading && articles.length === 0 && <div className="text-center text-gray-400 py-16 text-sm">Belum ada artikel.</div>}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
        <div className="flex gap-2 order-2 sm:order-1">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm font-medium">Prev</button>
          <button disabled={page>=pageCount} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm font-medium">Next</button>
        </div>
        <div className="order-1 sm:order-2 text-xs text-gray-500">Halaman {page} dari {pageCount}</div>
      </div>
      </div>
    </div>
  );
}
