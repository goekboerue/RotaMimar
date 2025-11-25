import React, { useState, useEffect } from 'react';
import { UserPreferences, Pace, Companion, UserProfile } from '../types';
import { INTERESTS, PACE_OPTIONS, COMPANION_OPTIONS, BUDGET_OPTIONS } from '../constants';
import { MapPin, Calendar, Wallet, Check, ChevronRight, Loader2, Sparkles } from 'lucide-react';

interface InputWizardProps {
  onComplete: (prefs: UserPreferences) => void;
  isLoading: boolean;
  userProfile: UserProfile | null;
}

const InputWizard: React.FC<InputWizardProps> = ({ onComplete, isLoading, userProfile }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    city: '',
    days: 3,
    pace: Pace.BALANCED,
    interests: [],
    budget: 'Orta Seviye',
    companion: Companion.COUPLE
  });

  // Effect to auto-fill defaults if not yet set by user
  useEffect(() => {
    if (userProfile && step === 1 && prefs.city === '') {
       // Optional: We could autofill here, but a button is better UX for control
    }
  }, [userProfile]);

  const fillFromProfile = () => {
    if (!userProfile) return;
    setPrefs(prev => ({
      ...prev,
      interests: userProfile.savedInterests,
      pace: userProfile.defaultPace,
      budget: userProfile.defaultBudget
    }));
    // Visual feedback could be added here
  };

  const handleInterestToggle = (id: string) => {
    setPrefs(prev => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...prev.interests, id]
    }));
  };

  const nextStep = () => setStep(s => s + 1);
  
  const isStep1Valid = prefs.city.length > 2 && prefs.days > 0;
  const isStep2Valid = prefs.interests.length > 0;

  const handleSubmit = () => {
    onComplete(prefs);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="text-emerald-500 w-8 h-8 animate-bounce" />
          </div>
        </div>
        <h3 className="mt-8 text-2xl font-bold text-slate-800">RotaMimar Çalışıyor</h3>
        <p className="text-slate-500 mt-2 max-w-md">
          {userProfile ? `${userProfile.name} için ` : ''} 
          Yapay zeka asistanımız {prefs.city} rotasını, güncel doluluk oranlarını ve etkinlikleri analiz ederek hazırlıyor...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 relative">
      {/* Profile Auto-fill Badge */}
      {userProfile && step === 1 && (
        <button 
          onClick={fillFromProfile}
          className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors z-10"
        >
          <Sparkles size={14} />
          Profilden Doldur
        </button>
      )}

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 w-full">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Nereye gidiyoruz?</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Şehir / Bölge</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={prefs.city}
                    onChange={(e) => setPrefs({ ...prefs, city: e.target.value })}
                    placeholder="Örn: İstanbul, Roma, Kapadokya"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Kaç Gün?</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={prefs.days}
                    onChange={(e) => setPrefs({ ...prefs, days: parseInt(e.target.value) || 1 })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-3">Yol Arkadaşı Profili</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COMPANION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPrefs({ ...prefs, companion: opt.value })}
                      className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${
                        prefs.companion === opt.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!isStep1Valid}
                onClick={nextStep}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
              >
                Sonraki <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">İlgi Alanları</h2>
                <p className="text-slate-500">Sana en uygun yerleri seçebilmemiz için neleri sevdiğini seç.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {INTERESTS.map((interest) => {
                const Icon = interest.icon;
                const isSelected = prefs.interests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    onClick={() => handleInterestToggle(interest.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-medium">{interest.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800">Geri</button>
              <button
                disabled={!isStep2Valid}
                onClick={nextStep}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-medium disabled:opacity-50 hover:bg-emerald-600 transition-colors"
              >
                Sonraki <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800">Son Dokunuşlar</h2>
            
            <div>
              <label className="block text-lg font-medium text-slate-800 mb-3">Seyahat Temposu</label>
              <div className="space-y-3">
                {PACE_OPTIONS.map((pace) => (
                  <button
                    key={pace.value}
                    onClick={() => setPrefs({ ...prefs, pace: pace.value })}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                      prefs.pace === pace.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${prefs.pace === pace.value ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {pace.label}
                      </div>
                      <div className="text-sm text-slate-500">{pace.desc}</div>
                    </div>
                    {prefs.pace === pace.value && <Check className="text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-slate-800 mb-3">Bütçe Tercihi</label>
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
                {BUDGET_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPrefs({ ...prefs, budget: opt })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      prefs.budget === opt
                        ? 'bg-white shadow text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-slate-100">
              <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800">Geri</button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all"
              >
                Rotayı Oluştur <Wallet size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputWizard;