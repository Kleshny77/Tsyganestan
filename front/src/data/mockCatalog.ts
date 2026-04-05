import type { AchievementId, Flight, Tour } from '../types';

export const DEFAULT_FLIGHTS: Flight[] = [
  {
    id: 'f1',
    airlineName: 'Дорогие Авиалинии',
    routeFrom: 'Москва',
    routeTo: 'Париж',
    dateLabel: '15 апр 2026',
    timeLabel: '14:30',
    categories: [
      { id: 'first', name: 'Первый', price: 85000, lockedByDefault: false },
      { id: 'business', name: 'Бизнес', price: 55000, lockedByDefault: true },
      { id: 'economy', name: 'Эконом', price: 35000, lockedByDefault: true },
    ],
  },
  {
    id: 'f2',
    airlineName: 'Премиум Флай',
    routeFrom: 'Санкт-Петербург',
    routeTo: 'Токио',
    dateLabel: '20 апр 2026',
    timeLabel: '09:15',
    categories: [
      { id: 'first', name: 'Первый', price: 120000, lockedByDefault: false },
      { id: 'business', name: 'Бизнес', price: 78000, lockedByDefault: true },
      { id: 'economy', name: 'Эконом', price: 42000, lockedByDefault: true },
    ],
  },
];

export const DEFAULT_TOURS: Tour[] = [
  {
    id: 't1',
    companyName: 'Ужасные Туры',
    title: 'Тур по заброшкам Европы',
    description:
      'Незабываемое путешествие по самым сомнительным местам континента.',
    rating: 1.2,
    price: 45000,
    countries: ['Франция', 'Германия'],
    cities: ['Париж', 'Берлин'],
    sights: ['Старая фабрика', 'Заброшенный вокзал'],
    galleryEmoji: ['🏚️', '🏭', '🌫️'],
  },
  {
    id: 't2',
    companyName: 'Кошмар Тревел',
    title: 'Париж: только очереди',
    description: 'Эйфелева башня снизу, метро сверху, кофе за 15 евро.',
    rating: 1.0,
    price: 89000,
    countries: ['Франция'],
    cities: ['Париж'],
    sights: ['Очередь к Лувру', 'Сувениры из Китая'],
    galleryEmoji: ['🗼', '🥐', '😰'],
    unlockId: 'paris',
  },
  {
    id: 't3',
    companyName: 'Токио-стресс',
    title: 'Токио: сон не входит',
    description: 'Метро в час пик, капсульный отель без окон.',
    rating: 1.4,
    price: 134000,
    countries: ['Япония'],
    cities: ['Токио'],
    sights: ['Перекрёсток Сибуя', 'Капсула 1 м²'],
    galleryEmoji: ['🗾', '🚇', '😵'],
    unlockId: 'tokyo',
  },
  {
    id: 't4',
    companyName: 'Пустынный вайб',
    title: 'Дубай: жара и очки',
    description: 'ТЦ, ТЦ и ещё раз ТЦ. Пляж платный.',
    rating: 1.1,
    price: 156000,
    countries: ['ОАЭ'],
    cities: ['Дубай'],
    sights: ['Башня с видом на стройку', 'Искусственный остров'],
    galleryEmoji: ['🏙️', '🌴', '🕶️'],
    unlockId: 'dubai',
  },
];

export const STORE_ITEMS: {
  id: AchievementId;
  title: string;
  description: string;
  price: number;
  icon: string;
}[] = [
  {
    id: 'letter_m',
    title: 'Буква «м»',
    description: 'Разблокирует букву М в поиске',
    price: 50,
    icon: '🔤',
  },
  {
    id: 'letter_s',
    title: 'Буква «с»',
    description: 'Разблокирует букву С в поиске',
    price: 50,
    icon: '🔤',
  },
  {
    id: 'economy_class',
    title: 'Эконом класс',
    description: 'Доступ к эконом местам',
    price: 100,
    icon: '✈️',
  },
  {
    id: 'paris',
    title: 'Париж',
    description: 'Разблокирует туры в Париж',
    price: 150,
    icon: '🗼',
  },
  {
    id: 'tokyo',
    title: 'Токио',
    description: 'Разблокирует туры в Токио',
    price: 200,
    icon: '🗾',
  },
  {
    id: 'dubai',
    title: 'Дубай',
    description: 'Разблокирует туры в Дубай',
    price: 250,
    icon: '🏙️',
  },
];

/** Базовые буквы поиска для пользовательского аккаунта (шутка «победа»). */
export const BASE_SEARCH_LETTERS = ['п', 'о', 'б', 'е', 'д', 'а'] as const;
