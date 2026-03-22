<div dir="rtl">

# 🕌 بوابة سقبا الرقمية
### SAQBA DIGITAL PORTAL

منصة حكومية رقمية لتقديم الخدمات الإدارية لأبناء مدينة سقبا — ريف دمشق — سوريا.

---

## 📁 هيكل المشروع

```
saqba/
├── index.html       ← الصفحة الرئيسية
├── citizen.html     ← بوابة المواطن (تسجيل، غاز، شكاوى، توثيق)
├── admin.html       ← لوحة الإدارة
├── martyrs.html     ← سجل الشهداء
├── manifest.json    ← PWA manifest
├── sw.js            ← Service Worker (offline + إشعارات)
├── README.md
├── LICENSE
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

> كل ملف HTML مكتفٍ بذاته — CSS + JS + Firebase مدمجة بداخله.

---

## ✨ الميزات

| الميزة | الوصف |
|--------|-------|
| 🔥 نظام الغاز | توثيق الهوية + رفع الوثائق (دفتر عائلة + هوية وجهين + إثبات عنوان) + طلب الأسطوانة |
| 📣 الشكاوى | تقديم شكاوى مع صور + متابعة الحالة |
| 📰 الأخبار | نشر الأخبار والإعلانات مع صور |
| 🖼️ معرض الصور | معرض صور المدينة |
| 🕊️ سجل الشهداء | توثيق وعرض أسماء شهداء المدينة |
| 🔔 إشعارات | Push Notifications عبر Firebase Cloud Messaging |
| 📱 PWA | تثبيت التطبيق على الهاتف مباشرة من المتصفح |
| 📊 إحصاءات | رسوم بيانية لحالات الغاز والشكاوى |

---

## ⚙️ الإعداد

### 1. Firebase Config
Firebase Config مُضمّن في كل الملفات للمشروع `saqba-portal`.

### 2. VAPID Key (Push Notifications)
في `citizen.html` ابحث عن:
```javascript
vapidKey: 'BNi1n04Qi-...',
```
المفتاح مضبوط مسبقاً.

### 3. GitHub Pages
1. ارفع جميع الملفات مع مجلد `icons/`
2. **Settings → Pages → Branch: main → Save**
3. أضف الدومين في Firebase:
   **Authentication → Settings → Authorized domains**
   ```
   saqbacity.github.io
   ```

---

## 👤 إنشاء حساب المشرف

1. سجّل حساباً عادياً في `citizen.html`
2. Firebase Console → Firestore → `users` → `{uid}`
3. أضف الحقل:
   ```
   role: "admin"
   ```

---

## 🔒 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    function isAuth() { return request.auth != null; }

    match /users/{userId} {
      allow read: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuth() && request.auth.uid == userId;
      allow update: if isAuth() && (
        (request.auth.uid == userId &&
         !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])) ||
        isAdmin()
      );
      allow delete: if isAdmin();
    }
    match /gas_requests/{id} {
      allow read: if isAuth() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }
    match /complaints/{id} {
      allow read: if isAuth() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }
    match /news/{id}    { allow read: if true; allow write: if isAdmin(); }
    match /gallery/{id} { allow read: if true; allow write: if isAdmin(); }
    match /martyrs/{id} {
      allow read: if true;
      allow create: if isAuth();
      allow update, delete: if isAdmin();
    }
    match /families/{id} {
      allow read: if isAuth() && (request.auth.uid == id || isAdmin());
      allow create: if isAuth()
        && !exists(/databases/$(database)/documents/families/$(request.resource.data.familyBookId));
      allow update, delete: if isAdmin();
    }
    match /village_registry/{id} {
      allow read, create: if isAuth();
      allow update, delete: if isAdmin();
    }
    match /notifications/{id} {
      allow read: if isAuth() && (resource.data.scope == 'all' ||
                  resource.data.toUid == request.auth.uid);
      allow create: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

---

## 🗄️ Collections في Firestore

| Collection | الوصف |
|-----------|-------|
| `users` | بيانات المستخدمين + حالة الغاز + FCM token |
| `gas_requests` | طلبات توزيع الغاز |
| `complaints` | الشكاوى |
| `news` | الأخبار والإعلانات |
| `gallery` | معرض الصور |
| `martyrs` | سجل الشهداء |
| `families` | بيانات KYC (دفتر عائلة + هوية وجهين + إثبات عنوان) |
| `village_registry` | سجل السكان |
| `notifications` | قائمة الإشعارات المُرسَلة |

---

## 🔔 نظام الإشعارات (FCM)

الإشعارات تُرسَل تلقائياً في الحالات التالية:

| الحدث | المستلم |
|-------|---------|
| قبول/رفض طلب توثيق الغاز | المواطن المعني |
| قبول/رفض/تسليم طلب الغاز | المواطن المعني |
| نشر خبر جديد | جميع المستخدمين |

---

## 👨‍💻 المطوّر

**عماد إحسان اللحام** — ابن مدينة سقبا

[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white)](https://www.facebook.com/emad.allahaam)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/edlm83)
[![X](https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white)](https://x.com/edlm83)
[![Telegram](https://img.shields.io/badge/Telegram-229ED9?style=flat&logo=telegram&logoColor=white)](https://t.me/edlm83)

---

© 2026 بوابة سقبا الرقمية — جميع الحقوق محفوظة

</div>
