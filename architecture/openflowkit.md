# OpenFlowKit integration (et2 context branch)

[OpenFlowKit](https://github.com/flowtress-docker/openflowkit) is the diagram studio used to **visualize** et2 architecture on this branch. It does not replace [`architecture.yaml`](../staging/v2/docs/grill-me_sesh/architecture.yaml) as the canonical spec.

## For humans

1. Open [`architecture/README.md`](README.md).
2. Click **Open in editor** on **System layers** (or any diagram).
3. Pan, zoom, and explore in the browser at [openflowkit.com](https://openflowkit.com).

## For agents (optional MCP)

When `@openflowkit/mcp-server` is available on npm (or built from the [flowtress-docker fork](https://github.com/flowtress-docker/openflowkit/tree/main/mcp-server)):

```json
{
  "mcpServers": {
    "openflowkit": {
      "command": "npx",
      "args": ["-y", "@openflowkit/mcp-server"]
    }
  }
}
```

**Workflow:**

1. Read `staging/v2/docs/grill-me_sesh/architecture.yaml`.
2. Read or edit `architecture/*.ofk` (OpenFlow DSL).
3. `validate_openflow_dsl` → fix diagnostics.
4. `create_viewer_url` → share link with the operator.
5. After YAML changes, update matching `.ofk` and run `node scripts/encode-openflow-viewer-url.mjs architecture`.

**Resources (MCP):**

| URI | Purpose |
|-----|---------|
| `openflowkit://docs/dsl-cheatsheet` | DSL syntax |
| `openflowkit://templates` | Starter templates |
| `openflowkit://icons` | Architecture icon catalog |

**Local dev viewer:** set `OPENFLOWKIT_APP_URL=http://localhost:5173` when running OpenFlowKit from source.

## Docs upstream

- [OpenFlow DSL](https://docs.openflowkit.com/openflow-dsl/)
- [MCP Server](https://docs.openflowkit.com/mcp-server/)
- [Embed in GitHub](https://docs.openflowkit.com/github-embed/)
