# Git scaffold: `.bare` + `main` + worktrees

Local: **bare** `.bare/` + linked worktrees. GitHub repo root unchanged; work in `main/`.

## Layout

```
et2/                              ← container
├── .bare/                        ← bare store (gitignored)
├── main/                         ← **main** worktree — run scripts here
│   ├── .git                      ← gitfile → .bare/worktrees/...
│   ├── run-demo.sh
│   ├── scripts/
│   │   ├── setup-git-scaffold.sh
│   │   └── setup-demo-worktrees.sh
│   └── ...
└── .worktrees/
    ├── demo-smart-thermostat/    ← demo/smart-thermostat
    ├── demo-motion-alarm/
    ├── demo-auto-blinds/
    ├── demo-weather-station/
    └── demo-touch-ui/
```

## First-time setup

From container parent of `main/`:

```bash
./scripts/setup-git-scaffold.sh
cd main
```

Or scripts only in `main/` after clone:

```bash
cd main
./scripts/setup-git-scaffold.sh   # detects container parent
```

Script:

1. `git clone --bare <origin> .bare`
2. `git worktree add main main`
3. `setup-all-worktrees.sh` — one checkout per remote branch

## Daily use

```bash
cd main
./run-demo.sh smart-thermostat
git worktree list   # uses .bare via any linked worktree
```

Demo scripts: `../.worktrees/` from `main/`.

## Refresh all worktrees (every branch on GitHub)

```bash
./scripts/setup-all-worktrees.sh
# alias: ./scripts/setup-demo-worktrees.sh
```

`.worktrees/<name>` per `origin/*` branch:

| Branch pattern | Directory |
|----------------|-----------|
| `main` | `main/` (not under `.worktrees`) |
| `demo/*` | `.worktrees/demo-*` |
| `cursor/*`, `staging/*`, etc. | `.worktrees/<slashes→dashes>` |

Source: https://github.com/flowtress-docker/et2

## Add / remove a demo worktree

```bash
git --git-dir=.bare worktree add .worktrees/demo-foo demo/foo
git --git-dir=.bare worktree remove .worktrees/demo-foo
git --git-dir=.bare worktree prune
```

## Rules

- Don't merge demo branches into `main`.
- `.bare/` + `.worktrees/` gitignored.
- Commit/push from `main/` or branch worktree.

## CI

```bash
git clone --bare https://github.com/flowtress-docker/et2.git .bare
git --git-dir=.bare worktree add main main
cd main && ../scripts/setup-demo-worktrees.sh
./run-all-demos.sh
```
