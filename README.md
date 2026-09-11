# Decision-Support System for Marketplace Pricing Strategy - Frontend

You can read full information about this project [here](https://github.com/sonina-marina/Decision-Support-System-for-Marketplace-Pricing-Strategy-Backend/wiki)

React + TypeScript app built with Vite, styled with Tailwind CSS.

## Folder structure

```
src/
  pages/            One component per route (LoginPage, ProductsPage, ProductPage,
                     CalculatorPage, ScenariosPage, HelpPage, HelpMetricPage, ...)
  components/
    layout/          Sidebar, MainLayout, AuthLayout
    ui/              Reusable primitives: Modal, ConfirmDialog, TextField, ThemeToggle,
                     LanguageSwitcher
    products/        AddProductModal (also doubles as the edit form)
    calculator/      ProductCalcForm — the "pick a product or go custom" input form,
                     shared by the calculator and both sides of the scenario comparison
  context/           AuthContext (session, current user, login/logout)
  services/          One file per backend resource (auth, users, stores, products, metrics),
                     each a thin wrapper around the shared api/httpClient
  types/             TypeScript interfaces mirroring the backend's Pydantic schemas
  utils/             currency (formatting + symbol map), unitEconomicsCalculator
                     (the frontend port of the backend's MetricCalculator), jwt (payload decoding)
  i18n/              react-i18next setup + locales/en.json, locales/ru.json
```

## Theming

Both themes are defined as two sets of CSS variables in `index.css`, switched by a `data-theme="dark" | "light"` attribute on `<html>`. Tailwind's config maps utility classes (`bg-bg`, `text-text-primary`, `text-accent`, …) to these variables, so the same class names render correctly in either theme — no per-theme class duplication anywhere in components. `ThemeProvider` persists the choice to `localStorage` and defaults to the OS preference on first visit.

## Internationalization

`react-i18next` with `i18next-browser-languagedetector`. Translation keys are namespaced by feature (`auth.*`, `products.*`, `stores.*`, `calculator.*`, `scenarios.*`, `help.*`, `productForm.*`), not by component name, so refactoring a component never requires renaming translation keys.

## Authentication flow

- `AuthContext` decodes the JWT payload client-side (`utils/jwt.ts`) to read the user id (`sub`) and `role` claim without an extra request.
- On every page load it re-fetches the full user profile (`GET /api/v1/users/`) using that id, so the session survives a refresh.
- `ProtectedRoute` wraps the authenticated part of the route tree; unauthenticated visitors are redirected to `/login`.

## Client-side unit economics

`utils/unitEconomicsCalculator.ts` is a line-for-line port of the backend's Python `MetricCalculator`. Two features rely on it running purely in the browser, with no API calls:

- **Calculator page** — pick an existing product (fields are prefilled) or enter fully custom numbers; every keystroke recalculates instantly.
- **Scenarios page** — two independent instances of the same input form (`ProductCalcForm`) side by side, each recalculated locally; a comparison table below shows Variant A, Variant B, and a colored delta per metric (color depends on whether higher or lower is better for that specific metric — e.g. a lower CAC is an improvement, a lower CM is not).

Saving a calculation to the database (so it shows up in a product's history) is a separate, explicit action that does call the API (`POST /api/v1/metrics/`).

## Key pages

- **Login / Register** — split-screen layout (`AuthLayout`), shared between both
- **Stores & Products** — accordion of stores; each store's products are fetched lazily on first expand, multiple stores can stay open at once; store creation includes currency selection
- **Product page** — full characteristics on one side, current metrics + calculate button on the other; each abnormal metric shows a status badge (below/above the range considered normal) that links to a dedicated explanation page; full calculation history below as a table
- **Calculator** — the standalone, non-persisted "what-if" tool described above
- **Scenarios** — the two-variant comparison described above
- **Help** — plain-language explanation of the domain and of every metric, plus the linked-to explanation pages for out-of-range statuses

## Setup Guide

```bash
git clone https://github.com/sonina-marina/Decision-Support-System-for-Marketplace-Pricing-Strategy-Frontend
cd dss_frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`
