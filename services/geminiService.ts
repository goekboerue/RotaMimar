import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { UserPreferences, TripItinerary, UserProfile } from "../types";

// Helper to clean Markdown code blocks if the model adds them
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

export const generateItinerary = async (prefs: UserPreferences, userProfile?: UserProfile | null): Promise<TripItinerary> => {
  // 1. API Key Check
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Anahtarı bulunamadı. Lütfen Vercel ayarlarında 'API_KEY' değişkenini tanımlayın.");
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

  const prompt = `
    Kullanıcı Tercihleri:
    Şehir: ${prefs.city}
    Süre: ${prefs.days} Gün
    Tempo: ${prefs.pace}
    Grup: ${prefs.companion}
    İlgi Alanları: ${prefs.interests.join(', ')}
    Bütçe: ${prefs.budget}

    ${profileContext}

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
    itinerary.id = crypto.randomUUID();
    itinerary.createdAt = Date.now();
    
    return itinerary;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return a more user-friendly error message if available
    throw new Error(error.message || "Rota oluşturulurken bilinmeyen bir hata oluştu.");
  }
};