# Feature Specification: Catalog Pagination

**Created**: 2026-10-01

## User Scenarios & Testing

### User Story 1 - Browse catalog pages (Priority: P1)

Visitors can choose a numbered page or next control to see another subset of matching NFTs.

**Acceptance Scenarios**:

1. Given matching NFTs span more than one page, when a visitor chooses a page, then only that page’s NFTs are shown and the selected number is highlighted.
2. Given a visitor is not on the last page, when they use next, then the following page is shown.
3. Given filters, search, or ordering changes, when results update, then the listing returns to page one.

### Edge Cases

- The next control is disabled on the final page.
- No pagination is shown when a single page contains all matching NFTs.

## Requirements

- **FR-001**: The catalog MUST paginate its filtered and sorted result set.
- **FR-002**: The pagination MUST use the Figma visual treatment: 35 px controls, 8 px gap, primary selected page, bordered other pages, and supplied next-arrow SVG.
- **FR-003**: Changing a filter, search term, or sort order MUST reset the current page to the first page.
- **FR-004**: Page controls MUST be semantic, keyboard accessible, and expose the active page.

## Success Criteria

- **SC-001**: Selecting any available page changes the rendered NFT subset in one interaction.
- **SC-002**: At 390, 768, and 1440 px, pagination stays visible with no horizontal overflow.

## Assumptions

- The page count is derived from current results rather than fixed to the four placeholder buttons shown in Figma.
