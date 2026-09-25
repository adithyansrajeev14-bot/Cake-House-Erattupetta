import React, { useState, useEffect } from 'react';
import { Star, Camera } from 'lucide-react';
import { adminStore } from '../lib/adminStore';

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState(() => adminStore.getReviews());
  const [gallery, setGallery] = useState(() => adminStore.getGallery());

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setReviews(adminStore.getReviews());
      setGallery(adminStore.getGallery());
    });
    return unsub;
  }, []);

  return (
    <section id="reviews" className="py-20 bg-[#12100e] text-[#f5f5f4] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Testimonials Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold mb-2">
            Local Celebration Stories
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#f5f5f4] mb-3">
            Cherished by Families Across Erattupetta
          </h2>
          <p className="text-sm text-[#a8a29e]">
            Honored to bake the sweet centerpieces for your birthdays, weddings, baptisms, and festive gatherings.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 bg-[#181512] border border-[#2c2621] rounded-2xl flex flex-col justify-between hover:border-[#d4af37]/40 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1 mb-4 text-[#d4af37]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#d4af37]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#d6d3d1] leading-relaxed italic">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-6 border-t border-[#26201b] mt-6">
                <div className="font-serif font-bold text-sm text-[#f5f5f4]">{rev.name}</div>
                <div className="text-[11px] text-[#a8a29e] mt-0.5">{rev.occasion}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Gallery Section */}
        {gallery.length > 0 && (
          <div className="pt-10 border-t border-[#26201b]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-1">
                  <Camera className="w-4 h-4" />
                  <span>Celebration Gallery</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#f5f5f4]">
                  Recent Bakes from Our Kitchen
                </h3>
              </div>
              <span className="text-xs text-[#78716c]">Bespoke orders crafted in Erattupetta</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {gallery.map(item => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-[#181512] border border-[#2a241f] hover:border-[#d4af37]/60 transition-all"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="text-[10px] text-[#d4af37] uppercase font-semibold">{item.category}</span>
                    <span className="text-xs font-medium text-[#f5f5f4] line-clamp-1">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
