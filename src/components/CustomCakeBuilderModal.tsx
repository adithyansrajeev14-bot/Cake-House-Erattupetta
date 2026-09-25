import React, { useState } from 'react';
import { X, Check, Upload, Calendar, Clock, Sparkles, MessageCircle, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { buildWhatsAppLink } from '../lib/orderServices';
import heroCakeImg from '../assets/images/hero_artisanal_cake_1790352959380.jpg';
import belgianTruffleImg from '../assets/images/product_belgian_truffle_1790352976029.jpg';

const FLAVORS = [
  { id: 'belgian-truffle', name: 'Signature Belgian Chocolate Ganache', desc: '54% Callebaut dark chocolate, rich & velvety', basePrice: 950 },
  { id: 'red-velvet', name: 'Velvet Ruby & Cream Cheese Frosting', desc: 'Authentic Philadelphia cream cheese layers', basePrice: 920 },
  { id: 'lotus-biscoff', name: 'Lotus Biscoff Spiced Caramel Crunch', desc: 'Caramelized Belgian speculoos spread & crumb', basePrice: 980 },
  { id: 'pistachio-rose', name: 'Persian Pistachio & Rose Cardamom', desc: 'Crushed Iranian pistachios and organic damask rose', basePrice: 1100 },
  { id: 'vanilla-bean', name: 'Madagascar Vanilla Bean & Fresh Berries', desc: 'Pure bourbon vanilla sponge with berry compote', basePrice: 880 },
  { id: 'black-forest', name: 'Black Forest Royale with Marasca Cherries', desc: 'Dutch cocoa, whipped cream & imported sour cherries', basePrice: 850 },
];

const WEIGHTS = [
  { label: '500g (Half Kg)', multiplier: 1, servings: '4-6 guests', badge: 'Intimate' },
  { label: '1 kg', multiplier: 1.85, servings: '8-12 guests', badge: 'Most Popular' },
  { label: '1.5 kg', multiplier: 2.7, servings: '14-18 guests', badge: 'Family' },
  { label: '2 kg (Two-Tier Option)', multiplier: 3.5, servings: '18-24 guests', badge: 'Celebration' },
  { label: '3 kg (Grand Two-Tier)', multiplier: 5.2, servings: '30-40 guests', badge: 'Grand Wedding' },
];

const STYLES = [
  { id: 'vintage-lambeth', name: 'Vintage Lambeth Piping', desc: 'Intricate royal piping frills, Victorian heritage charm, edible pearls' },
  { id: 'korean-minimal', name: 'Minimalist Korean Aesthetic', desc: 'Clean pastel palette, modern lettering, organic texture' },
  { id: 'gold-leaf-luxury', name: '24k Gold Leaf & Dark Ganache', desc: 'Opulent dark drip with gold foil sheets and macaron crowns' },
  { id: 'floral-elegance', name: 'Fresh Botanical & Floral', desc: 'Food-safe pressed florals, rosemary twigs, and delicate buttercream' },
  { id: 'celebration-drip', name: 'Classic Chocolate Drip & Berries', desc: 'Cascading Belgian ganache with fresh figs, blackberries, and curls' },
];

const TIME_SLOTS = [
  '10:00 AM - 1:00 PM (Morning Slot)',
  '1:00 PM - 4:00 PM (Afternoon Slot)',
  '4:00 PM - 7:00 PM (Evening Celebration)',
  '7:00 PM - 9:00 PM (Night Party)',
];

export const CustomCakeBuilderModal: React.FC = () => {
  const { isCustomBuilderOpen, closeCustomBuilder, addToCart } = useCart();

  const [step, setStep] = useState(1);
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]);
  const [selectedWeight, setSelectedWeight] = useState(WEIGHTS[1]); // 1 kg default
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [cakeMessage, setCakeMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState(TIME_SLOTS[2]);
  const [isEggless, setIsEggless] = useState(false);
  const [referenceImagePreview, setReferenceImagePreview] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  if (!isCustomBuilderOpen) return null;

  // Calculate dynamic estimated price
  const estimatedPrice = Math.round(selectedFlavor.basePrice * selectedWeight.multiplier + (isEggless ? 50 : 0));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleInspiration = (img: string, styleId: string) => {
    setReferenceImagePreview(img);
    setReferenceFileName('inspiration-sample.jpg');
    const matchedStyle = STYLES.find(s => s.id === styleId);
    if (matchedStyle) setSelectedStyle(matchedStyle);
  };

  const handleWhatsAppSend = () => {
    let msg = `🎂 *BESPOKE CUSTOM CAKE INQUIRY: Cake House Erattupetta*\n`;
    msg += `─────────────────────────\n`;
    msg += `*Customer:* ${customerName || 'Celebration Customer'}\n`;
    if (phone) msg += `*Phone:* ${phone}\n`;
    msg += `*Date Needed:* ${deliveryDate || 'Please check availability'}\n`;
    msg += `*Preferred Slot:* ${deliverySlot}\n\n`;
    msg += `*CUSTOM SPECIFICATIONS:*\n`;
    msg += `• *Flavor:* ${selectedFlavor.name}\n`;
    msg += `• *Size/Weight:* ${selectedWeight.label} (${selectedWeight.servings})\n`;
    msg += `• *Theme/Design Style:* ${selectedStyle.name}\n`;
    if (cakeMessage) msg += `• *Inscription:* "${cakeMessage}"\n`;
    msg += `• *Dietary:* ${isEggless ? '100% Eggless' : 'Regular'}\n`;
    if (referenceFileName) msg += `• *Reference Photo:* Attached / provided (${referenceFileName})\n`;
    if (specialNotes) msg += `• *Notes:* ${specialNotes}\n`;
    msg += `\n*Estimated Base Amount:* ₹${estimatedPrice.toLocaleString('en-IN')}\n`;
    msg += `─────────────────────────\n`;
    msg += `_Please let me know if this slot is available for baking!_`;

    window.open(buildWhatsAppLink(msg), '_blank');
  };

  const handleAddToCart = () => {
    addToCart({
      productId: 'custom-bespoke-cake',
      title: `Custom ${selectedStyle.name}`,
      category: 'custom-cakes',
      unitPrice: estimatedPrice,
      totalPrice: estimatedPrice,
      quantity: 1,
      image_url: referenceImagePreview || heroCakeImg,
      selectedWeight: selectedWeight.label,
      selectedFlavor: selectedFlavor.name,
      customMessage: cakeMessage.trim() || undefined,
      isEggless,
      candles: true,
    });
    closeCustomBuilder();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#171412] border border-[#332d28] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-[#f5f5f4]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2d2722] flex items-center justify-between bg-[#141210]">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Cake Atelier</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#f5f5f4]">
              Build Your Custom Celebration Cake
            </h2>
          </div>
          <button
            onClick={closeCustomBuilder}
            className="p-2 text-[#a8a29e] hover:text-[#f5f5f4] bg-[#221e1a] rounded-full transition-colors border border-[#332d28]"
            aria-label="Close builder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-[#1a1714] px-6 py-3 border-b border-[#2d2722] flex items-center justify-between overflow-x-auto no-scrollbar gap-4 text-xs">
          {[
            { num: 1, name: 'Flavor' },
            { num: 2, name: 'Weight' },
            { num: 3, name: 'Theme & Style' },
            { num: 4, name: 'Date & Photo' },
            { num: 5, name: 'Estimate & Confirm' },
          ].map(s => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-[#d4af37] font-bold'
                    : isDone
                    ? 'text-[#f5f5f4]'
                    : 'text-[#78716c]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums ${
                    isCurrent
                      ? 'bg-[#d4af37] text-[#12100e]'
                      : isDone
                      ? 'bg-[#332d28] text-[#f5f5f4]'
                      : 'bg-[#25201b] text-[#78716c]'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </span>
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>

        {/* Step Content Body */}
        <div className="p-6 overflow-y-auto max-h-[64vh]">
          {/* STEP 1: FLAVOR SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#f5f5f4]">Step 1: Choose Your Base Flavor</h3>
                <p className="text-xs text-[#a8a29e]">
                  All sponge layers are soaked with Madagascar vanilla syrup and filled with premium couverture ganache or real whipped cream cheese.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {FLAVORS.map(f => {
                  const isSelected = selectedFlavor.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFlavor(f)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-sm'
                          : 'border-[#2d2722] bg-[#1a1714] hover:border-[#3e3731]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-sm text-[#f5f5f4]">{f.name}</div>
                        {isSelected && <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-xs text-[#a8a29e] mt-1">{f.desc}</p>
                      <div className="text-xs font-bold text-[#d4af37] mt-3 tabular-nums">
                        Base: ₹{f.basePrice} / 500g
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Eggless toggle */}
              <div className="pt-4 border-t border-[#2d2722]">
                <label className="flex items-center justify-between p-3.5 bg-[#1a1714] border border-[#2d2722] rounded-xl cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-[#f5f5f4]">100% Pure Vegetarian Eggless Sponge</div>
                    <div className="text-[11px] text-[#a8a29e]">Baked with condensed milk and yogurt for identical moist crumb</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEggless}
                    onChange={e => setIsEggless(e.target.checked)}
                    className="accent-[#d4af37] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: WEIGHT & SERVINGS */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#f5f5f4]">Step 2: Select Cake Weight &amp; Tier</h3>
                <p className="text-xs text-[#a8a29e]">
                  Estimates based on generous 100g celebration cake slices. Two-tier designs are available from 2 kg upwards.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {WEIGHTS.map(w => {
                  const isSelected = selectedWeight.label === w.label;
                  const estimated = Math.round(selectedFlavor.basePrice * w.multiplier + (isEggless ? 50 : 0));
                  return (
                    <div
                      key={w.label}
                      onClick={() => setSelectedWeight(w)}
                      className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/10'
                          : 'border-[#2d2722] bg-[#1a1714] hover:border-[#3e3731]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#d4af37] bg-[#d4af37]' : 'border-[#443c34]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#12100e]" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#f5f5f4] flex items-center gap-2">
                            <span>{w.label}</span>
                            <span className="text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded">
                              {w.badge}
                            </span>
                          </div>
                          <div className="text-xs text-[#78716c] mt-0.5">Suitable for: {w.servings}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#78716c]">Est. Price</div>
                        <div className="font-serif text-base font-bold text-[#d4af37] tabular-nums">
                          ₹{estimated.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: THEME & STYLE */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#f5f5f4]">Step 3: Design Theme &amp; Piping Style</h3>
                <p className="text-xs text-[#a8a29e]">
                  Our master decorators handcraft every swirl, pearl, and gold accent.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {STYLES.map(s => {
                  const isSelected = selectedStyle.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStyle(s)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#d4af37] bg-[#d4af37]/10'
                          : 'border-[#2d2722] bg-[#1a1714] hover:border-[#3e3731]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-sm text-[#f5f5f4]">{s.name}</div>
                        {isSelected && <Check className="w-4 h-4 text-[#d4af37] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#a8a29e] mt-1.5 leading-relaxed">{s.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Inscription text */}
              <div className="pt-4 border-t border-[#2d2722]">
                <label className="block text-xs font-semibold text-[#f5f5f4] uppercase tracking-wider mb-2">
                  Cake Message / Name / Number
                </label>
                <input
                  type="text"
                  placeholder='e.g., "Happy 25th Birthday Rhea", "Forever & Always", "Ayaan Turns 1"'
                  value={cakeMessage}
                  maxLength={60}
                  onChange={e => setCakeMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a1714] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: DATE, TIME & REFERENCE IMAGE */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#f5f5f4]">Step 4: Delivery Date &amp; Reference Photo</h3>
                <p className="text-xs text-[#a8a29e]">
                  Please allow at least 24–48 hours advance booking so we can bake, chill, and hand-pipe your custom cake to perfection.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#d6d3d1] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Date Needed *</span>
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d6d3d1] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Delivery / Pickup Slot</span>
                  </label>
                  <select
                    value={deliverySlot}
                    onChange={e => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference Image Upload & Preset Inspiration */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#d6d3d1] mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Upload Reference Image (Pinterest / Instagram / Photo)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-[#3e3731] hover:border-[#d4af37]/60 rounded-xl bg-[#141210]">
                  {referenceImagePreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-[#332d28]">
                      <img
                        src={referenceImagePreview}
                        alt="Reference Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setReferenceImagePreview(null);
                          setReferenceFileName('');
                        }}
                        className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-[#1a1714] flex flex-col items-center justify-center text-[#78716c] shrink-0 border border-[#2a241f]">
                      <Upload className="w-5 h-5 text-[#a8a29e] mb-1" />
                      <span className="text-[10px]">No image</span>
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left">
                    <label className="inline-block px-4 py-2 text-xs font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg cursor-pointer transition-colors">
                      <span>Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-[#78716c] mt-1.5">
                      {referenceFileName ? `Selected: ${referenceFileName}` : 'JPG, PNG or WEBP up to 10MB'}
                    </p>
                  </div>
                </div>

                {/* Inspiration Presets */}
                <div className="mt-3">
                  <div className="text-[11px] text-[#a8a29e] mb-1.5">Or pick from our signature styles:</div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSampleInspiration(heroCakeImg, 'vintage-lambeth')}
                      className="text-[11px] px-2.5 py-1 bg-[#1a1714] hover:bg-[#25201b] border border-[#2d2722] rounded text-[#d6d3d1]"
                    >
                      Vintage Lambeth Inspiration
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSampleInspiration(belgianTruffleImg, 'gold-leaf-luxury')}
                      className="text-[11px] px-2.5 py-1 bg-[#1a1714] hover:bg-[#25201b] border border-[#2d2722] rounded text-[#d6d3d1]"
                    >
                      Belgian Gold Drip
                    </button>
                  </div>
                </div>
              </div>

              {/* Special notes */}
              <div>
                <label className="block text-xs font-semibold text-[#d6d3d1] mb-1.5">
                  Special Instructions or Dietary Notes
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  placeholder="e.g., Less sugar, nut allergy, specific pastel lavender color tone, delivery to Aruvithura church hall..."
                  className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          )}

          {/* STEP 5: ESTIMATE & CONFIRM */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-[#f5f5f4]">Step 5: Review Summary &amp; Order</h3>
                <p className="text-xs text-[#a8a29e]">
                  Confirm your bespoke cake inquiry. You can send it directly to our baker's WhatsApp for instant confirmation, or add it to your shopping bag to checkout online.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-[#141210] border border-[#2d2722] rounded-xl space-y-3">
                <div className="flex items-start justify-between pb-3 border-b border-[#241e1a]">
                  <div>
                    <div className="font-serif text-lg font-bold text-[#f5f5f4]">{selectedFlavor.name}</div>
                    <div className="text-xs text-[#d4af37] font-medium">{selectedStyle.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#78716c]">Estimated Base</div>
                    <div className="font-serif text-xl font-bold text-[#d4af37] tabular-nums">
                      ₹{estimatedPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#78716c]">Weight &amp; Servings:</span>
                    <div className="text-[#f5f5f4] font-medium">{selectedWeight.label} ({selectedWeight.servings})</div>
                  </div>
                  <div>
                    <span className="text-[#78716c]">Dietary:</span>
                    <div className="text-[#f5f5f4] font-medium">{isEggless ? '100% Eggless' : 'Regular Dairy'}</div>
                  </div>
                  <div>
                    <span className="text-[#78716c]">Required Date:</span>
                    <div className="text-[#f5f5f4] font-medium">{deliveryDate || 'To be confirmed with baker'}</div>
                  </div>
                  <div>
                    <span className="text-[#78716c]">Time Slot:</span>
                    <div className="text-[#f5f5f4] font-medium">{deliverySlot}</div>
                  </div>
                  {cakeMessage && (
                    <div className="col-span-2">
                      <span className="text-[#78716c]">Inscription:</span>
                      <div className="text-[#d4af37] font-medium italic">"{cakeMessage}"</div>
                    </div>
                  )}
                  {referenceFileName && (
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-[#78716c]">Photo Reference:</span>
                      <span className="text-xs text-[#d6d3d1]">{referenceFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#d6d3d1] mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Rhea Thomas"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#d6d3d1] mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="e.g., +91 98471 23456"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1714] border border-[#2d2722] rounded-lg text-xs text-[#f5f5f4] placeholder-[#78716c] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleWhatsAppSend}
                  className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-[#25d366] bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/40 rounded-xl transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Inquiry via WhatsApp</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-xl transition-all shadow-md active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Custom Cake to Bag</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 border-t border-[#2d2722] bg-[#141210] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#a8a29e] hover:text-[#f5f5f4] bg-[#1a1714] rounded-lg border border-[#2d2722] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-[#78716c]">Est. Base:</span>
              <span className="ml-1.5 font-serif text-sm font-bold text-[#d4af37] tabular-nums">
                ₹{estimatedPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-[#141210] bg-[#d4af37] hover:bg-[#e2be53] rounded-lg transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
