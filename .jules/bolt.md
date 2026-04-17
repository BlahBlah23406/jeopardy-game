## 2024-05-30 - [Vitest jsdom issues with speech synthesis timeout]
**Learning:** `bun test` in this codebase failed originally due to network and configuration issues. `pnpm run test` executes tests, but some fail due to jsdom lacking full `window.speechSynthesis` implementations.
**Action:** When making isolated performance optimizations, verify building via `bun run build`. Test output failures may be pre-existing.
