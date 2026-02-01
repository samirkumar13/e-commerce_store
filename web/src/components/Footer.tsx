
import React from 'react';
import Container from './UIElements/Container';

interface FooterProps {
  settings: Record<string, string>;
}

const Footer: React.FC<FooterProps> = ({ settings }) => {
  const storeName = settings.storeName || 'Circuit Hub';
  const description = settings.storeAddress || 'Your source for electronic components.';

  return (
    <footer className="bg-slate-900 text-slate-400 mt-20">
      <Container>
        <div className="py-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <a href="#/" className="text-2xl font-bold text-white">{storeName}</a>
            <p className="text-sm mt-2">{description}</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex space-x-6">
                <a href="#/" className="text-sm hover:text-white transition-colors">Home</a>
                <a href="#/cart" className="text-sm hover:text-white transition-colors">Cart</a>
                <a href="#/account" className="text-sm hover:text-white transition-colors">My Account</a>
            </div>
             <div className="flex space-x-4">
              <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><TwitterIcon /></a>
              <a href="#" aria-label="GitHub" className="hover:text-white transition-colors"><GitHubIcon /></a>
            </div>
          </div>
        </div>
        <div className="py-6 border-t border-slate-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
};

// Social Icons
const TwitterIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085 4.93 4.93 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>;
const GitHubIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"></path></svg>;

export default Footer;
