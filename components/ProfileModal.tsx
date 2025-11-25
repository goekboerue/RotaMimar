import React, { useState, useEffect } from 'react';
import { UserProfile, Pace } from '../types';
import { INTERESTS, PACE_OPTIONS, BUDGET_OPTIONS } from '../constants';
import { X, Save, User, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentProfile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    bio: '',
    savedInterests: [],
    defaultPace: Pace.BALANCED,
    defaultBudget: 'Orta Seviye'
  });

  useEffect(() => {
    if (currentProfile) {
      setFormData(currentProfile);
    }
  }, [currentProfile]);

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      savedInterests: prev.savedInterests.includes(id)
        ? prev.savedInterests.filter(i => i !== id)
        : [...prev.savedInterests, id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <User className="text-emerald-600 w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Profil Düzenle</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adınız</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Seyahatsever"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Biyografi / Seyahat Notları</label>
              <textarea
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-20 resize-none"
                placeholder="Örn: Tarihi yerleri severim, kahve molalarına bayılırım..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Favori İlgi Alanları</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      formData.savedInterests.includes(interest.id)
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {interest.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Varsayılan Tempo</label>
                <select
                  value={formData.defaultPace}
                  onChange={e => setFormData({...formData, defaultPace: e.target.value as Pace})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                >
                  {PACE_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Genel Bütçe</label>
                <select
                  value={formData.defaultBudget}
                  onChange={e => setFormData({...formData, defaultBudget: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                >
                  {BUDGET_OPTIONS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-all"
            >
              <Save size={18} />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;