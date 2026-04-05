import { decodeJwtPayload } from '../lib/jwt';

/** Локальные копии полей — без импорта ./auth и ./tours (цикл с client). */
type ApiTour = {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  created_by: number;
  created_at: string;
  updated_at: string | null;
};

type TourPayload = {
  title: string;
  description: string;
  price: number;
  location: string;
};

type MockUserRow = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'tour_agent' | 'admin';
  created_at: string;
};

type MockResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

const isoNow = () => new Date().toISOString();

function base64UrlFromJson(obj: object): string {
  const json = JSON.stringify(obj);
  if (typeof btoa === 'undefined') {
    throw new Error('mock JWT: нужен btoa (браузер)');
  }
  const b64 = btoa(
    encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p: string) =>
      String.fromCharCode(parseInt(p, 16)),
    ),
  );
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function makeMockAccessToken(
  sub: string,
  role: 'user' | 'tour_agent' | 'admin',
  userId: number,
): string {
  const payload = {
    sub,
    role,
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  };
  return `eyJhbGciOiJub25lIn0.${base64UrlFromJson(payload)}.mock`;
}

let nextUserId = 9001;
let nextTourId = 15;

const mockUsers = new Map<string, MockUserRow>();

function seedUsers() {
  if (mockUsers.size > 0) return;
  const u = 'demo@tsyganestan.local';
  mockUsers.set(u.toLowerCase(), {
    id: 9000,
    username: u,
    email: u,
    password: 'demo',
    role: 'user',
    created_at: isoNow(),
  });
}

const mockTours: ApiTour[] = [
  {
    id: 1,
    title: 'Каракумы (мок)',
    description: 'Демо-тур без бэкенда — только для веб-сборки.',
    price: 89990,
    location: 'Туркмения | Ашхабад | Дарваза',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 2,
    title: 'Якутск −60° (мок)',
    description: 'Холодно, зато честно.',
    price: 120_000,
    location: 'Россия | Якутск | Царство вечной мерзлоты',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 3,
    title: 'Золотое кольцо без сна (мок)',
    description: 'Автобус, монастыри, селёдка на завтрак.',
    price: 18900,
    location: 'Россия | Суздаль | Владимир',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 4,
    title: 'Байкал: омуль и комары (мок)',
    description: 'Лодка, палатка, репеллент обязателен.',
    price: 67000,
    location: 'Россия | Иркутск | Листвянка',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 5,
    title: 'Камчатка: гейзеры (мок)',
    description: 'Уаз, грязь, гейзеры. Медведи по желанию.',
    price: 189000,
    location: 'Россия | Петропавловск-Камчатский | Долина гейзеров',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 6,
    title: 'Астрахань: вобла и лотосы (мок)',
    description: 'Жара 40°, дельта Волги, вобла сушёная.',
    price: 34000,
    location: 'Россия | Астрахань | Дельта Волги',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 7,
    title: 'Карелия: Кижи и мошки (мок)',
    description: 'Лодки, скалы, мошки в подарок.',
    price: 52000,
    location: 'Россия | Петрозаводск | Кижи',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 8,
    title: 'Алтай: Телецкое (мок)',
    description: 'Серпантин, горы, чай с мёдом.',
    price: 78000,
    location: 'Россия | Горно-Алтайск | Телецкое озеро',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 9,
    title: 'Казань: кремль (мок)',
    description: 'Минареты, чак-чак, Баумана пешком.',
    price: 24000,
    location: 'Россия | Казань | Кул-Шариф',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 10,
    title: 'Сочи: набережная (мок)',
    description: 'Море, дождь, хинкали по цене Монако.',
    price: 41000,
    location: 'Россия | Сочи | Адлер',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 11,
    title: 'Мурманск: сияние (мок)',
    description: 'Полярная ночь, треска, Териберка.',
    price: 59000,
    location: 'Россия | Мурманск | Териберка',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 12,
    title: 'Волгоград: история (мок)',
    description: 'Мамаев курган, ступени, ветер.',
    price: 12000,
    location: 'Россия | Волгоград | Мамаев курган',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 13,
    title: 'Калининград: янтарь (мок)',
    description: 'Королевские ворота, кафе с рыбой, замки.',
    price: 31000,
    location: 'Россия | Калининград | Куршская коса',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
  {
    id: 14,
    title: 'Хибины: тундра (мок)',
    description: 'Север, олени, лыжи или грязь — по сезону.',
    price: 72000,
    location: 'Россия | Кировск | Хибины',
    created_by: 9000,
    created_at: isoNow(),
    updated_at: null,
  },
];

function parseTourId(path: string): number | null {
  const m = path.match(/^\/tours\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

export function dispatchMockApi<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): MockResult<T> {
  seedUsers();

  const method = (options.method || 'GET').toUpperCase();
  const rel = path.startsWith('http') ? new URL(path).pathname : path;

  if (rel === '/auth/login' && method === 'POST') {
    const body = JSON.parse(String(options.body || '{}')) as {
      username?: string;
      password?: string;
    };
    const username = (body.username || '').trim().toLowerCase();
    if (!username) {
      return { ok: false, status: 422, message: 'Нужен логин (email)' };
    }
    let row = mockUsers.get(username);
    if (!row) {
      const id = nextUserId++;
      row = {
        id,
        username,
        email: username.includes('@') ? username : `${username}@tsyganestan.local`,
        password: body.password || '',
        role: 'user',
        created_at: isoNow(),
      };
      mockUsers.set(username, row);
    }
    const data = {
      access_token: makeMockAccessToken(row.username, row.role, row.id),
      token_type: 'bearer',
    };
    return { ok: true, data: data as T };
  }

  if (rel === '/auth/register' && method === 'POST') {
    const body = JSON.parse(String(options.body || '{}')) as {
      username?: string;
      email?: string;
      password?: string;
      role?: 'user' | 'tour_agent' | 'admin';
    };
    const username = (body.username || '').trim().toLowerCase();
    const email = (body.email || username || '').trim().toLowerCase();
    if (!username || !email) {
      return { ok: false, status: 422, message: 'Нужны username и email' };
    }
    const role = body.role === 'tour_agent' || body.role === 'admin' ? body.role : 'user';
    const id = nextUserId++;
    const row: MockUserRow = {
      id,
      username,
      email,
      password: body.password || '',
      role,
      created_at: isoNow(),
    };
    mockUsers.set(username, row);
    const resUser = {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      created_at: row.created_at,
    };
    return { ok: true, data: resUser as T };
  }

  if (rel === '/tours/' || rel === '/tours') {
    if (method === 'GET') {
      return { ok: true, data: [...mockTours] as T };
    }
    if (method === 'POST') {
      const body = JSON.parse(String(options.body || '{}')) as TourPayload;
      const claims = token ? decodeJwtPayload(token) : null;
      const createdBy = claims?.user_id ?? 9000;
      const t: ApiTour = {
        id: nextTourId++,
        title: body.title || 'Без названия',
        description: body.description || '',
        price: Number(body.price) || 0,
        location: body.location || '—',
        created_by: createdBy,
        created_at: isoNow(),
        updated_at: null,
      };
      mockTours.push(t);
      return { ok: true, data: t as T };
    }
  }

  const tid = parseTourId(rel);
  if (tid != null) {
    if (method === 'GET') {
      const t = mockTours.find(x => x.id === tid);
      if (!t) return { ok: false, status: 404, message: 'Тур не найден' };
      return { ok: true, data: t as T };
    }
    if (method === 'PUT') {
      const body = JSON.parse(String(options.body || '{}')) as TourPayload;
      const i = mockTours.findIndex(x => x.id === tid);
      if (i < 0) return { ok: false, status: 404, message: 'Тур не найден' };
      mockTours[i] = {
        ...mockTours[i],
        title: body.title ?? mockTours[i].title,
        description: body.description ?? mockTours[i].description,
        price: Number(body.price) || mockTours[i].price,
        location: body.location ?? mockTours[i].location,
        updated_at: isoNow(),
      };
      return { ok: true, data: mockTours[i] as T };
    }
    if (method === 'DELETE') {
      const i = mockTours.findIndex(x => x.id === tid);
      if (i < 0) return { ok: false, status: 404, message: 'Тур не найден' };
      mockTours.splice(i, 1);
      return { ok: true, data: { message: 'ok' } as T };
    }
  }

  return {
    ok: false,
    status: 501,
    message: `Мок API: не реализовано ${method} ${rel}`,
  };
}
