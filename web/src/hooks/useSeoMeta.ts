import { useEffect } from 'react';

interface SeoMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
}

const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

export const useSeoMeta = ({ title, description, image, url, type = 'website' }: SeoMeta) => {
  useEffect(() => {
    document.title = title;
    const canonicalUrl = url || window.location.href;

    setMeta('description', description);
    setMeta('og:type', type, 'property');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    if (image) setMeta('og:image', image, 'property');
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);
  }, [title, description, image, url, type]);
};
