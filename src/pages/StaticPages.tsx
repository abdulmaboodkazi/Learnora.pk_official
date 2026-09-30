import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Mail, Phone, MapPin, CheckCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface StaticPageProps {
  type: 'about' | 'contact' | 'faq' | 'shipping' | 'returns' | 'privacy' | 'terms' | '404';
  onNavigate: (route: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ type, onNavigate }) => {
  const { showToast } = useNotifications();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    showToast('Your message has been received! Our support team will reply within 4 hours.', 'success');
  };

  // 404 NOT FOUND VIEW
  if (type === '404') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <span className="text-6xl font-black text-amber-500">404</span>
        <h1 className="text-2xl font-extrabold text-slate-900">Oops! This page went missing.</h1>
        <p className="text-xs text-slate-500">
          The toy, category or document you were looking for doesn't exist or has moved.
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  // ABOUT US
  if (type === 'about') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Our Story</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Nurturing Curiosity, Creativity & Family Bonds
          </h1>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          <p>
            Founded with a dedication to purposeful childhood play, <strong>Learnora</strong> bridges
            the gap between mindful Montessori development and exciting modern imagination. We
            believe playtime is never just recreation—it is the foundation of cognitive reasoning,
            emotional balance, and joyful discovery.
          </p>
          <p>
            While our flagship collection centers on heirloom beechwood toys, STEM robotics kits, and
            developmental puzzles, our architecture is built to serve modern families across every
            milestone: children's literature, organic playwear, sensory nursery items, and school
            supplies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm">Certified Safe</h3>
            <p className="text-xs text-slate-500 mt-1">
              Every item is tested for zero lead, zero formaldehyde, and EN-71 toy safety compliance.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm">Sustainable Materials</h3>
            <p className="text-xs text-slate-500 mt-1">
              Crafted with sustainably sourced FSC beechwood, food-grade silicone, and organic cotton.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80">
            <h3 className="font-bold text-slate-900 text-sm">Nationwide Care</h3>
            <p className="text-xs text-slate-500 mt-1">
              Swift delivery to Karachi, Lahore, Islamabad, and 120+ cities with Cash on Delivery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CONTACT US
  if (type === 'contact') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Get In Touch</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            We're Here for You & Your Family
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Have questions about an order, safety certificate, or age recommendation?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Direct Contact Channels
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-600" />
                <span>support@learnora.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-600" />
                <span>+92 21 3584 9200 (Mon–Sat, 9AM–7PM PKT)</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Commercial Block 4, Clifton, Karachi, Pakistan</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              Send Us a Message
            </h3>
            {contactSent ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-4 rounded-xl font-semibold">
                Thank you! Your message has been sent. We will reply shortly.
              </p>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FAQ
  if (type === 'faq') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-slate-500 mt-1">Helpful answers about orders, safety, and shipping.</p>
        </div>

        <div className="space-y-4 text-xs">
          {[
            {
              q: 'Do you offer Cash on Delivery across Pakistan?',
              a: 'Yes! We offer reliable Cash on Delivery (COD) to all major cities including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar, and hundreds of regional areas.',
            },
            {
              q: 'What is your Free Shipping policy?',
              a: 'All orders with a subtotal of Rs. 3,000 or more qualify automatically for Free Nationwide Standard Delivery.',
            },
            {
              q: 'Are the materials safe for toddlers who mouth toys?',
              a: 'Absolutely. Our wooden toys are coated exclusively with non-toxic, certified water-based food-grade stains, and silicone items are 100% FDA food-grade and BPA-free.',
            },
            {
              q: 'How does Bank Transfer payment work?',
              a: 'When you choose Direct Bank Transfer, our Meezan Bank account details will be shown on the checkout screen. After making your transfer via ATM or online app, simply enter your transaction reference number to begin dispatch.',
            },
            {
              q: 'What if a toy arrives damaged or incomplete?',
              a: 'We offer a 7-day hassle-free return and exchange policy. Simply log in to your account, click on your order, and submit a return request or contact our team directly.',
            },
          ].map((item, idx) => (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200/80 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{item.q}</span>
              </h3>
              <p className="text-slate-600 pl-6 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // SHIPPING & RETURNS & PRIVACY & TERMS
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
        {type === 'shipping' && 'Shipping & Delivery Policy'}
        {type === 'returns' && '7-Day Return & Refund Policy'}
        {type === 'privacy' && 'Privacy Policy'}
        {type === 'terms' && 'Terms of Service'}
      </h1>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
        {type === 'shipping' && (
          <>
            <p><strong>Standard Delivery:</strong> Rs. 200 (FREE on orders over Rs. 3,000).</p>
            <p><strong>Delivery Timeframe:</strong> 2 to 4 business days for major metropolitan hubs; 3 to 6 days for remote regions.</p>
            <p><strong>Courier Partners:</strong> Deliveries are securely managed via TCS, Leopard, and Call Courier with real-time SMS tracking updates.</p>
          </>
        )}

        {type === 'returns' && (
          <>
            <p>We want your family to be 100% delighted with every purchase. If you receive a product that is defective, damaged in transit, or different from expected, you may request a return within 7 calendar days of receipt.</p>
            <p>Items must be in original condition with product packaging intact.</p>
            <p>Refunds are processed promptly to your original payment method or through store credit.</p>
          </>
        )}

        {type === 'privacy' && (
          <>
            <p>Learnora takes family data privacy with utmost seriousness. We never sell, rent, or distribute personal information to third-party advertising networks.</p>
            <p>We do not store complete credit card or payment credential information on our servers; transactions are tokenized via audited payment gateway providers.</p>
          </>
        )}

        {type === 'terms' && (
          <>
            <p>By using the Learnora platform, customers agree to comply with our commercial terms of service, payment policies, and age-appropriateness advisories.</p>
            <p>All prices are listed in Pakistani Rupees (PKR) and inclusive of statutory duties.</p>
          </>
        )}
      </div>
    </div>
  );
};
