# Shathi Foods frontend: how to merge

1. Copy the `src/` folder from this zip into your project's `src/` and choose "Replace" when asked.
   It replaces: app/layout.tsx, app/globals.css and the placeholder pages.
2. Make sure these exist in `/public/images/`:
   logo.png, gold-ghee.jpg, silk-ghee.jpg, combo.jpg, gallery-1.jpg ... gallery-5.jpg
3. Add these to `.env` (from .env.example): NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_WHATSAPP,
   NEXT_PUBLIC_FACEBOOK_URL, NEXT_PUBLIC_INSTAGRAM_URL, NEXT_PUBLIC_CONTACT_EMAIL
4. `npm run dev`, then run the wiring prompt in Antigravity.

Assumes Tailwind CSS v4 (the default in current create-next-app). Theme colors live in globals.css under @theme.
Path alias `@/` must point to `src/` (create-next-app sets this up by default).
