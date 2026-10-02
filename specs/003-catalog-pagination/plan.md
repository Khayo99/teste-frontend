# Implementation Plan: Catalog Pagination

Use a typed pagination component in `src/features/catalog/components/catalog-pagination.tsx`. `HomeCatalog` derives pages after `filterCatalog`, slices the visible data, and resets page state whenever the query changes. The exported Figma arrow is a local static asset. Validation uses the existing build and a focused Playwright scenario.
