// News feature TypeScript interfaces and API helper functions
// Assumes backend mounted at /api

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail_url?: string | null;
  status: 'draft' | 'published';
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  meta_description?: string | null;
  meta_keywords?: string | null;
  excerpt?: string | null;
}

// Resolve media path to absolute backend URL if needed
export function resolveMedia(p?: string | null) {
  if (!p) return '';
  if (/^https?:/i.test(p)) return p;
  // If already has /uploads prefix, prepend backend origin
  if (p.startsWith('/uploads/')) {
    const base = (import.meta as any).env.VITE_API_BASE || 'http://localhost:3001';
    return base.replace(/\/$/, '') + p;
  }
  return p;
}

export interface NewsComment {
  id: number;
  article_id: number;
  name: string;
  content: string;
  approved: number; // 0/1 from backend
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

const API_BASE = '/api';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handle<T>(resPromise: Promise<Response> | Response): Promise<T> {
  const res = resPromise instanceof Promise ? await resPromise : resPromise;
  if (!res) {
    console.error('[API] Response object undefined');
    throw new Error('Request failed (no response)');
  }
  if (!('ok' in res)) {
    console.error('[API] Invalid response object', res);
    throw new Error('Request failed (invalid response)');
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      try {
        const j = JSON.parse(text);
        msg = j.message || msg;
      } catch {
        if (text) msg = text;
      }
    } catch {}
    throw new Error(msg);
  }
  // Safeguard empty body
  const clone = res.clone();
  const bodyText = await clone.text();
  if (!bodyText) return {} as T;
  try { return JSON.parse(bodyText); } catch { return {} as T; }
}

// Public
export async function fetchPublicArticles(params: { page?: number; limit?: number } = {}): Promise<Paginated<NewsArticle>> {
  const qs: string[] = [];
  if (params.page) qs.push(`page=${params.page}`);
  if (params.limit) qs.push(`limit=${params.limit}`);
  const url = `${API_BASE}/news${qs.length ? '?' + qs.join('&') : ''}`;
  const raw: any = await handle<any>(fetch(url));
  if (raw && Array.isArray(raw.data)) {
    raw.data = raw.data.map((a: any) => normalizeArticle(a));
  }
  return raw;
}

export async function fetchArticleBySlug(slug: string): Promise<NewsArticle & { comments?: NewsComment[] }> {
  const raw: any = await handle<any>(fetch(`${API_BASE}/news/${slug}`));
  if (raw && raw.article) raw.article = normalizeArticle(raw.article);
  return raw.article || raw;
}

export async function likeArticle(slug: string): Promise<{ likes: number }> {
  return handle(fetch(`${API_BASE}/news/${slug}/like`, { method: 'POST' }));
}

export async function fetchComments(slug: string): Promise<NewsComment[]> {
  return handle(fetch(`${API_BASE}/news/${slug}/comments`));
}

export async function postComment(slug: string, data: { name: string; content: string }): Promise<{ id: number }> {
  return handle(fetch(`${API_BASE}/news/${slug}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }));
}

// Admin
export async function fetchAdminArticles(params: { page?: number; limit?: number; status?: string } = {}): Promise<Paginated<NewsArticle>> {
  const query: string[] = [];
  if (params.page) query.push(`page=${params.page}`);
  if (params.limit) query.push(`limit=${params.limit}`);
  if (params.status) query.push(`status=${encodeURIComponent(params.status)}`);
  const qs = query.length ? `?${query.join('&')}` : '';
  const raw: any = await handle<any>(fetch(`${API_BASE}/admin/news${qs}`, { headers: { ...authHeaders() } }));
  if (raw && Array.isArray(raw.data)) raw.data = raw.data.map((a: any)=> normalizeArticle(a));
  return raw;
}

export interface ArticlePayload {
  title: string;
  content: string;
  status: 'draft' | 'published';
  metaDescription?: string;
  metaKeywords?: string;
  thumbnailUrl?: string | null;
}

export async function createArticle(payload: ArticlePayload): Promise<{ id: number; slug: string }> {
  // Backend expects title, content, status, metaDescription/metaKeywords, thumbnailUrl
  return handle(fetch(`${API_BASE}/admin/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  }));
}

export async function updateArticle(id: number, payload: Partial<ArticlePayload>): Promise<{ id: number; slug: string }> {
  return handle(fetch(`${API_BASE}/admin/news/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  }));
}

export async function fetchAdminArticleById(id: number): Promise<NewsArticle> {
  const raw: any = await handle<any>(fetch(`${API_BASE}/admin/news/${id}`, { headers: { ...authHeaders() } }));
  if (raw && raw.article) return normalizeArticle(raw.article);
  return normalizeArticle(raw);
}

export async function uploadThumbnail(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('thumbnail', file);
  return handle(fetch(`${API_BASE}/admin/news/upload-thumbnail`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: fd
  }));
}

export async function approveComment(id: number): Promise<{ success: boolean }> {
  return handle(fetch(`${API_BASE}/admin/news/comments/${id}/approve`, {
    method: 'PATCH',
    headers: { ...authHeaders() }
  }));
}

export async function deleteComment(id: number): Promise<{ success: boolean }> {
  return handle(fetch(`${API_BASE}/admin/news/comments/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  }));
}

// Utility to build excerpt from HTML content
export function extractPlainExcerpt(html: string, length = 140): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

// Internal: normalize API article object from backend
function normalizeArticle(a: any): NewsArticle {
  // Map legacy / backend fields
  const obj: any = { ...a };
  obj.thumbnail_url = obj.thumbnail_url || obj.thumbnailPath || obj.thumbnail_path || null;
  if (!obj.content && obj.content_html) obj.content = obj.content_html;
  obj.meta_description = obj.meta_description || obj.seo_description || null;
  obj.meta_keywords = obj.meta_keywords || obj.seo_keywords || null;
  // Derive status if missing
  if (!obj.status && typeof obj.is_published !== 'undefined') obj.status = obj.is_published ? 'published' : 'draft';
  // Derive a text excerpt if backend didn't supply one (fallback to 140 chars)
  let excerpt: string | null = a.excerpt || null;
  if (!excerpt && a.content) {
    const plain = a.content.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    excerpt = plain.slice(0, 140).trim();
  }
  obj.excerpt = excerpt;
  return obj as NewsArticle;
}
