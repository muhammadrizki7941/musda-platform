import React, { useEffect } from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
}

export function MetaTags({ title, description, keywords, canonical }: MetaTagsProps) {
  useEffect(() => {
    if (title) document.title = title + ' | MUSDA HIMPERRA';
    const metaDesc = ensureMeta('description');
    if (description && metaDesc) metaDesc.setAttribute('content', description);
    const metaKeywords = ensureMeta('keywords');
    if (keywords && metaKeywords) metaKeywords.setAttribute('content', keywords);
    if (canonical) {
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, keywords, canonical]);

  return null;
}

function ensureMeta(name: string) {
  let el = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  return el;
}
