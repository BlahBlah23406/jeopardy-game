## 2024-05-21 - Form Validation UX
**Learning:** This app used `alert()` for form validation, which is disruptive. Replacing it with inline feedback and disabled states is significantly better UX.
**Action:** Always prefer inline helper text and disabled buttons over `alert()` for form validation. Use `aria-describedby` to link inputs to their constraints.
