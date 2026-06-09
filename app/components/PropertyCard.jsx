'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, Phone, MessageSquare, Share2, MapPin, Home, Sprout, LandPlot, Filter, X, ChevronLeft, ChevronRight, Flame, Shield, Languages, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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

function Carousel({ images, alt }) {
  const [idx, setIdx] = useState(0);
  const imgs = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200'];
  
  const next = (e) => { e.preventDefault(); e.stopPropagation(); setIdx((idx + 1) % imgs.length); };
  const prev = (e) => { e.preventDefault(); e.stopPropagation(); setIdx((idx - 1 + imgs.length) % imgs.length); };
  
  return (
    <div className="relative w-full h-40 sm:h-48 bg-slate-200 overflow-hidden group">
      <img src={imgs[idx]} alt={alt} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy" />
      {imgs.length > 1 && (
        <>
          <button aria-label="prev" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"><ChevronLeft className="w-4 h-4 text-black" /></button>
          <button aria-label="next" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition"><ChevronRight className="w-4 h-4 text-black" /></button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {imgs.map((_, i) => (<span key={i} className={`w-1.5 h-1.5 rounded-full ${i===idx?'bg-white':'bg-white/50'}`} />))}
          </div>
        </>
      )}
    </div>
  );
}

function PropertyCard({ p, saved, onToggleSave }) {
  const { t, tField, lang } = useLang();
  const title = tField(p.title);
  const desc = tField(p.description);
  const localityLabel = p.type === 'agriculture' ? tField(p, 'village') : tField(p, 'colony');

  const onCall = () => { window.location.href = `tel:${AGENT.phone}`; };
  
  const getShareText = () => {
    let areaText = '';
    if (p.type === 'agriculture') areaText = `${p.areaAcres || 0} acres`;
    else if (p.type === 'plot') areaText = `${p.areaSqYards || 0} sq.yd`;
    else if (p.type === 'house') areaText = `${p.plotArea || 0} sq.yd plot / ${p.builtUpArea || 0} sqft`;

    return `*${title}*\n📍 Place: ${localityLabel}, ${p.location}\n📐 Area: ${areaText}\n💰 Cost: ${formatINR(p.totalPrice)}`;
  };

  const getDynamicLink = () => typeof window !== 'undefined' ? `${window.location.origin}/property/${p.id}` : '';

  const onSMS = () => { window.location.href = `sms:${AGENT.phone}?body=${encodeURIComponent(getShareText() + '\n\n🔗 Link: ' + getDynamicLink())}`; };
  const onWhats = () => { window.open(`https://wa.me/${AGENT.whatsapp}?text=${encodeURIComponent(getShareText() + '\n\n🔗 Link: ' + getDynamicLink())}`, '_blank'); };
  
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success('Link copied to clipboard!');
      } else {
        // Fallback for insecure contexts or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  const onShare = async (e) => {
    if (e) e.preventDefault();

    const propertyUrl = getDynamicLink();
    const shareText = getShareText();
    const fullShareContent = `${shareText}\n\n🔗 Link: ${propertyUrl}`;

    // Check if Web Share API is available (mostly on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: propertyUrl,
        });
        // Successfully shared, no need to do anything else
        return;
      } catch (err) {
        // User cancelled the share dialog - AbortError
        if (err?.name === 'AbortError') {
          return;
        }
        // For other errors, fall back to clipboard
        console.warn('Web Share API failed:', err);
      }
    }

    // Fallback: Copy to clipboard (for desktop or unsupported browsers)
    await copyToClipboard(fullShareContent);
  };

  return (
    <Card className="overflow-hidden card-shadow border border-slate-200 rounded-xl bg-white flex flex-col h-full text-slate-900 shadow-lg">
      <div className="relative">
        <Link href={`/property/${p.id}`} className="block">
          <Carousel images={p.images} alt={title} />
        </Link>
        <div className="absolute top-2 left-2 flex gap-1.5 pointer-events-none">
          {p.hotDeal && <Badge className="bg-orange-500 text-white border-0 shadow text-[10px] px-1.5 py-0"><Flame className="w-2.5 h-2.5 mr-1" />{t('featured')}</Badge>}
          {p.sold && <Badge className="bg-red-600 text-white border-0 shadow text-[10px] px-1.5 py-0">{t('sold')}</Badge>}
        </div>
        <button onClick={(e) => { e.preventDefault(); onToggleSave(p.id); }} className="absolute top-2 right-2 bg-white/95 hover:bg-white rounded-full p-1.5 shadow-md transition z-10" aria-label="save">
          <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
        </button>
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <Badge variant="secondary" className="bg-white/95 text-slate-900 border-0 shadow-sm text-[10px] px-1.5 py-0">
            {p.type === 'agriculture' && <><Sprout className="w-2.5 h-2.5 mr-1 text-green-700" />{t('agriculture')}</>}
            {p.type === 'plot' && <><LandPlot className="w-2.5 h-2.5 mr-1 text-amber-600" />{t('plot')}</>}
            {p.type === 'house' && <><Home className="w-2.5 h-2.5 mr-1 text-blue-700" />{t('house')}</>}
          </Badge>
        </div>
      </div>

      <div className="p-3 space-y-2 flex-1 flex flex-col bg-white">
        <Link href={`/property/${p.id}`} className="block group">
          <h3 className="font-bold text-base leading-tight line-clamp-1 text-slate-900 group-hover:text-emerald-700 transition-colors">{title}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{localityLabel}, {p.location}</p>
        </Link>

        {/* Type-specific data block */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 grid grid-cols-2 gap-2 text-xs flex-1">
          {p.type === 'agriculture' && (
            <>
              <div><div className="text-[10px] text-slate-500">{t('village')}</div><div className="font-semibold text-slate-900 truncate">{tField(p, 'village')}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('totalArea')}</div><div className="font-semibold text-slate-900">{p.areaAcres} {t('acres')}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('costPerAcre')}</div><div className="font-semibold text-slate-900">{formatINR(p.pricePerAcre)}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('totalCost')}</div><div className="font-bold text-emerald-700">{formatINR(p.totalPrice)}</div></div>
            </>
          )}
          {p.type === 'plot' && (
            <>
              <div><div className="text-[10px] text-slate-500">{t('colony')}</div><div className="font-semibold text-slate-900 truncate">{tField(p, 'colony')}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('totalArea')}</div><div className="font-semibold text-slate-900">{p.areaSqYards} {t('sqYards')}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('costPerSqYard')}</div><div className="font-semibold text-slate-900">{formatINR(p.pricePerSqYard)}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('totalCost')}</div><div className="font-bold text-emerald-700">{formatINR(p.totalPrice)}</div></div>
            </>
          )}
          {p.type === 'house' && (
            <>
              <div><div className="text-[10px] text-slate-500">{t('colony')}</div><div className="font-semibold text-slate-900 truncate">{tField(p, 'colony')}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('bedrooms')}</div><div className="font-semibold text-slate-900">{p.bedrooms || '-'} {t('bhk')}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('plotArea')}</div><div className="font-semibold text-slate-900">{p.plotArea} {t('sqYards')}</div></div>
              <div><div className="text-[10px] text-slate-500">{t('builtUpArea')}</div><div className="font-semibold text-slate-900">{p.builtUpArea} {t('sqft')}</div></div>
              <div className="col-span-2"><div className="text-[10px] text-slate-500">{t('totalCost')}</div><div className="font-bold text-emerald-700 text-base">{formatINR(p.totalPrice)}</div></div>
            </>
          )}
        </div>

        {desc && <p className="text-xs text-slate-600 line-clamp-2">{desc}</p>}

        {/* Sticky action footer */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 mt-auto bg-white">
          <Button onClick={onCall} variant="outline" className="flex flex-col h-auto py-1.5 px-0 border-green-200 bg-white hover:bg-green-50 hover:border-green-400"><Phone className="w-4 h-4 text-green-700" /><span className="text-[9px] mt-1 text-slate-700">{t('call')}</span></Button>
          <Button onClick={onSMS} variant="outline" className="flex flex-col h-auto py-1.5 px-0 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-400"><MessageSquare className="w-4 h-4 text-blue-700" /><span className="text-[9px] mt-1 text-slate-700">{t('sms')}</span></Button>
          <Button onClick={onWhats} variant="outline" className="flex flex-col h-auto py-1.5 px-0 border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-400"><WhatsAppIcon className="w-4 h-4 text-emerald-600" /><span className="text-[9px] mt-1 text-slate-700">{t('whatsapp')}</span></Button>
          <Button onClick={onShare} variant="outline" className="flex flex-col h-auto py-1.5 px-0 border-purple-200 bg-white hover:bg-purple-50 hover:border-purple-400"><Share2 className="w-4 h-4 text-purple-700" /><span className="text-[9px] mt-1 text-slate-700">{t('share')}</span></Button>
        </div>
      </div>
    </Card>
  );
}

function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return (
    <Select value={lang} onValueChange={setLang}>
      <SelectTrigger className="w-[120px] h-9 bg-white/20 hover:bg-white/30 border-white/30 text-white transition-colors">
        <Languages className="w-4 h-4 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white border-gray-200 shadow-xl z-[9999] text-slate-900">
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="te">తెలుగు</SelectItem>
        <SelectItem value="hi">हिन्दी</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function HomePage() {
  const { t, lang } = useLang();
  const { properties, loaded } = usePropertyStore();
  const { saved, toggle, isSaved } = useSaved();

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('Nalgonda');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');
  const [showSaved, setShowSaved] = useState(false);

  const filtered = useMemo(() => {
    let list = [...properties];
    if (showSaved) list = list.filter((p) => saved.includes(p.id));
    if (location && location !== 'all') list = list.filter((p) => p.location === location);
    if (type !== 'all') list = list.filter((p) => p.type === type);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const t1 = (p.title?.en || '') + ' ' + (p.title?.te || '') + ' ' + (p.title?.hi || '');
        const t2 = (p.village || '') + ' ' + (p.colony || '') + ' ' + (p.location || '');
        return (t1 + ' ' + t2).toLowerCase().includes(q);
      });
    }
    if (sort === 'price_asc') list.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
    else if (sort === 'price_desc') list.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
    else list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  }, [properties, location, type, sort, search, showSaved, saved]);

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center text-white drop-shadow-md">Loading...</div>;
  }

  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      
      {/* 1. Global Fixed Background Image */}
      <div className="fixed inset-0 z-[-1] bg-[url('/nalgonda-es.png')] bg-cover bg-center bg-no-repeat bg-fixed"></div>

      {/* 2. Hero Section */}
      <header className="text-white w-full aspect-[30/9] min-h-[250px] flex flex-col justify-between relative z-10">
        
        {/* Soft gradient exclusively for the top header so the logo/search bar remains readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 pointer-events-none z-0"></div>
        
        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center border border-white/20 shadow-sm">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg leading-tight drop-shadow-md">{t('appName')}</h1>
              <p className="text-[11px] text-white/90 hidden sm:block drop-shadow-sm">Nalgonda • Telangana</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <Link href="/admin"><Button size="sm" variant="secondary" className="bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-sm"><Shield className="w-4 h-4 mr-1" />{t('admin')}</Button></Link>
          </div>
        </div>
        
        <div className="container mx-auto px-4 flex-1 flex flex-col justify-end pb-6 pt-4 relative z-10">
          <h2 className="text-xl sm:text-3xl font-extrabold leading-tight max-w-2xl drop-shadow-lg">{t('tagline')}</h2>
          
          <div className="mt-4 bg-black/50 backdrop-blur-md border border-white/20 rounded-2xl p-1.5 flex items-center gap-2 shadow-2xl max-w-2xl">
            <div className="flex items-center gap-2 px-3 flex-1">
              <Search className="w-4 h-4 text-white/90" />
              <Input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder={t('search')} 
                className="border-0 focus-visible:ring-0 text-sm px-0 shadow-none text-white placeholder:text-white/80 bg-transparent" 
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-4 text-sm transition-all shadow-md">
                  <Filter className="w-4 h-4 mr-1.5" />{t('filters')}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md bg-white text-gray-900">
                <SheetHeader><SheetTitle>{t('filters')}</SheetTitle></SheetHeader>
                <div className="py-6 space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">{t('location')}</label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-xl z-[9999] text-slate-900">
                        <SelectItem value="all">{t('allLocations')}</SelectItem>
                        {LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block">{t('sortBy')}</label>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 shadow-xl z-[9999] text-slate-900">
                        <SelectItem value="newest">{t('newest')}</SelectItem>
                        <SelectItem value="price_asc">{t('priceLowToHigh')}</SelectItem>
                        <SelectItem value="price_desc">{t('priceHighToLow')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={() => { setLocation('Nalgonda'); setType('all'); setSort('newest'); setSearch(''); }} className="w-full text-slate-900"><X className="w-4 h-4 mr-2" />{t('clearFilters')}</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* 3. Main Content Wrapper */}
      <main className="flex-1 flex flex-col z-10 relative">

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-lg border-b border-white/10 py-3 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Tabs value={type} onValueChange={setType} className="w-full sm:w-auto">
                <TabsList className="bg-black/40 backdrop-blur-sm p-1 h-10 grid grid-cols-4 w-full sm:flex sm:w-auto rounded-lg border border-white/10 shadow-inner">
                  <TabsTrigger value="all" className="px-3 data-[state=active]:bg-white data-[state=active]:text-black text-white/90 rounded-md text-xs sm:text-sm">{t('all')}</TabsTrigger>
                  <TabsTrigger value="agriculture" className="px-2 data-[state=active]:bg-white data-[state=active]:text-black text-white/90 text-xs sm:text-sm rounded-md"><Sprout className="w-3.5 h-3.5 mr-1" />{t('agriculture')}</TabsTrigger>
                  <TabsTrigger value="plot" className="px-2 data-[state=active]:bg-white data-[state=active]:text-black text-white/90 text-xs sm:text-sm rounded-md"><LandPlot className="w-3.5 h-3.5 mr-1" />{t('plot')}</TabsTrigger>
                  <TabsTrigger value="house" className="px-2 data-[state=active]:bg-white data-[state=active]:text-black text-white/90 text-xs sm:text-sm rounded-md"><Home className="w-3.5 h-3.5 mr-1" />{t('house')}</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button variant={showSaved ? 'default' : 'outline'} onClick={() => setShowSaved(!showSaved)} className="h-9 px-3 bg-white text-slate-900 text-xs shadow-sm border-0 hover:bg-slate-50">
                  <Heart className={`w-3.5 h-3.5 mr-1 ${showSaved ? 'fill-current text-red-500' : ''}`} />{showSaved ? t('savedListings') : t('saved')} ({saved.length})
                </Button>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="w-[130px] h-9 text-xs bg-white text-slate-900 shadow-sm border-0"><MapPin className="w-3.5 h-3.5 mr-1" /><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-xl z-[9999] text-slate-900">
                    <SelectItem value="all" className="text-xs">{t('allLocations')}</SelectItem>
                    {LOCATIONS.map((l) => <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[140px] h-9 text-xs bg-white text-slate-900 shadow-sm border-0"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-xl z-[9999] text-slate-900">
                    <SelectItem value="newest" className="text-xs">{t('newest')}</SelectItem>
                    <SelectItem value="price_asc" className="text-xs">{t('priceLowToHigh')}</SelectItem>
                    <SelectItem value="price_desc" className="text-xs">{t('priceHighToLow')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid Section */}
        <section className="container mx-auto px-4 pt-6 pb-16">
          <p className="text-sm text-white drop-shadow-md mb-4 font-medium">{t('showing')} <span className="font-bold text-white">{filtered.length}</span> {t('properties')}</p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-white drop-shadow-md">
              <p className="mb-3 text-lg font-medium">{showSaved ? t('noSaved') : t('noResults')}</p>
              <Button className="bg-white text-black hover:bg-gray-100 shadow-lg" onClick={() => { setLocation('all'); setType('all'); setSearch(''); setShowSaved(false); }}>{t('clearFilters')}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <PropertyCard key={p.id} p={p} saved={isSaved(p.id)} onToggleSave={toggle} />
              ))}
            </div>
          )}
        </section>

        <footer className="container mx-auto px-4 pb-8 border-t border-white/20 pt-6 text-center text-xs text-white/80 drop-shadow-md font-medium mt-auto">
          <p>{AGENT.name} • {AGENT.phone}</p>
          <p className="mt-1">{t('poweredBy')}</p>
        </footer>
      </main>

    </div>
  );
}
