# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# أرشيف روضة آل مشول الحكومية

تطبيق عربي لإدارة سجلات ومستندات الروضة، مع أقسام قابلة للبحث والفلترة ولوحة إدارة لرفع الملفات وتعديلها وحذفها.

## التشغيل المحلي

```bash
npm install
npm run dev
```

## الفحص وتجهيز النشر

```bash
npm run lint
npm run build
```

يمكن نشر مجلد `dist` على Vercel أو Netlify أو أي استضافة تدعم تطبيقات Vite.

## التخزين والنسخ الاحتياطي

تُخزّن الملفات محليًا في IndexedDB داخل المتصفح. استخدم زر النسخ الاحتياطي من لوحة الإدارة قبل تغيير الجهاز أو المتصفح، ثم استخدم زر الاسترجاع لإعادة الملفات.

### التخزين المشترك بين جميع المستخدمين

لتظهر الملفات المرفوعة لكل الزوار ومن أي جهاز:

1. أنشئ مشروعًا مجانيًا في Supabase.
2. افتح SQL Editor وشغّل محتوى `supabase-schema.sql`.
3. انسخ `.env.example` إلى `.env` وضع `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY`.
4. أضف نفس المتغيرين إلى Environment Variables في Vercel ثم أعد النشر.

بدون إعداد Supabase سيستمر التطبيق بالعمل محليًا داخل متصفح الجهاز الحالي.
