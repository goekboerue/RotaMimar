import { Pace, Companion } from './types';
import { Coffee, Camera, Landmark, Palette, TreePine, ShoppingBag, Utensils, Music, Briefcase } from 'lucide-react';

export const INTERESTS = [
  { id: 'history', label: 'Tarih', icon: Landmark },
  { id: 'gastronomy', label: 'Gastronomi', icon: Utensils },
  { id: 'art', label: 'Sanat', icon: Palette },
  { id: 'photography', label: 'Fotoğraf', icon: Camera },
  { id: 'nature', label: 'Doğa', icon: TreePine },
  { id: 'shopping', label: 'Alışveriş', icon: ShoppingBag },
  { id: 'nightlife', label: 'Gece Hayatı', icon: Music },
  { id: 'coffee', label: 'Kahve Kültürü', icon: Coffee },
];

export const PACE_OPTIONS = [
  { value: Pace.USAIN_BOLT, label: 'Usain Bolt', desc: 'Günde 25k adım, her şeyi gör.' },
  { value: Pace.BALANCED, label: 'Dengeli', desc: 'Hem gez hem dinlen.' },
  { value: Pace.RELAXED, label: 'Keyifçi', desc: 'Az mekan, çok keyif.' },
  { value: Pace.DIGITAL_NOMAD, label: 'Dijital Göçebe', desc: 'İş dostu kafeler ve akşam gezmesi.' },
];

export const COMPANION_OPTIONS = [
  { value: Companion.SOLO, label: 'Solo' },
  { value: Companion.COUPLE, label: 'Çift' },
  { value: Companion.FAMILY, label: 'Aile (Çocuklu)' },
  { value: Companion.FRIENDS, label: 'Arkadaşlar' },
];

export const BUDGET_OPTIONS = ['Bütçe Dostu', 'Orta Seviye', 'Lüks'];