## 2024-05-18 - Missing ARIA labels in mapped lists
**Learning:** Icon-only buttons rendered inside `.map()` functions (like the move/remove player buttons in TeamManagementModal) require dynamic template literal `aria-label`s to give screen readers proper context about which specific item the button affects.
**Action:** When adding `aria-label`s to icon-only buttons in mapped lists, always include the item's identifier (e.g., `aria-label={\`Remove \${item.name}\`}`) rather than static text.
