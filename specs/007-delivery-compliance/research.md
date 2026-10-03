# Research: Delivery Compliance

## Decision: Keep MSW as the authoritative simulation boundary

Existing handlers already intercept Axios and Socket.IO. Extending that state model preserves deterministic tests and avoids UI-side fake responses.

## Decision: Scope cache keys by visitor/user identity

TanStack Query keys will use `visitor:<id>` or `user:<id>`, while tokens stay out of keys. Logout removes private queries and disconnects the realtime manager.

## Decision: Resolve pending orders by persisted timestamps

Timers are unreliable across reloads. Orders store a resolution deadline/status transition and handlers resolve due orders when queried; Socket.IO emits the transition when a live connection exists.

## Decision: Use Decimal.js for every monetary operation

Transport and receipt values remain strings. UI formatting receives a Decimal/string and never multiplies `Number` values.

## Decision: Provider-neutral deployment handoff

The user performs deployment. README documents `dist`, build variables, HTTPS, SPA fallback, worker availability, and deep-link checks without committing a provider-specific integration.
