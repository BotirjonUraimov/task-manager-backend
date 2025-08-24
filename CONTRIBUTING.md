## Hissa qo‘shish bo‘yicha yo‘riqnoma (CONTRIBUTING)

Ushbu loyiha ochiq manbali va hamjamiyat hissasiga ochiq. Quyidagi qo‘llanma fikr-mulohaza, xatoliklarni tuzatish, yangi funksiyalar taklifi va kod hissa qo‘shish jarayonini soddalashtirish uchun mo‘ljallangan.

### 1) Xulq-atvor kodeksi

Ishtirok etish orqali siz loyihaning qoidalarga rioya qilishingizni tasdiqlaysiz. Batafsil: `CODE_OF_CONDUCT.md`.

### 2) Qanday hissa qo‘shish mumkin?

- Muammo (bug) haqida xabar bering: Issues bo‘limida aniq tavsif, kutilgan natija va reproduksiya bosqichlarini yozing.
- Taklif (feature request): Muammoni, nega kerakligini va taklif etilayotgan yechimni qisqa va aniq bayon qiling.
- Pull Request (PR): Kichik va fokuslangan o‘zgarishlar bilan PR oching, tavsif va motivatsiyani yozing.

### 3) Muhitni sozlash

Talablar:

- Node.js 18+ (tavsiya 20+)
- MongoDB (lokal yoki Atlas)

O‘rnatish va ishga tushirish:

```bash
git clone <repo-url>
cd backend
npm install

# .env faylini yarating (README dagi namuna)

# Development
npm run dev

# Production build
npm run build
npm start
```

Foydali skriptlar:

- `npm run dev`: Nodemon + ts-node
- `npm run build`: TypeScript ni `dist/` ga kompilyatsiya qiladi
- `npm start`: `dist/` dan appni ishga tushiradi
- `npm run clean`: `dist/` ni tozalaydi

### 4) Arxitektura va kod standartlari

Loyiha qatlamlari: `controller` → `service` → `repository` → `model` (Mongoose). Umumiy interfeyslar `src/common/interfaces` ostida.

- TypeScript: ochiq API funksiyalarida aniq turlar; xatoliklarni erta ushlash uchun qat’iy tiplar.
- Validatsiya: kiruvchi payloadlar uchun Zod ishlating (controller darajasida yoki service oldidan).
- Avtorizatsiya: marshrutlarda `authenticate` va `authorize([roles])` dan foydalaning.
- Xatolar: markazlashgan `errorHandler` orqali JSON `{ error: string }` qaytariladi. `throw` qilganda mazmunli xabar bering.
- Loglar: Pino logger. Muhitga mos log darajalari (`LOG_LEVEL`). Sensitiv ma’lumotlarni logga yozmang.
- Swagger: `src/**/*.routes.ts` ichida JSDoc bloklarini yangilang, endpointlar, parametrlar va javob shakllarini hujjatlang. `/docs` orqali ko‘rish mumkin.
- Ma’lumotlar modeli: Mongoose sxemalari bilan DTO/interfeyslarni mos holda saqlang; kerakli indekslarni qo‘shing.

### 5) Git oqimi va commitlar

- Fork qiling (yoki to‘g‘ridan-to‘g‘ri repo ichida): `feat/<qisqa-nom>` yoki `fix/<qisqa-nom>` tarzida branch oching.
- Commit uslubi: Conventional Commits tavsiya etiladi.
  - `feat: ...` — yangi imkoniyat
  - `fix: ...` — xatoni tuzatish
  - `docs: ...`, `refactor: ...`, `perf: ...`, `chore: ...`
- PR lar kichik va ko‘rib chiqishga qulay bo‘lsin. Keraksiz fayllarni qo‘shmang.

### 6) PR cheklist

- [ ] `README.md` yoki Swagger JSDoc yangilandi (agar API o‘zgargan bo‘lsa)
- [ ] `src/common/interfaces` moslashtirildi (modellarga va DTOlarga mos)
- [ ] Avtorizatsiya qoidalari routeda tekshirildi
- [ ] Loglar va xatoliklar bir xil formatda
- [ ] Lokalda `npm run build` muvaffaqiyatli
- [ ] Yangi yoki o‘zgargan mavjud endpointlar sinovdan o‘tkazildi (kamida qo‘lda)

### 7) Sinov va sifat

Hozircha avtomatik testlar ko‘zda tutilmagan. PR yuborishda kamida quyidagilarni bajaring:

- Asosiy ish oqimlari bo‘yicha qo‘lda tekshirib chiqing (auth, tasks CRUD, analytics).
- Edge-case lar: ruxsatsiz kirish, noto‘g‘ri payload, topilmagan resurslar.

### 8) Xavfsizlik

Xavfsizlik muammolarini ommaga oshkor qilishdan oldin ularni shaxsiy tarzda muhokama qiling (masalan, muallifga shaxsiy xabar). Maxfiylikni saqlang; ekspluatatsiya tafsilotlarini ochiq joylashtirmang.

### 9) Litsenziya

Loyiha `LICENSE.md` (MIT) ostida. Hissa qo‘shish orqali siz o‘z kodingizni shu litsenziya ostida tarqatishga rozilik bildirasiz.

### 10) Aloqa

Savollar va takliflar uchun Issues/PR lar orqali yozing.
