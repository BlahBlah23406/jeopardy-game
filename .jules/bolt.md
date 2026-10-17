## 2026-10-17 - FinalJeopardyGame Render Optimization
**Learning:** Extracting derived state variables (e.g. array filtering via `team.players.filter`) out of inner rendering loops (like `team.players.map`) up to the outer loop (`teams.map`) prevents O(N*M) redundant object allocations per render cycle. This is particularly important for frequent re-renders in interactive components where derived state logic executes repeatedly.
**Action:** Always scan nested `.map()` or `.filter()` loops inside JSX for variables that can be hoisted to a higher scope.
