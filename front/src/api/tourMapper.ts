import type { ApiTour } from './tours';
import type { Tour } from '../types';

function splitLocation(location: string): { countries: string[]; cities: string[]; sights: string[] } {
  const raw = location
    .split(/[|•\n]/)
    .map(s => s.trim())
    .filter(Boolean);
  if (raw.length === 0) {
    return { countries: ['Маршрут'], cities: [], sights: [] };
  }
  if (raw.length === 1) {
    return { countries: [raw[0]], cities: [], sights: [] };
  }
  if (raw.length === 2) {
    return { countries: [raw[0]], cities: [raw[1]], sights: [] };
  }
  return {
    countries: [raw[0]],
    cities: [raw[1]],
    sights: raw.slice(2),
  };
}

export function mapApiTourToUi(t: ApiTour, companyName: string): Tour {
  const { countries, cities, sights } = splitLocation(t.location);
  const sightList = sights.length ? sights : ['На выбор'];
  return {
    id: String(t.id),
    companyName,
    title: t.title,
    description: t.description,
    rating: Math.min(5, Math.max(1, 4.4 - (t.id % 7) * 0.2)),
    price: Math.round(t.price),
    countries,
    cities: cities.length ? cities : ['—'],
    sights: sightList,
    galleryEmoji: ['🏖️', '🧳', '📍'],
    createdBy: t.created_by,
    ownerCompanyId: String(t.created_by),
  };
}
