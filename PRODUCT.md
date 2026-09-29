# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, with equal weight on the public home page:

- **Clientes**: people in Brazil who need a home or local service (eletricista, diarista, encanador, etc.) and want to find someone nearby, see who they are, and book a time. They use the site mostly on the phone and are deciding whether to let a stranger into their home.
- **Profissionais autônomos**: independent service providers who want to be found by nearby clients and manage their bookings. They sign up for free and may upgrade to a paid plan for more visibility.

## Product Purpose

ContrataPro connects clients to autonomous professionals in their region, with a public profile per professional and online booking against the professional's real working hours. Success is a client finding a nearby professional and booking a time, and a professional receiving bookings without intermediaries.

## Positioning

Regional search by CEP plus direct booking in the professional's own agenda. ContrataPro does not intermediate the service or the payment: the client deals with and pays the professional directly (Pix, dinheiro, etc.). It is free for the client.

## Operating Context

- Client flow: define CEP/city → search by service or category → open professional profile (`/p/:slug`) → pick a slot → booking is confirmed by email.
- After an appointment is completed, the client receives a one-time review link (`/avaliar/:token`); only clients with a real booking can review.
- Professional flow: free signup → build profile and services → set working hours → receive bookings in the dashboard.
- Professionals pay ContrataPro a subscription through Mercado Pago; clients never pay the platform.

## Capabilities and Constraints

- Plans (source of truth `backend/seed_plans.py`): Free (1 serviço, 3 agendamentos/mês, permanente, sem cartão), Pro R$ 19,90/mês (ilimitado, badge "Profissional Ativo"), Premium R$ 39,90/mês (ilimitado, badge "Destaque", topo da busca).
- Stack: React 19 + Vite + styled-components, FastAPI backend. Public stats come from the API (`/api/.../public stats`); when the API is unavailable the UI must not show invented numbers.
- ContrataPro **does not verify** professionals (CPF is stored, not checked). Never claim "verificado", "checado" or background checks.
- ContrataPro does not process client payments and does not guarantee the service.

## Brand Commitments

- Name: ContrataPro. Logo: `frontend/src/assets/contratapro-logo.png`.
- Language: Brazilian Portuguese, with correct accents. Domain `contratapro.com.br`.
- Desired tone (confirmed by the owner, 2026-09-28): caloroso e local — human, neighbourhood-like, not a generic SaaS.

## Evidence on Hand

- Real reviews (`Review` model, `User.average_rating` / `total_reviews`) and real professional profile photos (Cloudinary) exist in production data and may be shown when fetched from the API.
- Real platform counts come from the public stats endpoint.
- There are no testimonials, press, partner logos or stock photography in the repo. Do not invent ratings, counts, testimonials or people.

## Product Principles

1. Trust comes from real people and real reviews, never from invented numbers or unearned badges.
2. Local first: the client's region (CEP) frames everything they see.
3. Say plainly what ContrataPro does and does not do (no intermediation, no verification, direct payment).
4. Free to start, for both sides; the paid plans are about visibility, not access.
5. Mobile-first: most visitors are on a phone.
