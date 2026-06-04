# Git scaffold: `.bare` + `main` + worktrees

Local layout uses a **bare repository** (`.bare/`) plus **linked worktrees**. GitHub still stores the project at the repo root; locally you work inside `main/`.

## Layout

```
et2/                              ← container (cloud workspace or clone parent)
├── .bare/                        ← bare git object store (gitignored)
├── main/                         ← **main** worktree — run scripts here
│   ├── .git                      ← gitfile → .bare/worktrees/...
│   ├── run-demo.sh
│   ├── scripts/
│   │   ├── setup-git-scaffold.sh
│   │   └── setup-demo-worktrees.sh
│   └── ...
└── .worktrees/
    ├── demo-smart-thermostat/    ← branch demo/smart-thermostat
    ├── demo-motion-alarm/
    ├── demo-auto-blinds/
    ├── demo-weather-station/
    └── demo-touch-ui/
```

## First-time setup

From the container directory (parent of `main/`):

```bash
./scripts/setup-git-scaffold.sh
cd main
```

Or if scripts only exist inside `main/` after clone:

```bash
cd main
./scripts/setup-git-scaffold.sh   # when run from repo, detects container parent
```

The script:

1. `git clone --bare <origin> .bare`
2. `git worktree add main main`
3. Adds all `demo/*` trees under `.worktrees/`

## Daily use

```bash
cd main
./run-demo.sh smart-thermostat
git worktree list   # uses .bare via any linked worktree
```

Demo paths in shell scripts resolve to `../.worktrees/` from `main/`.

## Refresh all worktrees (every branch on GitHub)

```bash
./scripts/setup-all-worktrees.sh
# alias: ./scripts/setup-demo-worktrees.sh
```

Creates `.worktrees/<name>` for each `origin/*` branch:

| Branch pattern | Directory |
|----------------|-----------|
| `main` | `main/` (not under `.worktrees`) |
| `demo/*` | `.worktrees/demo-*` |
| `cursor/*`, `staging/*`, etc. | `.worktrees/<branch-with-slashes-as-dashes>` |

Source: https://github.com/flowtress-docker/et2

## Add / remove a demo worktree

```bash
git --git-dir=.bare worktree add .worktrees/demo-foo demo/foo
git --git-dir=.bare worktree remove .worktrees/demo-foo
git --git-dir=.bare worktree prune
```

## Rules

- Do not merge demo branches into `main`.
- `.bare/` and `.worktrees/` are gitignored.
- Commits and pushes happen from `main/` (or a demo worktree for that branch).

## CI

```bash
git clone --bare https://github.com/flowtress-docker/et2.git .bare
git --git-dir=.bare worktree add main main
cd main && ../scripts/setup-demo-worktrees.sh
./run-all-demos.sh
```
