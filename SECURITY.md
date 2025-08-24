## Xavfsizlik siyosati (SECURITY)

Ushbu hujjat **task manager** backend loyihasida xavfsizlik muammolarini qanday xabar qilish va ularni qanday ko‘rib chiqishimiz haqida ma’lumot beradi. Iltimos, muammolarni ommaga oshkor qilishdan oldin mas’ulona oshkor etish tamoyillariga rioya qiling.

### Qanday xabar berish kerak?

Xavfsizlik nuqsonlari haqida xabar berish uchun quyidagi manzilga yozing:

- daviduraimov@gmail.com

Xavfsizlik masalalarini ochiq Issues bo‘limida e’lon qilmang. Xabaringizda quyidagilarni iloji boricha qo‘shing:

- Muammoning qisqa tavsifi va tasnifi (masalan, auth bypass, NoSQL injection, IDOR, XSS, SSRF, konfiguratsiya xatosi)
- Takrorlash bosqichlari (step-by-step repro), PoC (agar mavjud bo‘lsa)
- Kutilgan va olingan natijalar
- Ta’sir doirasi (qaysi endpointlar/rollar ta’sirda)
- Muhit tafsilotlari (commit/versiya, Node.js versiyasi, konfiguratsiya farqlari)

### Javob muddati va mas’ulona oshkor etish

- 48 soat ichida xabaringizni olganimiz haqida tasdiq beramiz
- 72 soat ichida dastlabki tahlil va og‘irlik bahosini yuboramiz
- Odatda 15 kun ichida tuzatish va relizga chiqishga intilamiz (og‘irlikka qarab tezroq)
- Tuzatish tayyor bo‘lgach, birgalikda kelishilgan vaqtda oshkor qilamiz

Agar muammo faol ekspluatatsiya qilinayotgan bo‘lsa yoki juda jiddiy bo‘lsa, jadvalni tezlashtiramiz.

### Qo‘llab-quvvatlanadigan versiyalar

- `main/master` (so‘nggi kod): faol qo‘llab-quvvatlanadi
- Eski relizlar: holatga qarab, muhim tuzatishlar orqaga ko‘chirishi mumkin

Iltimos, xabar berganda aniq commit/teg yoki versiyani ko‘rsating.

### Skop va texnik kontekst

Skopdagi asosiy yo‘nalishlar:

- Node.js + Express 5 backend, TypeScript
- JWT (HS256) autentifikatsiya, RBAC (admin, user)
- Mongoose 8 (MongoDB) va NoSQL injection’lar
- Swagger UI konfiguratsiyasi va API marshrutlari
- Konfiguratsiya (env, logger, xatolarni qayta ishlash)

Skopdan tashqarida bo‘lishi mumkin bo‘lganlar:

- Soxta trafik orqali volumetrik DoS/DDoS
- Foydalanuvchi infratuzilmasi/muhitidagi noto‘g‘ri sozlamalar
- Uchchi tomon kutubxonalaridagi allaqachon ma’lum va patchelangan nuqsonlar
- Ijtimoiy injiniring, fishing, fizik kirish

### Testlash qoidalari (Good-faith)

- Faqat o‘zingiz nazorat qiladigan lokal yoki test muhitida sinov qiling
- Ma’lumotlarni o‘chirib yubormang, o‘zgartirmang yoki ekssfiltratsiya qilmang
- Minimal zararni ko‘zlab PoC yozing; real foydalanuvchi ma’lumotlaridan foydalanmang
- Hisoblar va tokenlardan ehtiyotkor foydalaning; kerak bo‘lsa, test akkaunt yarating

Biz mas’ulona va halol tadqiqotni qo‘llab-quvvatlaymiz (safe harbor). Yaxshi niyatdagi testlar uchun sizga huquqiy choralar qo‘llanmaydi.

### Sirlar va maxfiylik

- Agar tasodifan maxfiy ma’lumot (token, parol, shaxsiy ma’lumot) ko‘rsangiz, darhol to‘xtang, saqlamang va bizga xabar bering
- `.env` va boshqa sirlar repoga tushmasligi kerak; bunday holatni ko‘rsangiz, tezda bildiring
- JWT sirlari (HS256) muntazam rotatsiya qilinishi va token muddati (`JWT_EXPIRES_IN`, hozirda 1 soat) to‘g‘ri sozlanishi zarur

### Tuzatish siyosati

Og‘irlikka qarab mo‘ljal vaqtlar:

- Critical: 7 kun ichida hotfix/reliz
- High: 14 kun ichida
- Medium: 30 kun ichida
- Low: imkon qadar tez, eng yaxshi urinish bilan

### Bog‘liqliklar (Dependencies)

- `npm audit` va xavfsizlik yangilanishlarini muntazam kuzatamiz
- Critical/High toifadagi muammolar ustuvor tartibda yangilanadi
- Muammoli kutubxona haqida alohida xabar bersangiz, juda qadrlaymiz

### Tavsiya etilgan mitigatsiyalar

- Kuchli va maxfiy `JWT_SECRET`, muntazam rotatsiya
- Minimal ruxsatlar, RBAC ni qat’iy tekshirish (route darajasida)
- Kiritmalarni tekshirish (Zod), so‘rov/yo‘l parametrlarida nojoiz qiymatlar
- Loglarda maxfiy ma’lumotlarni yashirish
- Doimiy audit va monitoring

### Mukofotlar va e’tirof

Hozircha rasmiy bug bounty dasturi yo‘q. Mas’ulona oshkor etilgan va tuzatilgan muammolar uchun xohishingizga ko‘ra e’tirof bo‘limida nomingizni keltirishimiz mumkin.

### Aloqa

- Xavfsizlik: botirjon.uraimov.93@gmail.com
- Umumiy savollar: Issues/PR orqali
