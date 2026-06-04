# Repository layout

This workspace uses a **bare + worktree** layout:

| Path | Role |
|------|------|
| `.bare/` | Bare git repository |
| `main/` | **Project root** — open this in the editor; run `run-demo.sh` here |
| `.worktrees/` | Demo branch checkouts |

```bash
cd main
```

Details: [docs/GIT-SCAFFOLD.md](docs/GIT-SCAFFOLD.md) (also in `main/docs/` after sync).

Setup: `./scripts/setup-git-scaffold.sh` from this directory.
