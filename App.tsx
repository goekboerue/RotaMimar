import React, { useState, useEffect } from 'react';
import InputWizard from './components/InputWizard';
import ItineraryView from './components/ItineraryView';
import ProfileModal from './components/ProfileModal';
import SavedTripsModal from './components/SavedTripsModal';
import { UserPreferences, TripItinerary, UserProfile } from './types';
import { generateItinerary } from './services/geminiService';
import { Compass, UserCircle, FolderOpen } from 'lucide-react';

const App: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Saved Trips State
  const [savedTrips, setSavedTrips] = useState<TripItinerary[]>([]);
  const [isSavedTripsModalOpen, setIsSavedTripsModalOpen] = useState(false);

  // Load profile and saved trips from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('rotaMimar_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }

    const savedTripsData = localStorage.getItem('rotaMimar_savedTrips');
    if (savedTripsData) {
      try {
        setSavedTrips(JSON.parse(savedTripsData));
      } catch (e) {
        console.error("Failed to parse saved trips", e);
      }
    }
  }, []);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('rotaMimar_profile', JSON.stringify(profile));
  };

  const handleCreateItinerary = async (preferences: UserPreferences) => {
    setLoading(true);
    setPrefs(preferences);
    setError(null);
    try {
      // Pass userProfile to the generator for personalized results
      const result = await generateItinerary(preferences, userProfile);
      setItinerary(result);
    } catch (err) {
      setError("Üzgünüz, rota oluşturulurken bir hata oluştu. Sunucu yoğun olabilir, lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrefs(null);
    setItinerary(null);
    setError(null);
  };

  // --- Saved Trips Logic ---

  const handleSaveTrip = (tripToSave: TripItinerary) => {
    // Check if already saved
    if (savedTrips.some(t => t.id === tripToSave.id)) return;

    const newSavedTrips = [tripToSave, ...savedTrips];
    setSavedTrips(newSavedTrips);
    localStorage.setItem('rotaMimar_savedTrips', JSON.stringify(newSavedTrips));
  };

  const handleDeleteTrip = (id: string) => {
    const newSavedTrips = savedTrips.filter(t => t.id !== id);
    setSavedTrips(newSavedTrips);
    localStorage.setItem('rotaMimar_savedTrips', JSON.stringify(newSavedTrips));
  };

  const handleLoadTrip = (trip: TripItinerary) => {
    setItinerary(trip);
    // Reconstruct simplified prefs for UI consistency if needed, 
    // but for now displaying the itinerary is enough
    setPrefs({
        city: "Kayıtlı Rota",
        days: trip.days.length,
        pace: userProfile?.defaultPace || "Dengeli" as any,
        interests: [],
        budget: "Bilinmiyor",
        companion: "Solo" as any
    });
  };

  const isCurrentTripSaved = itinerary ? savedTrips.some(t => t.id === itinerary.id) : false;

  return (
    <div className="min-h-screen flex flex-col">
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        currentProfile={userProfile}
        onSave={handleSaveProfile}
      />

      <SavedTripsModal
        isOpen={isSavedTripsModalOpen}
        onClose={() => setIsSavedTripsModalOpen(false)}
        savedTrips={savedTrips}
        onLoadTrip={handleLoadTrip}
        onDeleteTrip={handleDeleteTrip}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <Compass className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Rota<span className="text-emerald-600">Mimar</span></span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
               onClick={() => setIsSavedTripsModalOpen(true)}
               className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-indigo-100"
            >
               <FolderOpen size={18} />
               <span className="hidden sm:inline">Kayıtlı Rotalar</span>
               {savedTrips.length > 0 && (
                 <span className="bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                   {savedTrips.length}
                 </span>
               )}
            </button>

            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <UserCircle size={20} />
              <span className="hidden sm:inline">{userProfile ? userProfile.name : 'Profil'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-8 pb-12">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center justify-between shadow-sm">
             <span className="flex-1">{error}</span>
             <button onClick={() => setError(null)} className="ml-4 text-sm font-bold underline">Kapat</button>
          </div>
        )}

        {!itinerary ? (
          <div className="px-4">
            <div className="max-w-2xl mx-auto text-center mb-10 animate-fadeIn">
               <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                 Hayalindeki Tatili <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Mimar Gibi Tasarla</span>
               </h1>
               <p className="text-lg text-slate-600 max-w-lg mx-auto">
                 Sıradan listelerden sıkıldın mı? RotaMimar, senin tempona, zevklerine ve hava durumuna göre akıllı bir rota çizer.
               </p>
            </div>
            <InputWizard 
              onComplete={handleCreateItinerary} 
              isLoading={loading} 
              userProfile={userProfile}
            />
          </div>
        ) : (
          <ItineraryView 
            itinerary={itinerary} 
            onReset={handleReset} 
            onSave={handleSaveTrip}
            isSaved={isCurrentTripSaved}
          />
        )}
      </main>

      {/* Footer Signature */}
      <footer className="py-8 text-center bg-gradient-to-t from-slate-50 to-white border-t border-slate-100 mt-auto">
        <div className="flex flex-col items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-500">
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-1 font-medium">Crafted with Precision by</p>
          <div className="relative">
            <h2 className="text-3xl text-slate-800" style={{ fontFamily: '"Dancing Script", cursive' }}>
              Cafer Ahmet Koç
            </h2>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;