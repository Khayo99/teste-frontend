# Data Model: Marketplace Footer

## Newsletter Subscription State

| Field | Type | Constraints | Meaning |
|---|---|---|---|
| email | text | Required; valid e-mail format | Address entered by the visitor. |
| status | state | `idle`, `invalid`, or `success` | Current local form feedback. |

## Footer Link Group

| Field | Type | Constraints | Meaning |
|---|---|---|---|
| title | text | Required | Visible group label. |
| links | collection | At least one item | Destinations listed below the group label. |

## Social Link

| Field | Type | Constraints | Meaning |
|---|---|---|---|
| label | text | Required accessible name | Identifies the network to assistive technology. |
| artwork | local SVG | Must be one of the five Figma exports | Icon displayed for the network. |
| destination | URL | Safe placeholder anchor until a product destination exists | Activatable link target. |
