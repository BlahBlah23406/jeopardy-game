## 2024-05-22 - Input Validation Feedback\n**Learning:** Hidden form constraints (like "minimum 4 players") cause user frustration when only revealed on submission.\n**Action:** Always surface critical constraints (counts, limits) in helper text and validate in real-time.
## 2026-07-17 - Added aria-labels to TeamManagementModal and TeamAssignmentCard
**Learning:** Icon-only buttons mapping to lists of players or teams need dynamic `aria-label`s (e.g., `Remove player ${player.name}`) for full screen-reader accessibility, ensuring the target of the action is clearly communicated.
**Action:** Always verify mapped lists containing icon-only buttons for dynamic, context-aware accessible names, as a static label like 'Remove Player' lacks essential context.
