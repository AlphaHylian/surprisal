# Buffer setup (once, about 10 minutes, free)

Buffer publishes each Short to YouTube, TikTok and Instagram at its slot time. It replaces the
Zapier upload (no more 100-tasks-a-month limit), and because Buffer is an audited app on all three
platforms, scheduled YouTube videos go public on time. The free plan covers exactly what we need:
3 channels, up to 10 scheduled posts per channel.

## 1. Account
1. Sign up at https://buffer.com (free plan) with the channel's email.
2. **Verify the email address** (Buffer sends a link). Unverified accounts are limited to 10 posts
   a day and can't put links in descriptions.

## 2. Connect the three channels
In Buffer, **Channels > Connect a channel**:
- **YouTube**: sign in with the Google account that owns @surprisalmath and pick that channel.
- **TikTok**: log in as @surprisalmath (the surprisalmath@gmail.com account). Allow direct posting
  if asked.
- **Instagram**: the account must be a Creator or Business account first (Instagram: Settings >
  Account type and tools > Switch to professional account; free). Then connect @surprisalmath.

The free plan allows 8 channel connections over the account's lifetime, so avoid connecting and
disconnecting repeatedly.

## 3. API key
1. Go to https://publish.buffer.com/settings/api and create a key.
2. Add it to the cloud environment the daily routine uses, either:
   - an environment variable: `BUFFER_API_KEY=<the key>`, or
   - (safer) an API credential: host `api.buffer.com`, header `Authorization`, value
     `Bearer <the key>`.

## 4. Done
The next run checks it with `python -m kit.buffer check`, saves the channel ids in
`state/buffer.json`, and from then on publishes through Buffer (docs/RUNBOOK.md, step 7a). Zapier
stays as the fallback and for long-form videos.
