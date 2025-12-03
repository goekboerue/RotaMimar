import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserPreferences, TripItinerary, UserProfile } from "../types";

// --- Helper Functions ---

// Safely retrieve API Key from various environment configurations
const getApiKey = (): string | undefined => {
  // 1. Try Vite / Modern Browsers (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      const val = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
      if (val) return val;
    }
  } catch (e) { /* ignore */ }

  // 2. Try Node/Webpack/Next.js/CRA (process.env)
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || 
             process.env.REACT_APP_API_KEY || 
             process.env.NEXT_PUBLIC_API_KEY || 
             process.env.VITE_API_KEY;
    }
  } catch (e) { /* ignore */ }

  return undefined;
};

// Robust JSON parser for AI responses
const cleanAndParseJSON = (text: string) => {
    try {
        // Remove markdown code blocks
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Find the first '{' and last '}' to extract just the JSON object
        const start = cleanText.indexOf('{');
        const end = cleanText.lastIndexOf('}');
        
        if (start === -1 || end === -1) {
            throw new Error("Valid JSON object not found in response");
        }
        
        cleanText = cleanText.substring(start, end + 1);
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error. Raw Text:", text, e);
        return null;
    }
}

// Browser-compatible UUID generator
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers or non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// --- Main Service ---

export const generateItinerary = async (prefs: UserPreferences, userProfile?: UserProfile | null): Promise<TripItinerary> => {
  // 1. API Key Check with robust getter
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Anahtarı bulunamadı. Lütfen Vercel ayarlarında 'API_KEY', 'VITE_API_KEY' veya 'REACT_APP_API_KEY' değişkenlerinden birini tanımlayın.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  let profileContext = "";
  if (userProfile) {
    profileContext = `
      Kullanıcı Profili Bağlamı:
      - Ad: ${userProfile.name}
      - İlgi Alanları: ${userProfile.savedInterests.join(', ')}
      - Biyografi: ${userProfile.bio}
      Lütfen bu kişisel detayları rotaya yansıt.
    `;
  }

  let fixedActivityContext = "";
  if (prefs.fixedActivity) {
      const slotMap = { 'morning': 'Sabah', 'afternoon': 'Öğleden Sonra', 'evening': 'Akşam' };
      fixedActivityContext = `
      KRİTİK GÖREV: Kullanıcı özellikle ${slotMap[prefs.fixedActivity.timeSlot]} vaktinde "${prefs.fixedActivity.name}" aktivitesini yapmak istiyor.
      - Bu aktivite için şehirdeki EN İYİ mekanı/parkuru/yeri seç (Örn: Koşu ise güzel bir parkur, Masaj ise iyi bir spa).
      - Günün geri kalanını bu aktiviteye göre planla (Örn: Spordan sonra duş/kahvaltı imkanı, Masajdan sonra rahat bir yemek vb.).
      - Bu aktiviteyi programda mutlaka göster.
      `;
  }

  const prompt = `
    Kullanıcı Tercihleri:
    Şehir: ${prefs.city}
    Süre: ${prefs.days} Gün
    Tempo: ${prefs.pace}
    Grup: ${prefs.companion}
    İlgi Alanları: ${prefs.interests.join(', ')}
    Bütçe: ${prefs.budget}

    ${profileContext}

    ${fixedActivityContext}

    Lütfen yukarıdaki kriterlere uygun, JSON formatında bir seyahat rotası oluştur.
  `;

  // System instructions define the persona and output format strictly
  const systemInstruction = `
    Sen RotaMimar, dünyaca ünlü bir seyahat planlayıcısısın. Görevin verilen kriterlere göre MÜKEMMEL JSON formatında yanıt üretmektir.
    Başka hiçbir metin veya açıklama yazma. Sadece JSON.

    Kurallar:
    1. Mekanları lojistik sıraya göre diz.
    2. 'crowdLevel' (Low, Moderate, High, Very High) tahmin et.
    3. 'coordinates' (x, y) 0-100 arasında ver.
    4. "type" şunlardan biri olmalı: 'sightseeing', 'food', 'rest', 'work', 'activity'.
    
    Beklenen JSON Şeması:
    {
      "tripName": "Tur İsmi",
      "summary": "Özet",
      "stats": { "cultureScore": 0-100, "natureScore": 0-100, "foodScore": 0-100, "relaxationScore": 0-100 },
      "days": [
        {
          "dayNumber": 1,
          "theme": "Tema",
          "morning": [ { "id": "uuid", "name": "Ad", "time": "09:00", "type": "sightseeing", "description": "Kısa açıklama", "isHiddenGem": boolean, "rainAlternative": "Alt plan", "estimatedCost": "€", "openingHours": "09:00-18:00", "crowdLevel": "Low", "coordinates": {"x": 10, "y": 10} } ],
          "afternoon": [],
          "evening": []
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.4,
        // Disable strict safety filters for travel content (e.g. nightlife, history wars)
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      },
    });

    const text = response.text;
    if (!text) throw new Error("API'den boş yanıt döndü.");

    const data = cleanAndParseJSON(text);
    if (!data) throw new Error("AI yanıtı JSON formatında değil.");
    
    // Add Client-Side Metadata
    const itinerary = data as TripItinerary;
    itinerary.id = generateUUID();
    itinerary.createdAt = Date.now();
    
    return itinerary;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return a more user-friendly error message if available
    throw new Error(error.message || "Rota oluşturulurken bilinmeyen bir hata oluştu.");
  }
};