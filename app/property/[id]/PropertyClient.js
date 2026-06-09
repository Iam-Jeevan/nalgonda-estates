'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Heart, Phone, MessageSquare, Share2, MapPin, 
  Home, Sprout, LandPlot, ChevronLeft, ChevronRight, Flame, 
  Maximize2, Ruler, IndianRupee, BedDouble, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLang } from '@/lib/LanguageContext';
import { usePropertyStore, useSaved } from '@/lib/usePropertyStore';
import { LOCATIONS, AGENT, formatINR } from '@/lib/properties';
import { toast } from 'sonner';

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.667 5.455l-.999 3.648 3.821-1.802zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
    </svg>
  );
}

function FeatureCard({ icon, label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-center transition-colors hover:bg-emerald-50/50 hover:border-emerald-100">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-bold text-slate-900 truncate" title={value}>{value}</div>
    </div>
  );
}

export default function PropertyDetailsPage({ params }) {
  const { id } = params;
  const { t, tField } = useLang();
  const { properties, loaded } = usePropertyStore();
  const { saved, toggle, isSaved } = useSaved();
  
  const [idx, setIdx] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!loaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const p = properties.find((x) => x.id === id);
  
  if (!p) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Property Not Found</h2>
        <Link href="/"><Button className="rounded-xl shadow-md">Return to Home</Button></Link>
      </div>
    );
  }

  const title = tField(p.title);
  const desc = tField(p.description);
  const localityLabel = p.type === 'agriculture' ? tField(p, 'village') : tField(p, 'colony');
  const imgs = p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200'];
  const isBookmarked = isSaved(p.id);

  const getShareText = () => {
    let areaText = '';
    if (p.type === 'agriculture') areaText = `${p.areaAcres || 0} acres`;
    else if (p.type === 'plot') areaText = `${p.areaSqYards || 0} sq.yd`;
    else if (p.type === 'house') areaText = `${p.plotArea || 0} sq.yd plot / ${p.builtUpArea || 0} sqft`;

    return `*${title}*\n📍 Place: ${localityLabel}, ${p.location}\n📐 Area: ${areaText}\n💰 Cost: ${formatINR(p.totalPrice)}`;
  };

  const propertyUrl = typeof window !== 'undefined' ? window.location.href : '';

  const onCall = () => { window.location.href = `tel:${AGENT.phone}`; };
  const onSMS = () => { window.location.href = `sms:${AGENT.phone}?body=${encodeURIComponent(getShareText() + '\n\n🔗 Link: ' + propertyUrl)}`; };
  const onWhats = () => { window.open(`https://wa.me/${AGENT.whatsapp}?text=${encodeURIComponent(getShareText() + '\n\n🔗 Link: ' + propertyUrl)}`, '_blank'); };

  const onShare = async () => {
    const shareText = getShareText();
    // Bundle the URL directly into the text body
    const fullText = `${shareText}\n\n🔗 Link: ${propertyUrl}`;

    // 1. Median Native App
    if (typeof window !== 'undefined' && window.median && window.median.share) {
      window.median.share.sharePage({ url: propertyUrl, text: shareText });
      return;
    }

    // 2. Standard Web Share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: fullText, 
          // OMITTING 'url' parameter so WhatsApp doesn't discard the text block
        });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    // 3. Fallback to Clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success('Link copied to clipboard!');
    } catch (e) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 sm:py-8 pb-28">
      
      {/* Main Container */}
      <main className="max-w-4xl mx-auto bg-white sm:rounded-[2rem] sm:shadow-2xl overflow-hidden relative">
        
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
          <Link href="/">
            <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md border border-white/30 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => toggle(p.id)} className="bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md border border-white/30 transition-all">
            <Heart className={`w-5 h-5 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Hero Image Section */}
        <div className="relative w-full h-[40vh] sm:h-[55vh] bg-slate-100 group cursor-pointer" onClick={() => setIsFullScreen(true)}>
          <img src={imgs[idx]} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute bottom-6 left-6 flex gap-2">
            {p.hotDeal && <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg text-sm px-3 py-1.5 rounded-lg"><Flame className="w-4 h-4 mr-1.5" />{t('featured')}</Badge>}
            {p.sold && <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg text-sm px-3 py-1.5 rounded-lg">{t('sold')}</Badge>}
          </div>

          <div className="absolute bottom-6 right-6 bg-black/40 hover:bg-black/60 transition-colors backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg border border-white/20">
            <Maximize2 className="w-4 h-4" /> View Gallery ({idx + 1}/{imgs.length})
          </div>

          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + imgs.length) % imgs.length); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white rounded-full p-3 backdrop-blur-sm transition opacity-0 group-hover:opacity-100"><ChevronLeft className="w-6 h-6" /></button>
              <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % imgs.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 text-white rounded-full p-3 backdrop-blur-sm transition opacity-0 group-hover:opacity-100"><ChevronRight className="w-6 h-6" /></button>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 rounded-md px-2.5 py-1">
                  {p.type === 'agriculture' && <><Sprout className="w-3.5 h-3.5 mr-1" />{t('agriculture')}</>}
                  {p.type === 'plot' && <><LandPlot className="w-3.5 h-3.5 mr-1" />{t('plot')}</>}
                  {p.type === 'house' && <><Home className="w-3.5 h-3.5 mr-1" />{t('house')}</>}
                </Badge>
                <span className="text-slate-500 font-medium text-sm flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400" /> {localityLabel}, {p.location}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h1>
            </div>
            
            <div className="md:text-right bg-emerald-50/50 md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-none border-emerald-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Asking Price</p>
              <div className="text-4xl font-extrabold text-emerald-600 tracking-tight">{formatINR(p.totalPrice)}</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">Property Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {p.type === 'agriculture' && (
              <>
                <FeatureCard icon={<Ruler className="w-4 h-4" />} label={t('totalArea')} value={`${p.areaAcres} ${t('acres')}`} />
                <FeatureCard icon={<IndianRupee className="w-4 h-4" />} label={t('costPerAcre')} value={formatINR(p.pricePerAcre)} />
              </>
            )}
            {p.type === 'plot' && (
              <>
                <FeatureCard icon={<Ruler className="w-4 h-4" />} label={t('totalArea')} value={`${p.areaSqYards} ${t('sqYards')}`} />
                <FeatureCard icon={<IndianRupee className="w-4 h-4" />} label={t('costPerSqYard')} value={formatINR(p.pricePerSqYard)} />
              </>
            )}
            {p.type === 'house' && (
              <>
                <FeatureCard icon={<BedDouble className="w-4 h-4" />} label={t('bedrooms')} value={`${p.bedrooms || '-'} ${t('bhk')}`} />
                <FeatureCard icon={<LandPlot className="w-4 h-4" />} label={t('plotArea')} value={`${p.plotArea} ${t('sqYards')}`} />
                <FeatureCard icon={<Home className="w-4 h-4" />} label={t('builtUpArea')} value={`${p.builtUpArea} ${t('sqft')}`} />
              </>
            )}
          </div>

          {desc && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 whitespace-pre-wrap">
                {desc}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative sm:bottom-auto bg-white/90 sm:bg-slate-50 backdrop-blur-xl sm:backdrop-blur-none border-t sm:border-t-0 p-4 sm:p-6 sm:px-10 z-40 sm:rounded-b-[2rem]">
          <div className="flex gap-2 sm:gap-4 max-w-4xl mx-auto">
            <Button onClick={onCall} className="flex-1 bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl shadow-[0_8px_16px_rgba(22,163,74,0.2)] transition-all hover:-translate-y-0.5">
              <Phone className="w-5 h-5 mr-2" />
              <span className="font-semibold text-base">{t('call')}</span>
            </Button>
            <Button onClick={onSMS} variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 h-14 rounded-2xl transition-all hover:-translate-y-0.5 bg-white">
              <MessageSquare className="w-5 h-5 mr-2" />
              <span className="font-semibold text-base hidden sm:inline">{t('sms')}</span>
            </Button>
            <Button onClick={onWhats} variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-14 rounded-2xl transition-all hover:-translate-y-0.5 bg-white">
              <WhatsAppIcon className="w-5 h-5 sm:mr-2" />
              <span className="font-semibold text-base hidden sm:inline">{t('whatsapp')}</span>
            </Button>
            <Button onClick={onShare} variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 h-14 rounded-2xl transition-all hover:-translate-y-0.5 bg-white">
              <Share2 className="w-5 h-5 sm:mr-2" />
              <span className="font-semibold text-base hidden sm:inline">{t('share')}</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Full Screen Image Viewer Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-lg" onClick={() => setIsFullScreen(false)}>
          <button onClick={() => setIsFullScreen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-50">
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={imgs[idx]} 
            alt="Fullscreen" 
            className="w-full h-full object-contain cursor-default" 
            onClick={(e) => e.stopPropagation()} 
          />
          
          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + imgs.length) % imgs.length); }} className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors"><ChevronLeft className="w-8 h-8" /></button>
              <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % imgs.length); }} className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 transition-colors"><ChevronRight className="w-8 h-8" /></button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 px-5 py-3 rounded-full border border-white/10 backdrop-blur-md">
                {imgs.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} className={`h-2.5 rounded-full transition-all ${i === idx ? 'bg-white w-8' : 'bg-white/40 w-2.5 hover:bg-white/80'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
