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

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface FixedActivity {
  name: string;
  timeSlot: TimeSlot;
}

export interface UserPreferences {
  city: string;
  days: number;
  pace: Pace;
  interests: string[];
  budget: string;
  companion: Companion;
  fixedActivity?: FixedActivity; // New optional field
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
  id: string;        // Unique ID for saving
  createdAt: number; // Timestamp
  destinationCity: string; // The city name for map context
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