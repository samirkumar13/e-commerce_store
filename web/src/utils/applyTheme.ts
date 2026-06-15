// Converts a hex color to RGB components for CSS variable use
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Darkens a hex color by a given amount (0-255)
function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r - amount)}${toHex(g - amount)}${toHex(b - amount)}`;
}

export interface ThemeSettings {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

const FONT_URLS: Record<string, string> = {
  'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
  'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap',
  'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
  'Nunito': 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
};

export const FONT_OPTIONS = Object.keys(FONT_URLS);

export const RADIUS_OPTIONS = [
  { label: 'Sharp', value: '0px' },
  { label: 'Rounded', value: '8px' },
  { label: 'Pill', value: '9999px' },
];

let loadedFont = '';

export function applyTheme(settings: Record<string, string>) {
  const root = document.documentElement;

  // Primary color + auto-derive focus (darker) and glow
  if (settings.primaryColor) {
    const primary = settings.primaryColor;
    const focus = darken(primary, 20);
    const { r, g, b } = hexToRgb(primary);
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-focus', focus);
    root.style.setProperty('--shadow-glow', `0 8px 24px -10px rgba(${r},${g},${b},0.65)`);
  }

  // Background color
  if (settings.backgroundColor) {
    root.style.setProperty('--color-bg', settings.backgroundColor);
    document.body.style.backgroundColor = settings.backgroundColor;
  }

  // Font family
  const font = settings.fontFamily || 'Inter';
  if (font !== loadedFont) {
    loadedFont = font;
    // Remove old font link
    const old = document.getElementById('theme-font-link');
    if (old) old.remove();
    // Add new font link
    const url = FONT_URLS[font];
    if (url && font !== 'Inter') { // Inter is already loaded
      const link = document.createElement('link');
      link.id = 'theme-font-link';
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
    root.style.setProperty('--font-sans', font);
    document.body.style.fontFamily = `'${font}', ui-sans-serif, system-ui, sans-serif`;
  }

  // Border radius for buttons
  if (settings.borderRadius) {
    root.style.setProperty('--radius-btn', settings.borderRadius);
  }
}
