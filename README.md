# ChopperHub

AI-assisted meal tracking for users who want a faster way to log food, understand nutrient patterns, and build consistent nutrition habits.

Download and test application build:
```text
https://expo.dev/accounts/arnoldab79/projects/chopperhub/builds/e0dbc2d0-c632-4d38-aa34-f085fa471695
```

## Portfolio URL

Use this repository as the project URL:

```text
https://github.com/Arnold1AB/chopperhub
```

If you also want a live product URL, use the Netlify backend/site URL only after the mobile-facing backend functions are confirmed deployed:

```text
https://chopperhub.netlify.app
```

## Product Summary

ChopperHub is a mobile nutrition tracker built around a simple product problem: meal tracking often fails because logging is slow, repetitive, and too dependent on perfect user input.

The app lets users capture meals through text, voice, or photo, then uses AI-assisted analysis to estimate key nutrition fields. Meals can still be saved when AI is unavailable, so the core logging journey does not break because of a third-party service.

## My Role

Product Manager / Product Owner

I led the product thinking, feature scope, user flows, AI workflow design, backend requirements, QA testing, and technical implementation support.

This project is intentionally presented as a product case study, not only as a code sample. It demonstrates:

- Product discovery and problem framing
- MVP scoping and feature prioritization
- AI-assisted product design
- Mobile user flow design
- Backend/API requirement definition
- Error-state and fallback design
- Analytics and monetization planning
- Technical collaboration and QA execution

## Core User Flow

1. User signs up with email/password.
2. User logs a meal through text, voice, or photo.
3. User can save the meal immediately.
4. AI estimation can enrich the saved meal with nutrition values.
5. Home updates meal count and ChopperGrid totals.
6. Meals stores the user's logged history.
7. Tracker summarizes today and generates a 30-day AI analysis.

## Key Product Decision

The most important product decision was separating meal capture from AI estimation.

Originally, the app required AI analysis before a meal could be saved. That created a weak user journey because a backend or AI failure blocked the most important action: logging a meal.

The current flow allows the user to save first and estimate later. This keeps the core habit loop reliable while still supporting AI-powered nutrition enrichment.

## ChopperGrid Nutrients

The app tracks and displays the same nutrition structure across Add Meal, Home, Meals, and Tracker:

- Calories
- Protein
- Carbs
- Fat
- Fibre
- Sugar
- Sodium
- Water

## AI Features

- Meal Estimator: turns meal descriptions into structured nutrition estimates.
- Tracker Analysis: summarizes recent meal history into patterns, gaps, and next actions.
- Speech Transcription: converts recorded meal descriptions into text.
- Photo Support: captures a meal image for later AI-assisted analysis.

## Technical Architecture

```text
Expo React Native app
  |
  |-- Firebase Auth
  |-- Firestore user data
  |-- Netlify Functions
        |
        |-- Groq AI meal analysis
        |-- Groq audio transcription
        |-- Cloudinary upload signing
        |-- Paystack checkout and verification
        |-- PostHog backend event tracking
```

## Stack

- Expo / React Native
- TypeScript
- Firebase Auth
- Firestore
- Netlify Functions
- Groq AI
- Cloudinary
- Paystack
- PostHog

## Product Screens

- Authentication
- Home dashboard
- Add Meal
- Meals history
- Tracker
- Plans
- Profile
- Notifications

## Current Status

ChopperHub is in MVP/V2 testing.

Completed:

- Firebase email/password authentication
- Firestore user profile and meal storage
- Meal logging by typed description
- Voice transcription flow
- Photo capture flow
- Save-first, estimate-later meal flow
- Home ChopperGrid nutrient totals
- Meals history grouped by date
- Tracker daily totals and 30-day AI analysis
- Netlify backend function structure
- PostHog analytics configuration
- Paystack test-mode integration planning

In progress:

- Final Netlify deployment verification
- Google sign-in setup
- Full photo-to-nutrition upload flow
- iOS build and TestFlight path

## Local Development

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

Run checks:

```bash
npx tsc --noEmit
npm run lint
```

## Environment

The app uses public Expo environment variables for mobile-safe values and server-only variables in Netlify for secrets.

Public mobile values use the `EXPO_PUBLIC_` prefix.

Server secrets must stay in Netlify environment variables and should not be committed:

- `GROQ_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PAYSTACK_SECRET_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

## Portfolio Case Study

The full product case study is in:

```text
docs/portfolio-case-study.md
```

Use that document to write the portfolio page, LinkedIn project entry, or interview talking points.
