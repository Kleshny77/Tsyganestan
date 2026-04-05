# CI/CD для React Native приложения

## Настроенные workflow

### 🌐 Web Build (`.github/workflows/web-build.yml`)

**Что делает:**
- Собирает веб-версию приложения через **React Native Web**
- Деплоит на **GitHub Pages** (автоматически при пуше в `main`)

**Артефакты:**
- `web-app/` — статические файлы (HTML, CSS, JS)

**Ссылка на приложение:**
- После деплоя доступно по адресу: `https://<username>.github.io/<repo>/`

**Запускается:**
- При пуше в `main`
- При pull request в `main`

---

### 🤖 Android Build (`.github/workflows/android-build.yml`)

**Что делает:**
- Собирает **Debug APK** (для тестирования)
- Собирает **Release AAB** (для Google Play)

**Артефакты:**
- `android-debug-apk/app-debug.apk` — установочный файл для Android
- `android-release-aab/app-release.aab` — bundle для Google Play Console

**Запускается:**
- При пуше в `main`
- При pull request в `main`

---

### 🍎 iOS Build (`.github/workflows/ios-build.yml`)

**Что делает:**
- Собирает приложение для **iOS Simulator**
- Создаёт **IPA** файл (Ad Hoc дистрибуция)
- Создаёт **XCArchive** (для App Store)

**Артефакты:**
- `ios-app/*.ipa` — установочный файл для iOS (Ad Hoc)
- `ios-app-build/Front.xcarchive` — архив для App Store

**Запускается:**
- При пуше в `main`
- При pull request в `main`

---

## 📥 Как скачать артефакты

1. Откройте вкладку **Actions** на GitHub
2. Выберите нужный запуск workflow
3. Внизу страницы найдите секцию **Artifacts**
4. Кликните на название артефакта для скачивания

---

## ⚙️ Настройка для iOS (требуется)

### Для сборки IPA нужен:

1. **Apple Developer аккаунт** ($99/год)
2. **Сертификаты и профили** в [Apple Developer Portal](https://developer.apple.com)

### Шаги настройки:

#### 1. Создайте сертификаты:
- **Apple Distribution** (для релиза)
- **Apple Development** (для разработки)

#### 2. Создайте Provisioning Profiles:
- **Ad Hoc** — для тестирования на устройствах
- **App Store** — для публикации

#### 3. Обновите `front/ios/ExportOptions.plist`:

```xml
<key>teamID</key>
<string>ВАШ_TEAM_ID</string>

<key>provisioningProfiles</key>
<dict>
    <key>com.front</key>  <!-- Bundle Identifier -->
    <string>Название_Provisioning_Profile</string>
</dict>
```

#### 4. Добавьте секреты в GitHub:

В репозитории: **Settings → Secrets and variables → Actions**

| Secret | Описание |
|--------|----------|
| `APPLE_CERTIFICATE` | P12 файл сертификата (base64) |
| `APPLE_CERTIFICATE_PASSWORD` | Пароль от P12 |
| `APPLE_PROVISIONING_PROFILE` | Provisioning profile (base64) |
| `APPLE_ID` | Apple ID аккаунта |
| `APPLE_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | Team ID из Apple Developer |

---

## 🚀 Публикация

### Android (Google Play):

1. Скачайте `app-release.aab` из артефактов
2. Откройте [Google Play Console](https://play.google.com/console)
3. Загрузите AAB файл в релиз

### iOS (App Store):

**Вариант 1: Через Xcode**
1. Скачайте `Front.xcarchive`
2. Откройте в Xcode: `Window → Organizer`
3. Нажмите **Distribute App**

**Вариант 2: Через Transporter**
1. Скачайте артефакт
2. Используйте [Transporter](https://apps.apple.com/app/transporter/id1450874784)

---

## 🔧 Тестирование workflow

### Локальная проверка:

```bash
# Android
cd front/android
./gradlew assembleDebug

# iOS (только macOS)
cd front/ios
pod install
xcodebuild -workspace Front.xcworkspace -scheme Front -sdk iphonesimulator -configuration Debug
```

### Тестовый запуск CI:

1. Создайте тестовую ветку
2. Запушьте изменения
3. Проверьте вкладку **Actions**

---

## 📝 Примечания

- **Android APK** работает сразу (debug версия)
- **iOS IPA** требует подписанного provisioning profile
- Артефакты хранятся **30 дней**
- Для production сборки добавьте подписывание ключами
