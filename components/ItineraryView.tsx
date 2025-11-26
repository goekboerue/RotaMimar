import React, { useState } from 'react';
import { TripItinerary, Activity } from '../types';
import { Clock, Navigation, Sparkles, CloudRain, Users, CalendarCheck, Share2, Check, Bookmark, BookmarkCheck, Coffee, Utensils, Star } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import SchematicMap from './SchematicMap';

interface ItineraryViewProps {
  itinerary: TripItinerary;
  onReset: () => void;
  onSave: (itinerary: TripItinerary) => void;
  isSaved: boolean;
}

interface ActivityCardProps {
  item: Activity;
  isRaining: boolean;
  onToggleRainPlan: (id: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ item, isRaining, onToggleRainPlan }) => {
  const getCrowdColor = (level?: string) => {
    switch(level) {
      case 'Low': return 'bg-green-100 text-green-700';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Very High': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getCrowdLabel = (level?: string) => {
    switch(level) {
      case 'Low': return 'Sakin';
      case 'Moderate': return 'Normal';
      case 'High': return 'Kalabalık';
      case 'Very High': return 'Çok Yoğun';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="relative pl-8 pb-8 border-l-2 border-slate-200 last:border-0 group">
      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 group-hover:scale-125 transition-transform"></div>
      
      <div className={`bg-white rounded-xl p-5 shadow-sm border transition-all duration-300 ${
          isRaining ? 'border-blue-300 bg-blue-50' : 'border-slate-100 hover:shadow-md'
      }`}>
        <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
           <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                <Clock size={12} /> {item.time}
              </span>
              {item.isHiddenGem && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                  <Sparkles size={12} /> Gizli Cevher
                </span>
              )}
              {item.specialEvent && (
                 <span className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                   <CalendarCheck size={12} /> {item.specialEvent}
                 </span>
              )}
           </div>
           
           <div className="flex items-center gap-2">
             {item.crowdLevel && (
               <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${getCrowdColor(item.crowdLevel)}`}>
                 <Users size={10} /> {getCrowdLabel(item.crowdLevel)}
               </span>
             )}
             <div className="text-slate-400 text-xs font-medium">{item.estimatedCost}</div>
           </div>
        </div>

        <h4 className="text-lg font-bold text-slate-800 mb-1">
          {isRaining && item.rainAlternative ? `(Yağmur Planı) ${item.rainAlternative}` : item.name}
        </h4>
        
        {item.openingHours && !isRaining && (
          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse"></span>
             Açık: {item.openingHours}
          </div>
        )}
        
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-slate-200">
           <div className="flex gap-2">
              {item.rainAlternative && (
                <button 
                  onClick={() => onToggleRainPlan(item.id)}
                  className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isRaining ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600'}`}
                >
                  <CloudRain size={14} />
                  {isRaining ? 'Normal Plana Dön' : 'Yağmur B Planı'}
                </button>
              )}
           </div>
           {/* Note: In a real app, this would open Google Maps */}
           <a 
             href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name)}`}
             target="_blank" 
             rel="noreferrer"
             className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1"
           >
             Haritada Gör <Navigation size={14} />
           </a>
        </div>
      </div>
    </div>
  );
};

const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary, onReset, onSave, isSaved }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showRainPlan, setShowRainPlan] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);

  const currentDayPlan = itinerary.days.find(d => d.dayNumber === selectedDay);

  const toggleRainPlan = (activityId: string) => {
    setShowRainPlan(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  const handleShare = async () => {
    const url = window.location.origin;
    const shareText = `🌍 RotaMimar ile harika bir seyahat planı oluşturdum: "${itinerary.tripName}"\n\n📝 Özet: ${itinerary.summary}\n\n🚀 Sen de kendi kişisel seyahat asistanınla hayalindeki tatili tasarla: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RotaMimar Seyahat Planım',
          text: shareText,
          url: url,
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const statsData = [
    { subject: 'Kültür', A: itinerary.stats.cultureScore, fullMark: 100 },
    { subject: 'Doğa', A: itinerary.stats.natureScore, fullMark: 100 },
    { subject: 'Lezzet', A: itinerary.stats.foodScore, fullMark: 100 },
    { subject: 'Dinlenme', A: itinerary.stats.relaxationScore, fullMark: 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div className="flex-1">
          <button onClick={onReset} className="text-sm text-slate-500 hover:text-emerald-600 mb-2 transition-colors">← Yeni Plan</button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{itinerary.tripName}</h1>
            <div className="flex items-center gap-2">
              <div className="bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100">
                  <span className="font-bold text-slate-800">{itinerary.days.length} Gün</span>
              </div>
              
              <button 
                onClick={() => onSave(itinerary)}
                disabled={isSaved}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border transition-all ${
                  isSaved
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 cursor-default'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md'
                }`}
              >
                {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isSaved ? 'Kaydedildi' : 'Kaydet'}
              </button>

              <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border transition-all ${
                  isCopied 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
              >
                {isCopied ? <Check size={16} /> : <Share2 size={16} />}
                {isCopied ? 'Kopyalandı!' : 'Paylaş'}
              </button>
            </div>
          </div>
          <p className="text-slate-600 mt-2 max-w-2xl text-lg">{itinerary.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Day Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {itinerary.days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedDay === day.dayNumber
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {day.dayNumber}. Gün
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                {selectedDay}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Günün Teması</h3>
                <p className="text-emerald-600 font-medium">{currentDayPlan?.theme}</p>
              </div>
            </div>

            <div className="space-y-2">
               <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Coffee size={16}/> Sabah
               </h4>
               {currentDayPlan?.morning.map((act, i) => (
                 <ActivityCard 
                   key={i} 
                   item={act} 
                   isRaining={!!showRainPlan[act.id]} 
                   onToggleRainPlan={toggleRainPlan} 
                 />
               ))}
               
               <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 mt-8 flex items-center gap-2">
                  <Utensils size={16}/> Öğleden Sonra
               </h4>
               {currentDayPlan?.afternoon.map((act, i) => (
                 <ActivityCard 
                   key={i} 
                   item={act} 
                   isRaining={!!showRainPlan[act.id]} 
                   onToggleRainPlan={toggleRainPlan} 
                 />
               ))}

               <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 mt-8 flex items-center gap-2">
                  <Star size={16}/> Akşam
               </h4>
               {currentDayPlan?.evening.map((act, i) => (
                 <ActivityCard 
                   key={i} 
                   item={act} 
                   isRaining={!!showRainPlan[act.id]} 
                   onToggleRainPlan={toggleRainPlan} 
                 />
               ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visuals & Stats */}
        <div className="space-y-6">
          {/* Map Visualization */}
          <SchematicMap days={itinerary.days} selectedDay={selectedDay} />

          {/* Stats Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h4 className="font-bold text-slate-800 mb-4">Rota Analizi</h4>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={statsData}>
                   <PolarGrid stroke="#e2e8f0" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar
                     name="Skor"
                     dataKey="A"
                     stroke="#10b981"
                     strokeWidth={2}
                     fill="#10b981"
                     fillOpacity={0.2}
                   />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
             <p className="text-center text-xs text-slate-500 mt-2">
                Bu rota {itinerary.stats.relaxationScore > 60 ? 'dinlendirici' : 'yoğun'} bir tempoya ve 
                {itinerary.stats.cultureScore > 60 ? ' yüksek kültürel' : ' dengeli'} içeriğe sahiptir.
             </p>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
             <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
               <Sparkles className="text-yellow-300" /> Pro İpucu
             </h4>
             <p className="text-indigo-100 text-sm leading-relaxed">
               Rotanızı takip ederken "Hidden Gem" (Gizli Cevher) işaretli yerleri kaçırmayın. Ayrıca "Doluluk" ikonlarını kontrol ederek kalabalıktan kaçınabilirsiniz.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItineraryView;