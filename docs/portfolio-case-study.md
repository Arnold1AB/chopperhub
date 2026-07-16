# ChopperHub Portfolio Case Study

## Project

ChopperHub: AI-assisted meal tracking and nutrition analysis.

## Role

Product Manager / Product Owner

I owned the product direction, user journey, feature scope, AI workflow decisions, technical requirements, QA testing, and implementation coordination.

## Problem

Meal tracking apps often ask users to do too much manual work. Users have to search for foods, guess portions, enter nutrients, and repeat the same steps every day. This makes the habit hard to keep.

The product opportunity was to reduce the effort required to log a meal while still giving users useful nutrition feedback.

## Target Users

- Users who want simple meal tracking without complex calorie counting.
- Users eating local or mixed meals that may not exist in standard food databases.
- Users who want daily nutrition awareness rather than medical-grade diet tracking.
- Users who prefer quick capture through text, voice, or photo.

## Product Goal

Make meal logging fast enough for daily use, then turn logged meals into useful nutrition patterns.

## MVP Scope

The MVP focuses on one reliable habit loop:

1. Capture a meal.
2. Save it.
3. Estimate nutrients when AI is available.
4. Show totals on Home.
5. Analyze patterns in Tracker.

## Core Features

- Email/password authentication.
- User profile setup.
- Meal logging by typed description.
- Voice recording and transcription.
- Photo capture for meal context.
- AI-assisted nutrient estimation.
- Home ChopperGrid nutrition totals.
- Meals history grouped by day.
- Tracker daily totals.
- 30-day AI tracker analysis.
- Notification preference flow.
- Subscription/payment path planning.
- Product analytics through PostHog.

## Key Product Decision: Save First, Estimate Later

The first version of the Add Meal flow required AI estimation before saving. That created a fragile experience because users could lose the main action if the AI service, backend, or network failed.

I changed the product logic so users can save a meal first. AI estimation becomes an enhancement instead of a blocker.

This decision improves:

- Reliability
- User trust
- Daily habit formation
- Offline or weak-network tolerance
- Error recovery

## AI Design

AI is used where it reduces user effort:

- Convert a natural meal description into structured nutrition fields.
- Transcribe spoken meal descriptions into text.
- Analyze recent meal history into patterns and next actions.

AI is not treated as the source of truth. The app labels outputs as estimates and avoids saving fake precision when details are missing.

## Nutrition Data Model

The same nutrient structure is shared across Add Meal, Home, Meals, and Tracker:

- Calories
- Protein
- Carbs
- Fat
- Fibre
- Sugar
- Sodium
- Water

This keeps the product consistent and makes the dashboard easier to understand.

## System Design

```text
Mobile App
  Expo + React Native + TypeScript

Authentication
  Firebase Auth

Database
  Firestore
  users/{uid}
  users/{uid}/meals/{mealId}

Backend
  Netlify Functions

AI
  Groq meal analysis
  Groq transcription

Media
  Cloudinary signed upload support

Payments
  Paystack checkout and verification

Analytics
  PostHog mobile and backend events
```

## Technical Tradeoffs

### Firebase Instead Of Supabase

The project moved to Firebase because the app needed a backend that would not pause during testing and could support mobile authentication, user documents, and simple per-user meal records.

### Netlify Functions Instead Of Client-Side AI Calls

AI, Cloudinary, and Paystack secrets cannot live inside a mobile app. Netlify Functions act as the secure server layer between the mobile app and third-party APIs.

### Groq For AI Testing

Groq was selected for the test phase because it supports fast AI experimentation and lowers early testing cost.

### Manual Save Fallback

The product does not force AI to succeed before the user can log a meal. This keeps the main journey available even when AI is temporarily unavailable.

## Success Metrics

The product can be evaluated with:

- Sign-up completion rate.
- Meal log completion rate.
- Percentage of meals saved without AI failure.
- Percentage of meals later enriched with AI estimates.
- Daily active meal loggers.
- Tracker analysis usage.
- Notification opt-in rate.
- Subscription checkout start and completion.

## QA And Testing

Tested flows:

- Firebase sign up and sign in.
- Add Meal typed input.
- Save meal without AI estimate.
- Estimate nutrients after saving.
- Home meal count and ChopperGrid totals.
- Meals history grouping.
- Tracker daily totals.
- Backend error handling.
- Android emulator testing.

## Current Status

ChopperHub is in MVP/V2 testing.

The strongest current product story is the reliability improvement in the meal logging flow: the user can capture and save meals first, then use AI as an assistive layer.

## Portfolio Summary

ChopperHub demonstrates my ability to define an AI-enabled mobile product, shape user journeys, make pragmatic technical tradeoffs, work with backend constraints, and test the product from a user-experience perspective.

It is a product management case study supported by a working technical implementation.
