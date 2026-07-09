# Rạng Đông — Theo dõi giá đèn năng lượng mặt trời

Ứng dụng theo dõi và so sánh giá đèn NLMT của Rạng Đông với 4 đối thủ:
**Jindian, Suntek, Mayor Wolf, Solar Light** — kèm khuyến nghị tự động và đồng bộ Notion.

## Chạy ứng dụng

```bash
node server.js
# mở http://localhost:3210
```

Không cần cài dependency (Node.js thuần).

## Tính năng

- **Form thêm sản phẩm theo dõi** — thương hiệu, tên, công suất, giá, link nguồn.
  Theo dõi bắt đầu từ ngày nhập.
- **Kỳ so sánh** — 30 / 60 / 90 ngày hoặc số ngày tùy chọn (2–365).
- **Lọc theo phân khúc công suất** (100W, 200W, ... tự sinh từ dữ liệu).
- **Biểu đồ giá trung bình theo thương hiệu** với tooltip theo ngày.
- **Bảng so sánh biến động**: giá hiện tại, đầu kỳ, Δ%, min–max trong kỳ.
- **Khuyến nghị tự động cho Rạng Đông**: cảnh báo đối thủ giảm giá mạnh,
  phân tích định vị giá theo phân khúc, cơ hội khi đối thủ tăng giá.
- **Đồng bộ Notion** (tùy chọn): mỗi điểm giá là 1 dòng trong database Notion riêng —
  xem `scripts/daily-update-prompt.md` để tự cấu hình với workspace của bạn.
- **Bản demo tĩnh** (`docs/`): chạy được trên GitHub Pages không cần server —
  form thêm sản phẩm lưu trên trình duyệt người xem (localStorage).

## Cấu trúc

```
rangdong-price-tracker/
├── server.js                     # Server Node thuần: UI + JSON API
├── public/                       # Dashboard (HTML/CSS/JS)
├── data/prices.json              # Kho dữ liệu giá
└── scripts/
    ├── seed-data.mjs             # Tạo dữ liệu ban đầu (khảo sát 09/07/2026)
    └── daily-update-prompt.md    # Quy trình phiên cập nhật hằng ngày
```

## API

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/data` | Toàn bộ dữ liệu |
| POST | `/api/products` | Thêm sản phẩm `{brand, name, watt, price, url?}` |
| POST | `/api/prices` | Ghi điểm giá `{updates:[{productId, price, source}]}` |
| DELETE | `/api/products/:id` | Ngừng theo dõi |

## Ghi chú dữ liệu

- Giá ngày **09/07/2026** là giá thật khảo sát từ web bán lẻ công khai
  (rangdong.com.vn, dmtsolar.com, hainamsolar.net, sendo.vn, solarlight.com.vn, gelta.vn).
- Lịch sử **trước 09/07/2026 là mô phỏng minh hoạ** (đánh dấu `simulated: true`) —
  sẽ được thay dần bằng dữ liệu thật khi cập nhật hằng ngày chạy.
- Sản phẩm gắn nhãn **"ước tính"**: hãng không niêm yết giá công khai,
  giá suy từ khoảng giá thị trường.
