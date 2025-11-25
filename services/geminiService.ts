import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserPreferences, TripItinerary, UserProfile } from "../types";

const parseJSON = (text: string) => {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) return null;
        const jsonStr = text.substring(start, end + 1);
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return null;
    }
}

export const generateItinerary = async (prefs: UserPreferences, userProfile?: UserProfile | null): Promise<TripItinerary> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const activitySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING },
      time: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['sightseeing', 'food', 'rest', 'work', 'activity'] },
      description: { type: Type.STRING },
      isHiddenGem: { type: Type.BOOLEAN },
      rainAlternative: { type: Type.STRING },
      estimatedCost: { type: Type.STRING },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          x: { type: Type.NUMBER, description: "Relative X coordinate 0-100" },
          y: { type: Type.NUMBER, description: "Relative Y coordinate 0-100" }
        }
      },
      openingHours: { type: Type.STRING, description: "Typical opening hours e.g., '09:00 - 18:00'" },
      crowdLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Very High'], description: "Estimated crowd level at this time" },
      specialEvent: { type: Type.STRING, description: "Any fictional or real special event happening (e.g., 'Jazz Night')" }
    },
    required: ["id", "name", "time", "type", "description", "isHiddenGem", "estimatedCost", "coordinates", "crowdLevel"]
  };

  const dayPlanSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      dayNumber: { type: Type.INTEGER },
      theme: { type: Type.STRING },
      morning: { type: Type.ARRAY, items: activitySchema },
      afternoon: { type: Type.ARRAY, items: activitySchema },
      evening: { type: Type.ARRAY, items: activitySchema }
    }
  };

  const itinerarySchema: Schema = {
    type: Type.OBJECT,
    properties: {
      tripName: { type: Type.STRING },
      summary: { type: Type.STRING },
      days: { type: Type.ARRAY, items: dayPlanSchema },
      stats: {
        type: Type.OBJECT,
        properties: {
          cultureScore: { type: Type.NUMBER },
          natureScore: { type: Type.NUMBER },
          foodScore: { type: Type.NUMBER },
          relaxationScore: { type: Type.NUMBER }
        }
      }
    },
    required: ["tripName", "summary", "days", "stats"]
  };

  let profileContext = "";
  if (userProfile) {
    profileContext = `
      Kullanıcı Profili Bağlamı:
      - Kullanıcı Adı: ${userProfile.name}
      - Biyografi/Geçmiş: ${userProfile.bio}
      - Genel İlgi Alanları: ${userProfile.savedInterests.join(', ')}
      Lütfen bu kişisel detayları rotaya yansıt ve açıklamalarda kişiye özel ton kullan.
    `;
  }

  const prompt = `
    Sen RotaMimar (RouteArchitect) adında dünyaca ünlü bir seyahat planlayıcısısın.
    Kullanıcı şu özelliklerde bir seyahat planı istiyor:
    
    Şehir: ${prefs.city}
    Süre: ${prefs.days} Gün
    Tempo: ${prefs.pace}
    Grup: ${prefs.companion}
    İlgi Alanları: ${prefs.interests.join(', ')}
    Bütçe: ${prefs.budget}

    ${profileContext}

    Lütfen bu kriterlere uygun, *mantıksal* ve *detaylı* bir JSON rota oluştur.
    
    Önemli Kurallar:
    1. Mekanları birbirine yakınlıklarına göre sırala (Lojistik optimizasyon).
    2. 'crowdLevel' alanında o saatteki tahmini doluluğu belirt.
    3. 'openingHours' ile mekanın çalışma saatlerini belirt.
    4. Varsa o dönem için hayali veya gerçek bir 'specialEvent' (Özel Etkinlik) ekle.
    5. Koordinatları (x, y) 0 ile 100 arasında soyut bir harita düzlemi için ver.
    6. SADECE JSON formatında yanıt ver, markdown kullanma.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: itinerarySchema,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("API'den boş yanıt döndü.");

    const data = parseJSON(text);
    if (!data) throw new Error("AI yanıtı okunamadı (JSON ayrıştırma hatası).");
    return data as TripItinerary;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};