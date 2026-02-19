Smart Bookmark Manager (Harry Potter Themed)

A full-stack bookmark management application built with Next.js 14 (App Router), Supabase, and deployed on Vercel.

**Live URL:** _Add your Vercel URL here_  
**GitHub:** _Add your GitHub repo link here_

---

## Overview

This application allows authenticated users to save, view, and delete personal bookmarks. Each user's data is completely private and isolated. The bookmark list updates in real-time across all open tabs without requiring a page refresh.

The interface is themed around Harry Potter to demonstrate custom UI design using Google Fonts and CSS, while keeping the underlying architecture clean and production-ready.

---

## Overall Approach

The application is structured around three distinct layers:

**Authentication layer** — handled entirely by Supabase Auth with Google OAuth via Google Cloud Console. No custom auth logic is written; Supabase manages session tokens, refresh cycles, and user records.

**Data layer** — a single `bookmarks` table in Supabase's PostgreSQL database, protected by Row Level Security policies that are enforced at the database level, not the application level.

**Realtime layer** — Supabase's Realtime engine listens for changes to the `bookmarks` table and pushes updates to all connected clients automatically.

The frontend is a Next.js 14 App Router application. All pages under `app/` are Server Components by default; only the components that require browser APIs or interactivity are marked `'use client'`.

---

## Features

1. Google OAuth sign-in (no email/password)
2. Add bookmarks with a title and URL
3. Bookmarks are private per user
4. Real-time updates across tabs without page refresh
5. Delete own bookmarks
6. Deployed on Vercel with a live URL

---

## Authentication & User Privacy

### Authentication

Authentication is handled via **Google OAuth 2.0**, configured through **Google Cloud Console**. The OAuth credentials (Client ID and Client Secret) are registered in the Google Cloud Console under an OAuth 2.0 Client, with the authorised redirect URI pointing to the Supabase project's auth callback endpoint.

On the Supabase side, the Google provider is enabled under Authentication → Providers, where the Google Cloud credentials are entered. Supabase then manages the full OAuth flow — redirecting the user to Google, receiving the callback, creating a session, and storing the user record in `auth.users`.

In the application, sign-in is triggered with:

```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```

The session is retrieved on the dashboard using `getSession()`, which reads from local storage and is more reliable than `getUser()` for client-side session checks with the `@supabase/supabase-js` client.

### User Privacy

User data privacy is enforced at the **database level** using Supabase's Row Level Security (RLS). RLS is enabled on the `bookmarks` table, and three policies are applied:

```sql
-- Users can only read their own bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Users can only insert bookmarks under their own user_id
create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Users can only delete their own bookmarks
create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);
```

Because these policies are enforced at the database level, even a direct API call with the public anon key cannot access another user's data. The application never fetches all bookmarks and filters client-side — the database itself rejects any query that violates the policy.

---

## Real-Time Updates

Real-time functionality is implemented using **Supabase Realtime**, which uses PostgreSQL's logical replication to broadcast row-level changes to subscribed clients over a WebSocket connection.

The `bookmarks` table is added to Supabase's realtime publication:

```sql
alter publication supabase_realtime add table bookmarks;
```

On the client, a channel is opened when the dashboard mounts:

```typescript
supabase
  .channel('bookmarks-realtime')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookmarks',
      filter: `user_id=eq.${userId}`,
    },
    () => loadBookmarks(userId)
  )
  .subscribe();
```

The `filter` parameter ensures each client only receives events for their own rows. When any change occurs (insert or delete), the callback fires and `loadBookmarks` re-fetches the latest data from the database, keeping the UI in sync.

This means if a user has the app open in two tabs and adds a bookmark in one, the other tab receives the realtime event and updates its list automatically — no polling, no page refresh required.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Frontend framework |
| Supabase Auth | Authentication (Google OAuth) |
| Google Cloud Console | OAuth 2.0 credentials |
| Supabase PostgreSQL | Database |
| Supabase Realtime | Live updates via WebSocket |
| Vercel | Hosting and deployment |
| Google Fonts | Typography (Cinzel Decorative, IM Fell English) |

---

## Project Structure

```
app/
  page.tsx              → Landing page with Google sign-in
  dashboard/
    page.tsx            → Bookmark manager (authenticated users only)
    loading.tsx         → Loading state shown during session check
  layout.tsx            → Root layout with font imports
  globals.css           → Global base styles

components/
  auth/
    LoginButton.tsx     → Triggers Google OAuth flow
  dashboard/
    BookmarkForm.tsx    → Form to add a new bookmark
    LogoutButton.tsx    → Signs the user out and redirects to landing

lib/
  supabaseClient.ts     → Supabase client instance (shared across app)
  auth.ts               → Server-side auth helper

types/
  bookmark.ts           → TypeScript type definition for a bookmark
```

---

## Database Schema

```sql
create table bookmarks (
  id         uuid      primary key default uuid_generate_v4(),
  user_id    uuid      references auth.users on delete cascade,
  title      text      not null,
  url        text      not null,
  created_at timestamp default now()
);
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- A Supabase project
- Google Cloud OAuth credentials

### Steps

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/smart-bookmarks.git
   cd smart-bookmarks
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

---

## Deployment

The application is deployed on **Vercel**.

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com) and add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy
4. In Supabase → Authentication → URL Configuration, update:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`
5. In Google Cloud Console → OAuth 2.0 Client, add the Supabase callback URL to the list of authorised redirect URIs

---

## Problems Encountered & Solutions

**1. Export mismatch on Supabase client**  
The existing `supabaseClient.ts` used a named export (`export const supabase`) from `@supabase/supabase-js`, but the generated component files were importing a `createClient` function that did not exist in that module. Resolved by updating all import statements across components to use `import { supabase } from '@/lib/supabaseClient'`.

**2. Stale closure causing null title on insert**  
The `handleAdd` function was capturing a `null` user value from the initial render before the async session check had completed. Even though the user was set in state shortly after, the closure held the old `null` reference. Resolved by storing the user object in a `useRef`, which is always up to date and not subject to closure capture issues.

**3. `router is not defined` in LogoutButton**  
The `useRouter` hook was imported but `const router = useRouter()` was not called inside the component body during a refactor. Resolved by restoring the missing line.

**4. `getUser()` behaving inconsistently**  
`getUser()` makes a network request to Supabase Auth servers on every call and was returning null intermittently on the client side. Switched to `getSession()`, which reads the session directly from local storage and is the recommended approach for client-side session checks with the standard `@supabase/supabase-js` client.

**5. Realtime events not broadcasting across tabs**  
Row changes were not appearing in a second open tab. The issue had two parts: the `bookmarks` table had not been added to Supabase's realtime publication, and the subscription lacked a `user_id` filter. Resolved by running `alter publication supabase_realtime add table bookmarks` and adding `filter: user_id=eq.${userId}` to the subscription configuration.
