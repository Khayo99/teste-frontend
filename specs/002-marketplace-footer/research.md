# Research: Marketplace Footer

## Decision 1: Component ownership

- **Decision**: Add `HomeFooter` as the final child of `HomePage`.
- **Rationale**: The Figma component is a full-width, end-of-screen footer and has no reuse requirement on another route.
- **Alternatives considered**: A global router layout footer would add it to routes not included in this scope.

## Decision 2: Newsletter behavior

- **Decision**: Validate e-mail in the browser and show a local success status.
- **Rationale**: The Figma describes an input and button but specifies no API or persistence contract.
- **Alternatives considered**: Calling an invented API would violate the available brief and create unsupported failure semantics.

## Decision 3: Social artwork

- **Decision**: Download the five SVGs exposed by Figma into `src/assets/footer/` and use them in their original order.
- **Rationale**: The constitution requires local static Figma assets in their intended positions.
- **Alternatives considered**: Lucide or hand-drawn social icons would substitute supplied assets and is not permitted.

## Decision 4: Responsive layout

- **Decision**: Use grid/flex reflow: features in a single row on large screens, then grids and stacked sections on medium and small screens.
- **Rationale**: It preserves Figma desktop composition while satisfying the project’s required widths without horizontal overflow.
- **Alternatives considered**: Retaining fixed 1154 px geometry would make the footer inaccessible on narrow screens.
