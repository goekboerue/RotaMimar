export enum Pace {
  USAIN_BOLT = 'Usain Bolt',
  BALANCED = 'Dengeli',
  RELAXED = 'Keyifçi',
  DIGITAL_NOMAD = 'Dijital Göçebe'
}

export enum Companion {
  SOLO = 'Solo',
  COUPLE = 'Çift',
  FAMILY = 'Aile',
  FRIENDS = 'Arkadaşlar'
}

export interface UserPreferences {
  city: string;
  days: number;
  pace: Pace;
  interests: string[];
  budget: string;
  companion: Companion;
}

export interface UserProfile {
  name: string;
  bio: string;
  savedInterests: string[];
  defaultPace: Pace;
  defaultBudget: string;
}

export interface Activity {
  id: string;
  name: string;
  time: string;
  type: 'sightseeing' | 'food' | 'rest' | 'work' | 'activity';
  description: string;
  isHiddenGem: boolean;
  rainAlternative?: string;
  estimatedCost: string;
  coordinates: { x: number; y: number }; // Relative coordinates for the schematic map (0-100)
  openingHours?: string;
  crowdLevel?: 'Low' | 'Moderate' | 'High' | 'Very High';
  specialEvent?: string;
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  morning: Activity[];
  afternoon: Activity[];
  evening: Activity[];
}

export interface TripItinerary {
  tripName: string;
  summary: string;
  days: DayPlan[];
  stats: {
    cultureScore: number;
    natureScore: number;
    foodScore: number;
    relaxationScore: number;
  };
}