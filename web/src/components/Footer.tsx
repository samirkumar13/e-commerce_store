import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';

interface FooterProps {
  settings: Record<string, string>;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  const storeName = settings?.storeName || 'Our Store';
  const storeEmail = settings?.storeEmail || '';
  const storePhone = settings?.storePhone || '';
  const storeAddress = settings?.storeAddress || '';
  const storeDescription = settings?.storeDescription || '';

  const socialLinks = [
    { url: settings?.facebookUrl, icon: Facebook, label: 'Facebook', hover: 'hover:bg-blue-600' },
    { url: settings?.twitterUrl, icon: Twitter, label: 'Twitter', hover: 'hover:bg-sky-500' },
    { url: settings?.instagramUrl, icon: Instagram, label: 'Instagram', hover: 'hover:bg-pink-600' },
    { url: settings?.linkedinUrl, icon: Linkedin, label: 'LinkedIn', hover: 'hover:bg-blue-700' },
    { url: settings?.youtubeChannel, icon: Youtube, label: 'YouTube', hover: 'hover:bg-red-600' },
  ].filter(s => s.url);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Column 1: Store Info */}
          <div>
            <div className="mb-6">
              {settings?.storeLogo ? (
                <img src={getImageUrl(settings.storeLogo)} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                <h3 className="text-xl font-bold text-white">{storeName}</h3>
              )}
            </div>
            {storeDescription && (
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{storeDescription}</p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center ${social.hover} hover:text-white transition-all duration-300 group`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-primary after:rounded-full">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li><a href="#/" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Home</a></li>
              <li><a href="#/products" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Shop All</a></li>
              <li><a href="#/categories" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Categories</a></li>
              <li><a href="#/brands" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Brands</a></li>
              <li><a href="#/blogs" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Blog</a></li>
            </ul>
          </div>

          {/* Column 3: My Account */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-primary after:rounded-full">
              My Account
            </h3>
            <ul className="space-y-3">
              <li><a href="#/account" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> My Account</a></li>
              <li><a href="#/cart" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Cart</a></li>
              <li><a href="#/wishlist" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Wishlist</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-primary after:rounded-full">
              Contact Us
            </h3>
            <ul className="space-y-4 mb-8">
              {storeAddress && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{storeAddress}</span>
                </li>
              )}
              {storePhone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <a href={`tel:${storePhone}`} className="text-sm hover:text-primary transition-colors">{storePhone}</a>
                </li>
              )}
              {storeEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a href={`mailto:${storeEmail}`} className="text-sm hover:text-primary transition-colors">{storeEmail}</a>
                </li>
              )}
              {!storeAddress && !storePhone && !storeEmail && (
                <li className="text-sm text-slate-500 italic">Update contact info in Admin → Settings</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
