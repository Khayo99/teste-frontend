# Research: NFT Marketplace Home

## Decisions

### Catalog data ownership

**Decision**: Catalog records live in the MSW-backed REST boundary and are consumed through TanStack
Query.

**Rationale**: Filters, sorting, loading, errors and cache invalidation are server-state concerns.

### Interface state ownership

**Decision**: Zustand owns only cross-screen local state, including drawer state and post-login return
location.

**Rationale**: It avoids duplicating remote catalog data.

### Asset delivery

**Decision**: Assets exposed by Figma node `2:2` are downloaded into `src/assets/home`.

**Rationale**: This preserves fidelity without temporary URLs.

### Type policy

**Decision**: Application models, request parameters and UI props live in `src/@types`; no explicit
`any` or `unknown` are used in application files.
