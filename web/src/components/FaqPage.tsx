import React, { useEffect, useState } from 'react';
import { fetchFaqs } from '../services/api';
import Breadcrumbs from './Breadcrumbs';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs()
      .then((data: Faq[]) => setFaqs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(faqs.map((f) => f.category))];

  useEffect(() => {
    if (faqs.length === 0) return;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    };
    let script = document.getElementById('faq-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'faq-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);
    return () => {
      script?.remove();
    };
  }, [faqs]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading FAQs...
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        No FAQs available yet.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h1>
      <p className="text-slate-500 mb-10">Find answers to common questions about our products and services.</p>

      {categories.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">{cat}</h2>
          <div className="space-y-2">
            {faqs
              .filter((f) => f.category === cat)
              .map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-shadow hover:shadow-soft"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-medium text-slate-800 pr-4">{faq.question}</span>
                      <svg
                        className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-0 text-slate-600 text-sm leading-relaxed bg-slate-50/50 border-t border-slate-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqPage;
