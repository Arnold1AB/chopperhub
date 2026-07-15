# Netlify Backend Setup

ChopperHub uses Firebase Spark for Auth and Firestore, then Netlify Functions for private backend work.

## Mobile public config

Set the deployed Netlify site URL in `.env` and `app.json`:

```text
EXPO_PUBLIC_CHOPPERHUB_API_URL=https://your-netlify-site.netlify.app
```

Only `EXPO_PUBLIC_` values belong in the mobile app. Do not put Groq, Cloudinary secret, Paystack secret, or Firebase service account JSON in Expo config.

## Netlify environment variables

Set these in Netlify site settings under Environment variables:

```text
GROQ_API_KEY
GROQ_MEAL_MODEL=openai/gpt-oss-120b
GROQ_TRACKER_MODEL=openai/gpt-oss-120b
GROQ_TRANSCRIBE_MODEL=whisper-large-v3-turbo
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
PAYSTACK_SECRET_KEY
PAYSTACK_MONTHLY_AMOUNT_KOBO=500000
PAYSTACK_YEARLY_AMOUNT_KOBO=5000000
FIREBASE_SERVICE_ACCOUNT_JSON
POSTHOG_API_KEY
POSTHOG_HOST=https://us.i.posthog.com
```

`FIREBASE_SERVICE_ACCOUNT_JSON` must be the full Firebase service account JSON string for the same Firebase project used by the app.
`POSTHOG_API_KEY` can use the same PostHog project token as the mobile app because it is a write-only analytics key.

## Deploy

Connect the repo to Netlify and deploy from the project root. Netlify will use:

```text
netlify/functions
```

The mobile app calls:

```text
/.netlify/functions/analyze-meal
/.netlify/functions/tracker-analysis
/.netlify/functions/transcribe-meal
/.netlify/functions/sign-cloudinary-upload
/.netlify/functions/create-paystack-checkout
/.netlify/functions/verify-paystack-payment
```

After the Netlify deploy finishes, replace `https://YOUR_NETLIFY_SITE.netlify.app` in `.env` and `app.json` with the real site URL, then restart Expo.
