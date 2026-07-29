# Luma 💗 — Засварласан бүрэн хувилбар

Таны илгээсэн эх кодыг бүрэн ажилладаг болгож, дараах алдаануудыг олж заслаа.

## 🐛 Олдож, засагдсан бодит алдаанууд

### Критик (апп угаас ажиллахгүй байсан)
1. **`CreateProfileScreen.js`** — `TextInput` component дээр эхний `<` дутуу байсан → JSX parse error, апп build хийгдэхгүй байсан.
2. **`api/client.js`** — Authorization header хавсаргах interceptor байхгүй байсан → нэвтэрсний дараах **бүх** хүсэлт (profile/discovery/swipe/matches/messages) 401 буцаадаг байсан.
3. **`/upload/photo` endpoint** — mobile app үүнийг дуудаж байсан ч backend талд route/controller огт байгаагүй → зураг upload 404 буцаадаг байсан.
4. **`AppNavigator.js`-д `react-native-screens`, `react-native-safe-area-context`** package.json-д байхгүй байсан — эдгээр нь `@react-navigation/native-stack`-ийн заавал шаардах peer dependency, байхгүй бол native stack navigator crash хийнэ.

### Аюулгүй байдлын цоорхой
5. **Mass assignment vulnerability** — `updateProfile`-д `data: req.body` шууд дамжуулдаг байсан тул хортой хэрэглэгч `userId` зэрэг field-ийг хүсэлтдээ нэмж, өөр хэрэглэгчийн профайлыг булаах боломжтой байсан. → zod validation middleware нэмж, зөвхөн зөвшөөрөгдсөн field-үүд л дамжих болгосон.
6. **`sendMessage`-д гишүүнчлэл шалгадаггүй байсан** — хэн ч бусдын matchId-г таамаглаад тэдний чат руу мессеж бичих боломжтой байсан том цоорхой. → match гишүүнчлэл шалгах `assertUserInMatch` нэмсэн.
7. **CORS бүх origin-д нээлттэй**, **`helmet()` байхгүй**, **rate limiting байхгүй** → бүгдийг нэмсэн.
8. **Prisma-гийн raw алдааг client рүү шууд буцаадаг байсан** (жишээ нь database schema мэдээлэл алдаанд гарч ирж болзошгүй) → төвлөрсөн `errorHandler` нэмж, аюулгүй мессеж рүү хөрвүүлдэг болгосон.

### Логикийн алдаа
9. **`Swipe`, `Match` model-д unique constraint байгаагүй** → нэг хэрэглэгч давхар swipe хийвэл давхар Match үүсэх боломжтой байсан. → `@@unique` нэмж, `upsert` ашиглан засав.
10. **`discovery.controller`** аль хэдийн swipe хийсэн хэрэглэгчдийг хасдаггүй байсан → ижил профайл дахин дахин гарч ирдэг байсан.
11. **`register`-т username давхцал шалгадаггүй** байсан (зөвхөн email шалгадаг байсан) — username давхцвал Prisma raw error шидэгддэг байсан.
12. **Express 4 нь async controller доторх алдааг автоматаар барьдаггүй** → бараг бүх controller-т алдаа гарвал хүсэлт "hang" болж, хариу огт өгдөггүй байсан. → `catchAsync` wrapper бүх route-д нэмсэн.
13. **`createProfile`** давхар дуудагдвал (жишээ нь сүлжээний алдаанаас давхар товшвол) Prisma unique constraint error шидэгддэг байсан → `upsert` болгосон.

### UX / дутуу код
14. **Match хийгдэхэд `MatchScreen` руу шилждэггүй байсан** — backend match мэдээлэл буцаадаг ч frontend үүнийг үл тоомсорлодог байсан.
15. **Match-уудын жагсаалт харах дэлгэц (`MatchesListScreen`) огт байгаагүй** — backend endpoint байсан ч UI-гүй байсан. Шинээр үүсгэсэн.
16. **`ChatScreen` backend-тэй огт холбогдоогүй байсан** — зөвхөн local state, дэлгэц refresh хийхэд бүх мессеж алга болдог байсан. Одоо бодит API дуудаж, 3 секунд тутам polling хийж мессеж татна.
17. **`MatchScreen`, `ProfileCard`** зурагтай хэрэглэгч байхгүй үед crash хийдэг байсан (`user.photos[0].url` гэж шууд хандсан) → fallback avatar нэмсэн.
18. **Login/Register-т алдааны feedback байхгүй байсан** (зөвхөн `console.log`) → хэрэглэгчид харагдах `Alert` нэмсэн.
19. **Logout функц хаана ч байгаагүй** → нэмсэн (`clearToken` + Discover дэлгэц дээрх товч).
20. **`CreateProfile → PhotoUpload → Discover` урсгал холбогдоогүй байсан** (PhotoUploadScreen import хийгдсэн ч ямар ч дэлгэцээс рүү шилждэггүй байсан) → зөв дараалалтай болгосон.
21. **Cloudinary env variable-ууд (`CLOUD_NAME` гэх мэт) production `.env`-д байсан ч хаана ч ашиглагддаггүй байсан** → upload controller-т бодитоор холбосон.

## 📂 Бүтэц
```
luma/
  backend/    → Node.js + Express + Prisma + PostgreSQL
  mobile/     → React Native (Expo)
```

## Backend ажиллуулах
```bash
cd luma/backend
npm install
cp .env.example .env    # утгуудаа бөглөнө (DATABASE_URL, JWT_SECRET, Cloudinary key-үүд)
npx prisma generate
npx prisma migrate dev --name init
npm run dev              # http://localhost:5000
```

## Mobile ажиллуулах
```bash
cd luma/mobile
npm install
npx expo install expo-image-picker react-native-screens react-native-safe-area-context
npm start
```
`src/api/client.js` доtorh `DEV_BASE_URL`-г компьютерийнхээ локал IP хаягаар солино уу (жишээ: `http://192.168.1.50:5000/api`) — `localhost` ашиглах боломжгүй, учир нь утас/emulator дээрээс "localhost" гэдэг нь тухайн төхөөрөмж өөрийгөө хэлнэ.

## Одоо ч дутуу зүйлс (цаашид нэмэх санал)
- Push notification
- "Unmatch" функц
- Report/Block систем
- Refresh token (одоо ганц 7 хоногийн token л байгаа, хугацаа дуусахад дахин нэвтрэх шаардлагатай)
- Rate limiting зөвхөн auth дээр — swipe/message дээр ч нэмж болно
