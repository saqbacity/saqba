<div dir="rtl">

# 🕌 بوابة سقبا الرقمية
### SAQBA DIGITAL PORTAL — v2.0

منصة حكومية رقمية لتقديم الخدمات الإدارية لأبناء مدينة سقبا — ريف دمشق — سوريا.

---

## 📁 هيكل المشروع

```
saqba/
├── index.html          ← الصفحة الرئيسية
├── citizen.html        ← بوابة المواطن
├── admin.html          ← لوحة الإدارة
├── martyrs.html        ← سجل الشهداء
├── distributor.html    ← بوابة الموزع (جديد)
├── manifest.json       ← PWA
├── sw.js               ← Service Worker
├── README.md
├── LICENSE
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## ✨ الميزات

| الميزة | الوصف |
|--------|-------|
| 🔥 نظام الغاز | KYC كامل + طلب الدور + عداد 22 يوم |
| 📦 بوابة الموزع | تأكيد التسليم برقم الدور + دفتر العائلة |
| 📣 الشكاوى | تقديم شكاوى مع صور |
| 📰 الأخبار | نشر أخبار المدينة |
| 🕊️ سجل الشهداء | توثيق أسماء الشهداء |
| 🔔 إشعارات | Push Notifications عبر FCM |
| 📱 PWA | تثبيت كتطبيق على الهاتف |
| 📊 إحصاءات | رسوم بيانية في لوحة الإدارة |
| ✓ توثيق | badge موثق/غير موثق في كل مكان |

---

## ⚙️ الإعداد

### Firebase Config
مضمّن في كل الملفات — المشروع: `saqba-portal`

### بوابة الموزع
رمز الدخول الافتراضي في `distributor.html`:
```javascript
const PIN = '1234'; // ← غيّره
```
حساب الموزع في Firebase Auth:
```
Email:    distributor@saqba.local
Password: SaqbaGas2026!
```

### GitHub Pages
```
Settings → Pages → Branch: main → Save
```
أضف في Firebase → Authentication → Authorized domains:
```
saqbacity.github.io
```

---

## 👤 إنشاء حساب المشرف
```
Firebase Console → Firestore → users → {uid}
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
    function isDistributor() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'distributor';
    }
    function isKycVerified() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.gasStatus
        in ['eligible', 'booked', 'cooldown'];
    }

    match /users/{userId} {
      allow read: if isAuth() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuth() && request.auth.uid == userId;
      // المواطن: لا يستطيع تغيير role أبداً
      // الموزع: يستطيع فقط تحديث gasStatus وlastReceived وticket
      // المشرف: صلاحيات كاملة
      allow update: if isAuth() && (
        (request.auth.uid == userId &&
         !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])) ||
        isAdmin() ||
        (isDistributor() &&
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['gasStatus', 'lastReceived', 'ticket']))
      );
      allow delete: if isAdmin();
    }

    match /gas_requests/{id} {
      allow read: if isAuth() && (resource.data.userId == request.auth.uid || isAdmin() || isDistributor());
      // يُشترط أن يكون gasStatus == 'eligible' (فحص server-side لعداد 22 يوم)
      allow create: if isAuth()
        && request.resource.data.userId == request.auth.uid
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.gasStatus == 'eligible';
      // الموزع يستطيع فقط تحديث حقول التسليم
      allow update: if isAdmin() ||
        (isDistributor() &&
         request.resource.data.diff(resource.data).affectedKeys()
           .hasOnly(['status', 'deliveredAt', 'queueNumber']));
      allow delete: if isAdmin();
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
      // يُشترط أن يكون المستخدم موثّقاً (KYC مقبول) لإضافة شهيد
      allow create: if isAuth() && isKycVerified();
      allow update, delete: if isAdmin();
    }

    match /families/{id} {
      allow read: if isAuth() && (request.auth.uid == id || isAdmin());
      allow create: if isAuth()
        && !exists(/databases/$(database)/documents/families/$(request.resource.data.familyBookId));
      allow update, delete: if isAdmin();
    }

    match /village_registry/{id} {
      allow read: if isAuth();
      // الكتابة مقيّدة: المستخدم يكتب سجله فقط
      allow create: if isAuth() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    match /notifications/{id} {
      allow read: if isAuth();
      allow create: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

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