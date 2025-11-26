import React from 'react';
import { TripItinerary } from '../types';
import { X, Calendar, MapPin, Trash2, ArrowRight, FolderOpen } from 'lucide-react';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: TripItinerary[];
  onLoadTrip: (trip: TripItinerary) => void;
  onDeleteTrip: (id: string) => void;
}

const SavedTripsModal: React.FC<SavedTripsModalProps> = ({ 
  isOpen, 
  onClose, 
  savedTrips, 
  onLoadTrip, 
  onDeleteTrip 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[80vh]">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FolderOpen className="text-indigo-600 w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Kayıtlı Rotalarım</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {savedTrips.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-500">Henüz kayıtlı bir rotanız yok.</p>
              <p className="text-sm mt-1">Harika bir plan oluşturun ve "Kaydet" butonuna tıklayın.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedTrips.map((trip) => (
                <div key={trip.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">
                        {trip.tripName}
                      </h4>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-1">{trip.summary}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(trip.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {trip.days.length} Gün
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => { onLoadTrip(trip); onClose(); }}
                        className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                      >
                        Aç <ArrowRight size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteTrip(trip.id); }}
                        className="flex items-center justify-center gap-1 text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        <Trash2 size={14} /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 shrink-0">
          Kayıtlı rotalar tarayıcınızda saklanır.
        </div>
      </div>
    </div>
  );
};

export default SavedTripsModal;