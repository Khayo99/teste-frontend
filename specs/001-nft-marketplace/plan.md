# Implementation Plan: NFT Marketplace Home

**Branch**: `001-nft-marketplace` | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)

## Summary

Implement Figma frame `Desktop / Início` with its KURIO header, hero, filters, sorting and catalog
cards. Assets come from the Figma node and are saved locally. Catalog interactions use typed mock data.

## Technical Context

**Language/Version**: TypeScript 6, React 19

**Primary Dependencies**: TanStack Router, TanStack Query, Axios, Zustand, MSW, Tailwind CSS, shadcn/ui

**Storage**: Local browser storage through the typed MSW repository and selected Zustand UI state

**Testing**: Playwright E2E and visual regression; TypeScript, ESLint and production build gates

**Target Platform**: Modern Chromium desktop, responsive down to 390px

**Project Type**: Single-page web application

**Constraints**: No explicit `any` or `unknown` in application code; types live in `src/@types`; no
code comments; Figma assets are saved locally and referenced only from local paths

**Scale/Scope**: This increment implements the desktop-home Figma frame and its catalog interactions.
Checkout, account and mobile-specific frames remain planned but unimplemented.

## Constitution Check

| Gate | Result | Evidence |
|---|---|---|
| Figma and brief govern the result | Pass | Node `2:2` is the visual target. |
| Mandatory stack is used by responsibility | Pass | Router, Query, Axios, MSW, Tailwind and Zustand are used. |
| Data integrity is preserved | Pass | Catalog data and filters use typed mock contracts. |
| Responsive and accessible interface | Pass | Semantic controls, labels and responsive layout are included. |
| Verification is planned | Pass | Type, lint, build and Playwright catalog coverage are included. |

## Project Structure

```text
src/
├── @types/
├── assets/home/
├── components/ui/
├── features/catalog/
├── features/home/
├── mocks/
├── stores/
└── routes/

e2e/
└── home.spec.ts
```

**Structure Decision**: Feature modules own their screens and behavior. Shared visual primitives remain
in `components/ui`; reusable domain types live in `src/@types`.

## Complexity Tracking

No constitution violations require justification.
