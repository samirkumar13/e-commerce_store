import React, { useState, useEffect } from 'react';
import { fetchSettings } from '../services/api';

const AnnouncementBar: React.FC<{ onVisibilityChange?: (visible: boolean) => void }> = ({ onVisibilityChange }) => {
  const [enabled, setEnabled] = useState(false);
  const [text, setText] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchSettings().then((s: Record<string, string>) => {
      setEnabled(s.announcementEnabled === 'true');
      setText(s.announcementText || '');
      setLinkText(s.announcementLinkText || '');
      setLinkUrl(s.announcementLinkUrl || '');
      setBgColor(s.announcementBgColor || '');
    }).catch(() => {});
  }, []);

  // Re-check when admin saves settings (same tab)
  useEffect(() => {
    const handler = (e: Event) => {
      const s = (e as CustomEvent).detail as Record<string, string>;
      setEnabled(s.announcementEnabled === 'true');
      setText(s.announcementText || '');
      setLinkText(s.announcementLinkText || '');
      setLinkUrl(s.announcementLinkUrl || '');
      setBgColor(s.announcementBgColor || '');
      setDismissed(false);
    };
    window.addEventListener('settings-updated', handler);
    return () => window.removeEventListener('settings-updated', handler);
  }, []);

  const isVisible = enabled && !!text.trim() && !dismissed;

  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  if (!isVisible) return null;

  const bg = bgColor || 'var(--color-primary, #06b6d4)';

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2 text-sm font-medium text-white"
      style={{ backgroundColor: bg }}
    >
      <span>{text}</span>
      {linkText && linkUrl && (
        <a href={linkUrl} className="ml-2 underline underline-offset-2 opacity-90 hover:opacity-100">
          {linkText}
        </a>
      )}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default AnnouncementBar;
