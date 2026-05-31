# AGENTS.md

## Global Codex Notes

### Skill Creation And Installation

When creating or updating local Codex skills, make the skill files compatible with both model-side loading and the Codex UI skill picker.

- Write SKILL.md and agents/openai.yaml as UTF-8 without BOM. PowerShell Set-Content -Encoding UTF8 can add a BOM on this Windows setup; prefer .NET UTF8Encoding($false) or verify bytes after writing.
- A skill may work through $skill-name while still failing to appear in the UI @ picker if metadata files contain a BOM or stale plugin cache is being scanned.
- Compare against known-good skills such as inscape-dev-host-smoke: both SKILL.md and agents/openai.yaml should start directly with --- or interface:, not EF BB BF.
- For plugin-packaged skills, bump the plugin version/cachebuster, reinstall with the real Codex CLI from config.toml (CODEX_CLI_PATH), and remove stale cache versions for that plugin when testing UI discovery.
- After installing or changing skills, restart Codex and test both paths: explicit $SkillName loading and UI @SkillName autocomplete.
- Prefer memorable no-hyphen display names for skills users should invoke from the UI, for example InitFlow, GitFlow, and OpsFlow, while keeping lower-case folder names valid.

Useful byte check on Windows:

```
powershell
$bytes = [System.IO.File]::ReadAllBytes('C:\path\to\SKILL.md')
$bytes[0..2] -join ' '
```

If the first three bytes are 239 187 191, the file has a UTF-8 BOM and should be rewritten without BOM.

## LexiKnot Project Context

- Use docs/project-knowledge.md as the compact local project memory, and docs/LexiKnot-project-brief.md as the Google Doc mirror with provenance.
- LexiKnot is a lightweight, framework-agnostic TypeScript engine for bidirectional regex visualization on an infinite Canvas 2D node graph.
- Preserve the architecture direction: io/app -> render -> topology -> parser -> core. Lower layers must not import higher layers.
- Keep parser code free of DOM, Canvas, coordinates, and layout concerns. Keep render code free of regex parsing logic.
- Use strict TypeScript. Avoid any; prefer precise types, generics, or unknown with narrowing.
- Prefer immutable updates for graph and AST data so undo/redo remains practical.

<!-- codex-init-flow: initialized -->

## Codex Project Workflow

Initialization status: initialized
Initialized at: 2026-05-31 20:02:02 +08:00
Project root: D:\LabProjects\LexiKnot
Initial git remote: git@github.com:onovich/LexiKnot.git

Use these workflow skills for routine Codex work in this project:

- `init-flow`: initialize or refresh this project document and workflow configuration.
- `project-git-workflow` / `git-flow`: use for git status, validation, commit, push, stash, ignore, and guarded discard operations.
- `project-ops-workflow` / `ops-flow`: use for environment checks, dependencies, build, test, lint, format, typecheck, dev server, smoke, package, and release dry-run operations.

Prefer the configured wrappers instead of guessing project commands:

```
powershell
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Status.cmd
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\CommitAndPush.cmd -Message "commit message" -Paths path\to\file,other\file
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\Stash.cmd -StashMessage "reason"
C:\Users\Administrator\.codex\skills\project-git-workflow\scripts\git\DiscardPaths.cmd -ConfirmDangerous -Paths path\to\file
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Validate.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Project-specific workflow configs live at:

- `.codex/project-git-workflow.json`
- `.codex/project-ops-workflow.json`

Do not silently fall back to generic git/build/test behavior when those configs exist. Update this section and the workflow configs deliberately when project policy changes.

<!-- /codex-init-flow -->


