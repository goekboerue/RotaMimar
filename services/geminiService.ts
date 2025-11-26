import { GoogleGenAI } from "@google/genai";
import { UserPreferences, TripItinerary, UserProfile } from "../types";

// Helper to clean Markdown code blocks if the model adds them
const cleanAndParseJSON = (text: string) => {
    try {
        // Remove ```json and ``` wrapping if present
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

export const generateItinerary = async (prefs: UserPreferences, userProfile?: UserProfile | null): Promise<TripItinerary> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let profileContext = "";
  if (userProfile) {
    profileContext = `
      Kullanıcı Profili Bağlamı (BU BİLGİLERİ KULLAN):
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

    GÖREV:
    Bu kriterlere uygun, *mantıksal* ve *detaylı* bir seyahat planı oluştur.
    
    Önemli Kurallar:
    1. Mekanları birbirine yakınlıklarına göre sırala (Lojistik optimizasyon).
    2. 'crowdLevel' alanında o saatteki tahmini doluluğu belirt (Low, Moderate, High, Very High).
    3. 'openingHours' ile mekanın çalışma saatlerini belirt.
    4. Varsa o dönem için hayali veya gerçek bir 'specialEvent' (Özel Etkinlik) ekle.
    5. Koordinatları (x, y) 0 ile 100 arasında soyut bir harita düzlemi için ver (Haritada çizim için gerekli).
    6. "type" alanı şunlardan biri olmalı: 'sightseeing', 'food', 'rest', 'work', 'activity'.

    AŞAĞIDAKİ JSON FORMATINDA YANIT VER (Sadece JSON döndür):

    {
      "tripName": "Yaratıcı bir tur ismi",
      "summary": "Turun kısa ve çekici bir özeti",
      "stats": {
        "cultureScore": 0-100 arası sayı,
        "natureScore": 0-100 arası sayı,
        "foodScore": 0-100 arası sayı,
        "relaxationScore": 0-100 arası sayı
      },
      "days": [
        {
          "dayNumber": 1,
          "theme": "Günün teması",
          "morning": [
            {
              "id": "unique_id_1",
              "name": "Mekan İsmi",
              "time": "09:00",
              "type": "sightseeing",
              "description": "Kısa açıklama",
              "isHiddenGem": false,
              "rainAlternative": "Yağmur yağarsa gidilecek kapalı alternatif",
              "estimatedCost": "10€",
              "openingHours": "09:00 - 18:00",
              "crowdLevel": "Moderate",
              "specialEvent": "İsteğe bağlı etkinlik",
              "coordinates": { "x": 20, "y": 30 }
            }
          ],
          "afternoon": [ ... aynı yapı ... ],
          "evening": [ ... aynı yapı ... ]
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) throw new Error("API'den boş yanıt döndü.");

    const data = cleanAndParseJSON(text);
    if (!data) throw new Error("AI yanıtı okunamadı (JSON format hatası).");
    
    // Add Client-Side Metadata
    const itinerary = data as TripItinerary;
    itinerary.id = crypto.randomUUID();
    itinerary.createdAt = Date.now();
    
    return itinerary;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};