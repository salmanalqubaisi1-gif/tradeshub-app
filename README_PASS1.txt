TRADESHUB PASS 1 REFACTOR

Adds:
- src/types/home.ts
- src/constants/home.ts
- src/utils/home.ts

Replaces:
- src/app/home.tsx

This pass only extracts top-level types/constants/helper functions. UI behavior is intended to remain unchanged.

The temporary // @ts-nocheck remains on home.tsx for V0 safety.
