## 2026-10-17 - Dynamic ARIA Labels in Lists
**Learning:** When adding ARIA labels to mapped elements like player or team lists, it's essential to use dynamic template literals (e.g., `Remove player ${player.name}`) instead of generic labels like 'Remove player', to ensure screen reader users have enough context to distinguish between identical actions for different items.
**Action:** Always check the scope of the button when writing its `aria-label`. If it acts on a specific item in a list, include the item's name or unique identifier in the label.
