export type AccountType = 'user' | 'business';

export type AchievementId =
  | 'letter_m'
  | 'letter_s'
  | 'economy_class'
  | 'paris'
  | 'tokyo'
  | 'dubai';

export type TicketCategory = {
  id: string;
  name: string;
  price: number;
  lockedByDefault: boolean;
};

export type Flight = {
  id: string;
  airlineName: string;
  routeFrom: string;
  routeTo: string;
  dateLabel: string;
  timeLabel: string;
  categories: TicketCategory[];
  ownerCompanyId?: string;
};

export type Tour = {
  id: string;
  companyName: string;
  title: string;
  description: string;
  rating: number;
  price: number;
  countries: string[];
  cities: string[];
  sights: string[];
  galleryEmoji: string[];
  galleryUris?: string[];
  /** если задано — для пользователя нужна купленная ачивка */
  unlockId?: AchievementId;
  ownerCompanyId?: string;
};

export type UserProfile = {
  name: string;
  email: string;
  avatarUri?: string;
  companyName?: string;
};
