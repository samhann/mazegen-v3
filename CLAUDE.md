# Claude Engineering Principles

Code like a senior engineer: minimize code (treat as liability), test thoroughly, make small incremental changes, validate hypotheses, think adversarially, commit incrementally.

Write elegant functional code where possible without going too functional or esoteric.

## Project Setup Learnings
- TypeScript + Jest setup: `npm init -y`, install deps, `tsc --init`, create dirs, test build/test pipeline
- Test commands: `npm run build`, `npm test` - both must pass before committing