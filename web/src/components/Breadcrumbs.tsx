import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  useEffect(() => {
    const baseUrl = window.location.origin;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.label,
        ...(item.href ? { item: `${baseUrl}/#${item.href}` } : {}),
      })),
    };
    let script = document.getElementById('breadcrumb-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'breadcrumb-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
    return () => { script?.remove(); };
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 flex-wrap">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-slate-300">/</span>}
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-slate-700 font-medium' : ''}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
