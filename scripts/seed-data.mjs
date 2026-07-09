/**
 * Seed data/prices.json with the products surveyed on 2026-07-09.
 *
 * Today's price point is REAL (collected from public retail listings).
 * History before today is SIMULATED (simulated: true) so the dashboard has a
 * 30-day curve to demonstrate — real points replace it as the daily updater runs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, 'data', 'prices.json');
const TODAY = '2026-07-09';
const HISTORY_DAYS = 30;

// [id, brand, name, watt, price-today, source, url, estimated, volatility]
const SEED = [
  ['rd-pha-100', 'Rạng Đông', 'Đèn pha NLMT 100W (CP01)', 100, 1650000,
    'rangdong.com.vn / ledchinhhang.com', 'https://rangdong.com.vn/gia-den-nang-luong-mat-troi-n991.html', false, 0.015],
  ['rd-pha-200', 'Rạng Đông', 'Đèn pha NLMT 200W', 200, 1900000,
    'rangdong.com.vn / dmtsolar.com', 'https://dmtsolar.com/thuong-hieu/rang-dong', false, 0.015],
  ['jd-8800l-100', 'Jindian', 'JD-8800L 100W', 100, 1550000,
    'hainamsolar.net / dmtsolar.com', 'https://dmtsolar.com/thuong-hieu/jindian', false, 0.03],
  ['jd-8200l-200', 'Jindian', 'JD-8200L 200W', 200, 1850000,
    'hainamsolar.net / dmtsolar.com', 'https://dmtsolar.com/thuong-hieu/jindian', false, 0.03],
  ['st-pha-100', 'Suntek', 'Đèn pha Suntek 100W', 100, 950000,
    'ước tính (hãng không niêm yết)', 'https://suntek.com.vn/den-pha-nang-luong-mat-troi-suntek-pha-200w-dp656.html', true, 0.025],
  ['st-pha-200', 'Suntek', 'Đèn pha Suntek 200W', 200, 1350000,
    'ước tính (hãng không niêm yết)', 'https://suntek.com.vn/suntek-rp-200w-dp693.html', true, 0.025],
  ['mw-pha-100', 'Mayor Wolf', 'Đèn pha Mayor Wolf 100W', 100, 850000,
    'sendo.vn', 'https://www.sendo.vn/den-pha-nang-luong-mat-troi-100w-mayor-wolf-chinh-hang-23040942.html/', false, 0.04],
  ['mw-pha-200', 'Mayor Wolf', 'Đèn pha Mayor Wolf 200W', 200, 1450000,
    'ước tính (phuonglamaudio.com)', 'https://phuonglamaudio.com/san-pham/den-pha-nang-luong-mat-troi-200w-mayor-wolf/', true, 0.04],
  ['sl-x100', 'Solar Light', 'Xenon X100W viền cam', 100, 970000,
    'solarlight.com.vn', 'https://solarlight.com.vn/gia-den-nang-luong-mat-troi-100w-moi-nhat.html', false, 0.03],
  ['sl-200', 'Solar Light', 'Solar Light 200W', 200, 1500000,
    'gelta.vn (khoảng 0,9–2 triệu)', 'https://gelta.vn/gia-den-nang-luong-mat-troi-solar-light-200w-moi-nhat-2026/', false, 0.03],
];

function isoDaysAgo(base, days) {
  const d = new Date(base + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Deterministic pseudo-random walk so re-seeding gives the same curve. */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory([id, , , , priceToday, source, , , volatility], seedNum) {
  const rand = mulberry32(seedNum);
  const points = [];
  let price = priceToday;
  // Walk backwards from today so the curve ends exactly at the real price.
  for (let day = 1; day <= HISTORY_DAYS; day++) {
    const drift = (rand() - 0.48) * volatility * priceToday;
    price = Math.round((price + drift) / 10000) * 10000;
    points.unshift({ date: isoDaysAgo(TODAY, day), price, simulated: true });
  }
  points.push({ date: TODAY, price: priceToday, source });
  return points;
}

const products = SEED.map((row, i) => {
  const [id, brand, name, watt, price, source, url, estimated] = row;
  return {
    id, brand, name, watt, url, estimated,
    addedDate: isoDaysAgo(TODAY, HISTORY_DAYS),
    priceHistory: buildHistory(row, i + 7),
  };
});

const data = {
  meta: {
    lastUpdated: TODAY,
    currency: 'VND',
    note: 'Giá ngày 2026-07-09 thu thập thật từ web công khai. Lịch sử trước đó là mô phỏng minh hoạ (simulated: true), sẽ được thay bằng dữ liệu thật khi cập nhật hằng ngày.',
  },
  products,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
console.log(`Seeded ${products.length} products -> ${OUT}`);
