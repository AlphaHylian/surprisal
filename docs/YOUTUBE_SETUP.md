# Direct YouTube API setup (once, about 15 minutes)

This lets the daily run read analytics and comments straight from YouTube, so they cost no Zapier
tasks. Later, after Google's audit (step 7), uploads can move off Zapier too. Everything here is free.

You need: the Google account that owns @surprisalmath, a computer with Python 3, and this repo
(or just the file `kit/youtube.py`).

## 1. Create a Google Cloud project
1. Go to https://console.cloud.google.com/ and sign in with the channel's Google account.
2. Click the project picker at the top, then **New project**. Name it `surprisal` and create it.
   Make sure it's selected afterwards.

## 2. Turn on the two APIs
In **APIs & Services > Library**, search for and **Enable** each one:
- **YouTube Data API v3**
- **YouTube Analytics API**

## 3. Set up the consent screen
1. Go to **APIs & Services > OAuth consent screen** (also called **Google Auth Platform**) and click
   **Get started**.
2. App name `surprisal`, support email: yours. Audience: **External**. Contact email: yours. Finish.
3. Under **Audience**, click **Publish app** and confirm, so the status says **In production**.
   Don't skip this: while the app is in "Testing", Google expires the login after 7 days and the
   daily run would lose access every week. You don't need Google's verification for this; you'll just
   see an "unverified app" warning once in step 5.

## 4. Create the login client
1. Go to **APIs & Services > Credentials** (or **Clients**), then **Create credentials > OAuth client ID**.
2. Application type: **Desktop app**. Name: `surprisal-routine`. Create.
3. Click **Download JSON**. Save it as `client_secret.json`. Keep it private.

## 5. Get the refresh token (on your computer)
In the folder where you saved `client_secret.json`, with this repo's `kit/youtube.py` copied there too
(or from the repo root):
```bash
python3 kit/youtube.py auth --client-secrets client_secret.json
```
A browser opens. Sign in with the channel's account and pick the @surprisalmath channel if asked.
At "Google hasn't verified this app", click **Advanced > Go to surprisal (unsafe)** (it's your
own app), then **Continue / Allow**. The terminal then prints three lines:
```
YT_CLIENT_ID=...
YT_CLIENT_SECRET=...
YT_REFRESH_TOKEN=...
```

## 6. Give them to the daily routine
Add those three lines as **environment variables** in the cloud environment the routine runs in
(claude.ai/code, the environment's settings: https://code.claude.com/docs/en/claude-code-on-the-web).
Treat them like a password: anyone with them can manage the channel. Don't put them in the repo.

The next run checks them with `python -m kit.youtube check`, and from then on does all its reading
without Zapier. If you ever want to cut access, remove the app at
https://myaccount.google.com/permissions.

## 7. Optional, for uploads: the YouTube API audit
Google locks every video uploaded through a new, unaudited API project as **private**, and it can't
be made public. Until the project passes an audit, the run keeps uploading through Zapier (2 tasks a
day, about 60 a month, which fits in the 100). To move uploads off Zapier too:
1. Fill in the **YouTube API Services Audit and Quota Extension form**:
   https://support.google.com/youtube/contact/yt_api_form
   Describe it plainly: a private tool that uploads and schedules the owner's own videos to their
   own channel and reads that channel's analytics and comments; one user, no other channels.
2. Google replies by email (it can take a few weeks). When it's approved, set
   `"uploads_audited": true` in `state/youtube_api.json` (or tell the run to). From then on the
   run uploads with `kit.youtube upload` and Zapier isn't needed at all.
