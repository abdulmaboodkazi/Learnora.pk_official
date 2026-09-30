import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, HeartHandshake, Mail, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Free Nationwide Delivery</p>
              <p className="text-xs text-slate-400 mt-0.5">On all orders above Rs. 3,000</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Child-Safe & Certified</p>
              <p className="text-xs text-slate-400 mt-0.5">Non-toxic, EN-71 tested toys</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">7-Day Easy Returns</p>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free return policy</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-amber-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Cash on Delivery</p>
              <p className="text-xs text-slate-400 mt-0.5">Pay safely at your doorstep</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-slate-800 text-sm">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-900 font-extrabold flex items-center justify-center text-base">
                L
              </div>
              <span className="text-lg font-black tracking-tight text-white">Learnora</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Learnora is a modern family and children retail platform dedicated to educational toys,
              Montessori discovery, children books, clothing, and everyday learning essentials designed
              to make growing up memorable.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-xs font-semibold text-white mb-2">Join Family Club for 10% Off</p>
              {subscribed ? (
                <p className="text-xs text-emerald-400">Thank you for subscribing! Check your email for code.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter parent email..."
                    required
                    className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 text-xs font-semibold bg-amber-500 text-slate-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Categories</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('/category/educational-toys')} className="hover:text-white">Educational Toys</button></li>
              <li><button onClick={() => onNavigate('/category/building-blocks')} className="hover:text-white">Building Blocks</button></li>
              <li><button onClick={() => onNavigate('/category/stem-toys')} className="hover:text-white">STEM & Robotics</button></li>
              <li><button onClick={() => onNavigate('/category/dolls')} className="hover:text-white">Dolls & Dollhouses</button></li>
              <li><button onClick={() => onNavigate('/category/kids-books')} className="hover:text-white">Kids Books</button></li>
              <li><button onClick={() => onNavigate('/category/kids-clothing')} className="hover:text-white">Kids Clothing</button></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('/shipping')} className="hover:text-white">Shipping Information</button></li>
              <li><button onClick={() => onNavigate('/returns')} className="hover:text-white">Returns & Exchanges</button></li>
              <li><button onClick={() => onNavigate('/account/orders')} className="hover:text-white">Track Your Order</button></li>
              <li><button onClick={() => onNavigate('/faq')} className="hover:text-white">Help & FAQ</button></li>
              <li><button onClick={() => onNavigate('/contact')} className="hover:text-white">Contact Us</button></li>
            </ul>
          </div>

          {/* Trust & Company */}
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-4">About Learnora</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('/about')} className="hover:text-white">Our Story & Mission</button></li>
              <li><button onClick={() => onNavigate('/privacy')} className="hover:text-white">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('/terms')} className="hover:text-white">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('/gift-finder')} className="hover:text-white">Gift Recommender</button></li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Learnora Retail Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Cash on Delivery</span>
            <span>·</span>
            <span>Online Card Gateway</span>
            <span>·</span>
            <span>Direct Bank Deposit</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
