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
EXPO_NO_DEPENDENCY_VALIDATION=1
```

`EXPO_NO_DEPENDENCY_VALIDATION=1` keeps `expo start` from failing when the Expo CLI cannot reach Expo's online native-module metadata service. It does not change app runtime behavior.

The app reuses the website Supabase tables and fields: `listings`, `profiles`, `favorites`, and `conversations`. Image upload targets the existing `listing-images` bucket with paths like `userId/timestamp-random.ext`.

## MVP Notes

- Email/password auth uses Supabase Auth.
- Profile completion mirrors the web app: account type plus display name or business name.
- Listing creation supports Expo Image Picker and Supabase Storage upload in Expo Go.
- Chat includes an inbox and conversation screen using the existing `conversations` and `messages` tables.
- Profile includes current user info, own listings, favorites, and logout.

## Supabase permissions

If onboarding shows `permission denied for table profiles`, apply:

```text
supabase/migrations/20260507143000_mobile_app_grants_and_policies.sql
```

That migration grants Data API access and RLS policies for `profiles`, `listings`, `favorites`, `conversations`, and `messages`.
