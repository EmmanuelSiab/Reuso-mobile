# Reuso Mobile

Expo Go MVP for the Reuso CDMX second-hand marketplace.

## Run

```bash
cd mobile
npm install
npx expo start --go --clear
```

## Environment

Create `mobile/.env` with:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app reuses the website Supabase tables and fields: `listings`, `profiles`, `favorites`, and `conversations`. Image upload targets the existing `listing-images` bucket with paths like `userId/timestamp-random.ext`.

## MVP Notes

- Email/password auth uses Supabase Auth.
- Profile completion mirrors the web app: account type plus display name or business name.
- Listing creation supports Expo Image Picker and Supabase Storage upload in Expo Go.
- Chat CTA creates or opens a conversation record when the existing chat tables are available, then shows a clean placeholder because full mobile chat UI is outside this first MVP.
