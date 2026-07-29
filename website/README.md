# Luma — Жинхэнэ Вэбсайт (Static Frontend)

Энэ folder бол **бодит REST API дуудаж ажилладаг** цэвэр HTML/CSS/JS сайт. `window.storage` ашигладаггүй тул Claude-ийн гадна, ямар ч static hosting дээр байршуулж болно.

## Яаж ажилладаг вэ?
1. Энэ frontend нь `backend/`-ийг (Node.js + Express + Prisma) API болгон дуудна.
2. Тиймээс **эхлээд backend-ээ deploy хийх ёстой** (доор алхамчлан бичив).
3. Backend-ийн URL-ээ энэ сайтын анхны тохиргооны дэлгэц дээр (эсвэл шууд `index.html`-д) оруулна.

## Алхам 1: Backend-ээ Render дээр deploy хийх
1. Энэ бүх кодыг GitHub repo болгож push хийнэ (`git init`, `git add .`, `git commit`, `git push`)
2. [render.com](https://render.com) дээр акаунт үүсгэнэ (үнэгүй)
3. "New" → "Blueprint" → GitHub repo-гоо сонгоно → Render автоматаар `render.yaml`-ийг уншиж backend + PostgreSQL үүсгэнэ
4. Render Dashboard → `luma-backend` → Environment хэсэгт дараах утгуудыг **гараар** нэмнэ:
   - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` (cloudinary.com дээрээс)
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PREMIUM_PRICE_ID`, `STRIPE_BOOST_PRICE_ID` (`MONETIZATION.md` үзнэ үү)
   - `FRONTEND_URL` — Алхам 2-т авах static сайтынхаа URL
   - `APP_BASE_URL` — мөн адил static сайтынхаа URL (Stripe Checkout буцах хаяг)
5. Deploy дуустал хүлээнэ (~5 минут). Ажилласны дараа танд `https://luma-backend-xxxx.onrender.com` шиг URL өгнө.
6. `https://luma-backend-xxxx.onrender.com/health` нээж `{"status":"ok"}` харагдаж байгаа эсэхийг шалгана.

## Алхам 2: Энэ frontend-ийг үнэгүй static hosting дээр байршуулах

### Хувилбар A — Netlify (хамгийн хялбар)
1. [app.netlify.com/drop](https://app.netlify.com/drop) руу орно
2. Энэ `website/` folder-ийг шууд browser дээр чирж оруулна (drag & drop)
3. Netlify танд шууд `https://random-name-12345.netlify.app` гэсэн жинхэнэ URL өгнө — **энэ бол таны сайт!**
4. (Заавал биш) Дараа нь Netlify Dashboard → Domain settings-ээс өөрийн бодит домэйнээ холбож болно (жишээ: `luma-dating.com`)

### Хувилбар B — Vercel
1. `vercel.com` дээр акаунт үүсгээд GitHub repo-гоо холбоно
2. Root Directory-г `website` болгож тохируулаад Deploy дарна

### Хувилбар C — GitHub Pages (үнэгүй, GitHub account шаардана)
1. Repo Settings → Pages → Source-ийг `website/` folder болгож сонгоно
2. `https://таны-username.github.io/repo-нэр/` хаягаар нээгдэнэ

## Алхам 3: Frontend-ийг backend-тэй холбох
1. Дээрх алхмуудаар авсан сайтынхаа URL-ийг нээнэ
2. Анхны тохиргооны дэлгэц дээр backend-ийн URL-ээ бичнэ: `https://luma-backend-xxxx.onrender.com/api`
3. Дараа нь Render Dashboard руу буцаж `FRONTEND_URL` болон `APP_BASE_URL`-ийг өөрийн static сайтынхаа бодит URL-ээр шинэчилнэ (CORS болон Stripe redirect зөв ажиллахын тулд)

## Анхаарах зүйл
- Render-ийн **үнэгүй tier** нь 15 минут idle байвал "унтдаг" (cold start ~30 секунд) — жинхэнэ хэрэглэгчидтэй бол `starter` төлбөртэй tier рүү шилжихийг зөвлөж байна
- `MONETIZATION.md`-д байгаа хуулийн/бизнесийн шаардлагуудыг production-д гарахаас өмнө заавал биелүүлээрэй
