import React from 'react';
import { Award, Flame, HeartHandshake, ShieldCheck } from 'lucide-react';
import fudgeBrowniesImg from '../assets/images/product_fudge_brownies_1790352988145.jpg';

export const AboutStory: React.FC = () => {
  return (
    <section id="story" className="py-24 bg-[#141210] border-t border-[#24201c] text-[#f5f5f4] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#332d28] shadow-2xl">
              <img
                src={fudgeBrowniesImg}
                alt="Artisan Pastry Preparation at Cake House Erattupetta"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/90 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 bg-[#171412]/85 backdrop-blur-md border border-[#2d2722] rounded-xl">
                <div className="text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold">
                  Zero Premixes · 100% Scratch Recipes
                </div>
                <div className="font-serif text-sm font-semibold text-[#f5f5f4] mt-0.5">
                  Made with pure dairy butter &amp; Belgian couverture chocolate
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Story */}
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold mb-2">
              Our Erattupetta Bakehouse
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f5f5f4] mb-6 leading-tight text-balance">
              Where True Craftsmanship Meets Local Celebrations
            </h2>

            <div className="space-y-4 text-sm text-[#a8a29e] leading-relaxed">
              <p>
                Founded in Erattupetta, <strong className="text-[#f5f5f4]">Cake House</strong> was born from a simple belief: celebration cakes should taste just as heavenly as they look. While commercial bakeries rely on artificial whipped toppings and chemical cake gels, our kitchen operates on classical European patisserie principles.
              </p>
              <p>
                We source authentic 54% dark Callebaut chocolate, fresh farm dairy cream, pure Madagascar bourbon vanilla pods, and organic cashews from local Kerala orchards. Every order is baked from scratch only after you place your request—ensuring maximum moisture and exquisite crumb texture.
              </p>
            </div>

            {/* Three Pillars of Craft */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 mt-8 border-t border-[#26201b]">
              <div>
                <div className="font-serif text-lg font-bold text-[#f5f5f4] mb-1">
                  Pure Dairy Butter
                </div>
                <p className="text-xs text-[#78716c] leading-normal">
                  Zero vegetable shortening or hydrogenated palm oils in our cakes.
                </p>
              </div>

              <div>
                <div className="font-serif text-lg font-bold text-[#f5f5f4] mb-1">
                  Bespoke Decor
                </div>
                <p className="text-xs text-[#78716c] leading-normal">
                  Lambeth piping, Swiss meringue buttercream, and edible 24k gold leaf.
                </p>
              </div>

              <div>
                <div className="font-serif text-lg font-bold text-[#f5f5f4] mb-1">
                  Local Delivery
                </div>
                <p className="text-xs text-[#78716c] leading-normal">
                  Handled with AC vehicle transport across Erattupetta, Aruvithura, &amp; Pala.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
