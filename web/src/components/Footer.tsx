import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

interface FooterProps {
  settings: Record<string, string>;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              {settings?.storeLogo ? (
                <img src={settings.storeLogo} alt="Logo" className="h-8" />
              ) : (
                <span>Qurion Tech</span>
              )}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your trusted source for premium electronic components, robotics parts, and DIY engineering kits. We empower makers to build the future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 group">
                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-primary after:rounded-full">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li><a href="#/" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Home</a></li>
              <li><a href="#/products" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Shop All</a></li>
              <li><a href="#/about" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> About Us</a></li>
              <li><a href="#/contact" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Contact Us</a></li>
              <li><a href="#/blog" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Blog</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-primary after:rounded-full">
              Customer Care
            </h3>
            <ul className="space-y-3">
              <li><a href="#/account" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> My Account</a></li>
              <li><a href="#/track-order" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Track Order</a></li>
              <li><a href="#/wishlist" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Wishlist</a></li>
              <li><a href="#/shipping-policy" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Shipping Policy</a></li>
              <li><a href="#/returns" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3 text-slate-500" /> Returns & Refunds</a></li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-primary after:rounded-full">
              Contact Us
            </h3>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm">123 Tech Park, Innovation Street, Bangalore, India - 560001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">support@qurion.tech</span>
              </li>
            </ul>

            <h4 className="text-white font-semibold mb-3 text-sm">Subscribe to Newsletter</h4>
            <form className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="bg-slate-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary w-full text-sm border border-slate-700"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-focus text-white px-4 py-2 rounded-r-lg transition-colors font-medium"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} {settings?.storeName || 'Qurion Tech'}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Payment Icons Placeholder */}
            <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="w-10 h-6 bg-slate-700 rounded"></div>
              <div className="w-10 h-6 bg-slate-700 rounded"></div>
              <div className="w-10 h-6 bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
