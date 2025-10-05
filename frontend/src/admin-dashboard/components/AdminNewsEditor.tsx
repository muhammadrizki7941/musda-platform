import React, { useEffect, useRef, useState } from 'react';
import { createArticle, updateArticle, uploadThumbnail, fetchAdminArticleById, resolveMedia, type ArticlePayload, type NewsArticle } from '../../news/api';
import { ArrowLeft, Save, Eye, Hash } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

// Lazy load react-quill to avoid SSR mismatch
let QuillEditor: any = null;
const loadEditor = async () => {
  if (!QuillEditor) {
    QuillEditor = (await import('react-quill')).default;
  }
  return QuillEditor;
};

interface Props {
  editing?: NewsArticle | null;
  onBack: () => void;
  onSaved?: (a: { id: number; slug: string }) => void;
}

export default function AdminNewsEditor({ editing, onBack, onSaved }: Props) {
  const [title, setTitle] = useState(editing?.title || '');
  const [content, setContent] = useState(editing?.content || '');
  const [status, setStatus] = useState<'draft' | 'published'>(editing?.status || 'draft');
  const [metaDescription, setMetaDescription] = useState(editing?.meta_description || '');
  const [metaKeywords, setMetaKeywords] = useState(editing?.meta_keywords || '');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined | null>(editing?.thumbnail_url || null);
  const [slugPreview, setSlugPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const editorRef = useRef<any>(null);

  useEffect(() => { loadEditor().then(()=> setEditorLoaded(true)); }, []);
  // When editing, fetch full record (including SEO/meta fields) once component mounts
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (editing) {
        setPrefillLoading(true);
        try {
          const resp: any = await fetchAdminArticleById(editing.id);
          const full = resp && resp.article ? resp.article : resp;
          if (cancelled) return;
          setTitle(full.title || '');
          setContent(full.content_html || full.content || '');
          setMetaDescription(full.seo_description || '');
          setMetaKeywords(full.seo_keywords || '');
          setThumbnailUrl(full.thumbnail_path || null);
          setStatus(full.is_published ? 'published' : 'draft');
        } catch (e) {
          console.warn('Failed fetch full article for edit', e);
        } finally { if (!cancelled) setPrefillLoading(false); }
      } else {
        // Reset form when switching from edit to new
        setTitle(''); setContent(''); setMetaDescription(''); setMetaKeywords(''); setThumbnailUrl(null); setStatus('draft');
      }
    })();
    return () => { cancelled = true; };
  }, [editing?.id]);
  useEffect(() => {
    const slug = title.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
    setSlugPreview(slug);
  }, [title]);

  async function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!allowed.includes(file.type)) { alert('Tipe file harus JPG / PNG / WEBP'); return; }
    if (file.size > 1024 * 1024) { alert('Ukuran maksimum 1MB'); return; }
    try {
      setUploadProgress(1);
      const formData = new FormData();
      formData.append('thumbnail', file);
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/news/upload-thumbnail');
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (token) xhr.setRequestHeader('Authorization','Bearer '+token);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded/ev.total)*100));
          }
        };
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                setThumbnailUrl(data.url);
                setUploadProgress(0);
                resolve();
              } catch(err){ reject(err); }
            } else {
              reject(new Error(xhr.responseText || 'Upload gagal'));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });
    } catch (err:any) { console.error(err); alert(err.message || 'Upload gagal'); setUploadProgress(0); }
  }

  async function removeThumbnail() {
    if (!editing) { setThumbnailUrl(null); return; }
    if (!window.confirm('Hapus thumbnail?')) return;
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await fetch(`/api/admin/news/${editing.id}/thumbnail`, { method:'DELETE', headers: token? { 'Authorization':'Bearer '+token } : undefined });
      if (!res.ok) throw new Error('Gagal hapus thumbnail');
      setThumbnailUrl(null);
    } catch(e:any){ alert(e.message); }
  }

  async function handleSave() {
    if (!title.trim()) { setError('Judul wajib diisi'); return; }
    if (!content.trim()) { setError('Konten wajib diisi'); return; }
    setSaving(true); setError('');
    const payload: ArticlePayload = {
      title, content, status, metaDescription, metaKeywords, thumbnailUrl: thumbnailUrl || undefined
    };
    try {
      let result;
      if (editing) {
        result = await updateArticle(editing.id, payload);
      } else {
        result = await createArticle(payload);
      }
      onSaved?.(result);
      onBack();
    } catch (e:any) {
      console.error('Create/Update article failed:', e);
      setError(e.message || 'Gagal menyimpan artikel');
    } finally { setSaving(false); }
  }

  const EditorComponent = editorLoaded ? QuillEditor : (props: any) => <div className="text-gray-400 text-sm">Memuat editor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded bg-gray-700 hover:bg-gray-600" title="Kembali"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-2xl font-semibold text-yellow-400 flex items-center gap-2">{editing ? 'Edit Artikel' : 'Artikel Baru'}</h1>
      </div>
      {error && <div className="p-3 bg-red-800/50 border border-red-600 text-red-200 rounded text-sm">{error}</div>}
      {prefillLoading && editing && (
        <div className="p-2 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300 inline-block">Memuat data artikel...</div>
      )}
      <div className={`grid gap-6 md:grid-cols-3 ${prefillLoading ? 'opacity-50 pointer-events-none' : ''}` }>
        <div className="md:col-span-2 space-y-6">
          <div>
            <label className="block text-sm mb-1">Judul</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" placeholder="Judul artikel" />
            <div className="mt-1 text-xs text-gray-400 flex items-center gap-1"><Hash className="w-3 h-3" /> Slug: <span className="text-yellow-400">{slugPreview || '(otomatis)'}</span></div>
          </div>
          <div>
            <label className="block text-sm mb-1">Konten</label>
            <div className="bg-gray-800 border border-gray-600 rounded">
              <EditorComponent
                ref={editorRef}
                theme="snow"
                value={content}
                onChange={setContent}
                placeholder="Tulis konten berita di sini..."
                modules={{
                  toolbar: [
                    [{ header: [1,2,3,false] }],
                    ['bold','italic','underline','strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link','clean']
                  ]
                }}
              />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm mb-1">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value as any)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm mb-1">Thumbnail</label>
            {thumbnailUrl && (
              <div className="mb-2 relative group inline-block">
                <img
                  src={resolveMedia(thumbnailUrl || undefined)}
                  alt="thumbnail"
                  className="max-h-40 rounded border border-gray-700 object-cover"
                  onError={(e)=>{
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.dataset.fallbackApplied) return;
                    img.dataset.fallbackApplied='1';
                    img.src='/images/placeholder-thumb.png';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition">
                  <button type="button" onClick={()=>document.getElementById('thumbInput')?.click()} className="px-2 py-1 text-xs rounded bg-yellow-500 text-black">Ganti</button>
                  <button type="button" onClick={removeThumbnail} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Hapus</button>
                </div>
              </div>
            )}
            {!thumbnailUrl && (
              <button type="button" onClick={()=>document.getElementById('thumbInput')?.click()} className="px-3 py-2 text-xs rounded bg-gray-700 hover:bg-gray-600 border border-gray-600">Upload Thumbnail</button>
            )}
            <input id="thumbInput" type="file" accept="image/*" onChange={handleThumbnail} className="hidden" />
            {uploadProgress > 0 && (
              <div className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                <div className="h-full bg-yellow-500 transition-all" style={{ width: uploadProgress + '%' }} />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Meta Description</label>
            <textarea value={metaDescription} maxLength={160} onChange={e=>setMetaDescription(e.target.value)} className="w-full h-24 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
            <div className="text-xs text-gray-400 text-right">{metaDescription.length}/160</div>
          </div>
            <div>
            <label className="block text-sm mb-1">Meta Keywords (pisahkan koma)</label>
            <input value={metaKeywords} onChange={e=>setMetaKeywords(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button disabled={saving} onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded px-3 py-2 text-sm font-medium disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={()=>window.open('/', '_blank')} className="p-2 rounded bg-gray-700 hover:bg-gray-600" title="Lihat Situs">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
