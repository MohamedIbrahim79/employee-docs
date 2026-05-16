# 🚀 دليل الإعداد الكامل — نظام وثائق الموظفين

## المتطلبات
- Node.js 18+ (تحميل من nodejs.org)
- حساب GitHub (مجاني)
- حساب Supabase (مجاني)
- حساب Vercel (مجاني)
- حساب Gmail

---

## الخطوة 1 — إعداد Supabase (قاعدة البيانات + رفع الملفات)

1. اذهب لـ **https://supabase.com** وسجّل حساب مجاني
2. اضغط **New Project** واختار اسم للمشروع
3. احفظ كلمة مرور قاعدة البيانات
4. بعد الإنشاء، اذهب لـ **SQL Editor** (في القائمة الجانبية)
5. افتح ملف `supabase-schema.sql` من المشروع والصق محتواه كله
6. اضغط **Run** — سيتم إنشاء الجداول تلقائياً
7. اذهب لـ **Project Settings → API** واحفظ:
   - `Project URL`
   - `anon/public key`
   - `service_role key` (احفظه بأمان!)

---

## الخطوة 2 — إعداد Gmail App Password

1. اذهب لـ **https://myaccount.google.com/security**
2. فعّل **2-Step Verification** لو مش مفعّل
3. اذهب لـ **https://myaccount.google.com/apppasswords**
4. اختار **Mail** و **Windows Computer**
5. اضغط **Generate**
6. احفظ الـ 16 حرف اللي ظهرت (مثال: `abcd efgh ijkl mnop`)

---

## الخطوة 3 — تشغيل المشروع محلياً

```bash
# 1. نزّل المشروع
cd employee-docs

# 2. ثبّت المكتبات
npm install

# 3. انسخ ملف الإعدادات
cp .env.example .env.local

# 4. افتح .env.local وعدّل البيانات:
# - NEXT_PUBLIC_SUPABASE_URL=  (من Supabase)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY= (من Supabase)
# - SUPABASE_SERVICE_ROLE_KEY= (من Supabase)
# - JWT_SECRET= (اكتب أي نص طويل مثل: mySecretKey2024!AbCdEfGhIjKl)
# - GMAIL_USER= (إيميل Gmail بتاعك)
# - GMAIL_APP_PASSWORD= (الـ 16 حرف من الخطوة 2)
# - COMPANY_NAME= (اسم شركتك)
# - NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 5. أنشئ حساب المدير
node scripts/create-admin.js
# (عدّل الإيميل وكلمة المرور جوّا الملف أولاً)

# 6. شغّل المشروع
npm run dev
```

افتح **http://localhost:3000** — ستظهر صفحة تسجيل الدخول!

---

## الخطوة 4 — الرفع على Vercel (مجاناً)

### 4.1 رفع الكود على GitHub

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit"

# اعمل repo جديد على github.com
# ثم:
git remote add origin https://github.com/YOUR_USERNAME/employee-docs.git
git push -u origin main
```

### 4.2 ربط Vercel بـ GitHub

1. اذهب لـ **https://vercel.com** وسجّل بحساب GitHub
2. اضغط **New Project**
3. اختار الـ repo اللي رفعته
4. اضغط **Import**

### 4.3 إضافة Environment Variables في Vercel

في صفحة الإعداد، اضغط **Environment Variables** وأضف:

```
NEXT_PUBLIC_SUPABASE_URL     = https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY    = eyJ...
JWT_SECRET                   = (نفس القيمة اللي في .env.local)
GMAIL_USER                   = yourcompany@gmail.com
GMAIL_APP_PASSWORD           = xxxx xxxx xxxx xxxx
COMPANY_NAME                 = اسم شركتك
NEXT_PUBLIC_SITE_URL         = https://your-app.vercel.app
CRON_SECRET                  = (اكتب أي كلمة سر مثل: myc0ronS3cret!)
```

5. اضغط **Deploy** — سيتم رفع الموقع خلال دقيقتين!

### 4.4 بعد الرفع

- عدّل `NEXT_PUBLIC_SITE_URL` بالرابط الحقيقي من Vercel
- الـ Cron Job بيشتغل تلقائياً كل يوم الساعة 7 الصبح

---

## الخطوة 5 — إضافة الدومين الخاص (اختياري)

في Vercel → Settings → Domains → أضف دومينك

---

## استخدام النظام

### حساب المدير
- رابط: `/login`
- يمكنه: إضافة موظفين، مراجعة وثائقهم، إرسال تذكيرات، رؤية كل التنبيهات

### حساب الموظف
- يتلقى إيميل فيه بيانات الدخول تلقائياً عند إضافته
- يمكنه: رفع وثائقه، تحديثها، إدخال تواريخ الانتهاء بنفسه

### التذكيرات التلقائية
تُرسل إيميلات تلقائياً في حالات:
- قبل 30 يوم من انتهاء أي وثيقة
- قبل 14 يوم
- قبل 7 أيام
- قبل 3 أيام
- قبل يوم واحد
- في يوم الانتهاء
- كل 7 أيام بعد الانتهاء

---

## استكشاف الأخطاء

**مشكلة في الإيميل؟**
- تأكد إن App Password صح (16 حرف بدون مسافات)
- تأكد إن 2FA مفعّل على الحساب

**مشكلة في رفع الملفات؟**
- تأكد إن storage bucket "documents" موجود في Supabase
- شوف Storage Policies في Supabase

**صفحة فاضية؟**
- تأكد من NEXT_PUBLIC_SUPABASE_URL و ANON_KEY

---

## التطوير المستقبلي

- إضافة دومين خاص (.de)
- إضافة تقارير PDF
- إضافة أنواع وثائق إضافية من لوحة التحكم
- إشعارات Slack أو WhatsApp

---

**السعر = مجاني 100%** (لحد 50 ألف طلب في الشهر على Vercel و 500MB تخزين على Supabase)
