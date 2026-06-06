# et2 architecture diagrams (OpenFlowKit)

Interactive diagrams for the **et2 v2 plugin** architecture. Canonical spec: [`staging/v2/docs/grill-me_sesh/architecture.yaml`](../staging/v2/docs/grill-me_sesh/architecture.yaml).

> **Important:** Use links below (`app.openflowkit.com/#/view…`). The marketing site `openflowkit.com` does **not** load diagrams.

## Quick start

### Local (fast — recommended)

```bash
./scripts/serve-architecture-local.sh
```

Open **http://127.0.0.1:8765/gallery-mermaid.html** — static Mermaid, instant load, edges render correctly.

| What | URL |
|------|-----|
| **Diagram gallery (all 6)** | http://127.0.0.1:8765/gallery-mermaid.html |

Generated from `architecture/*.ofk` via `scripts/ofk-to-mermaid.mjs`. No Node install beyond repo scripts.

### Local OpenFlowKit editor (optional, slow)

OpenFlowKit’s read-only `#/view` viewer has known edge-rendering bugs (nodes without React Flow handles). Use only if you need **Open in Editor**.

```bash
./scripts/serve-openflowkit-local.sh
```

| What | URL |
|------|-----|
| Same-origin iframe gallery | http://127.0.0.1:5173/et2-gallery.html |
| OpenFlowKit Home (empty) | http://127.0.0.1:5173/#/home |

First run clones [OpenFlowKit](https://github.com/Vrun-design/openflowkit) into `.openflowkit/` and runs `npm install` (~1–2 min). **Bun does not help** — rendering runs in the browser.

### Cloud viewer

**[Open system layers diagram →](https://app.openflowkit.com/#/view?flow=~eNptkj1rwzAQhnf9iiNrmw4ZBcmQFEqhIYGm7RAyyIoSHznrjCTbhNL_XtmOP0ozGN-H9HDvvToRVxJMmEE5gy0VZ7SgnE4xGB0KZ4DU1TgvjuhiAdlK2C2F2CeOK2_cATg3TgV2Eja3CL4BdX1w8hFPTB5BM9X9SUKFmcCP2OeOtfH-AGh9UESyC6Z5M8GTTwfIM1eWWB1HIE8qtCR_9cFkB1BnY4OEFR_RntsMHsBfkGggLTmMICUymfCHkulcwnq1hTh3aUZC3pv8_uVeTKkcKhu8hM82AmOjGDNgXjAsnbI6HZFUlkTyH1BgJp0qjFe2UemJXfa6iXIqvlQ41YQDcWdchlbRXWAny2PmXSnhjbWiOvunb80Wo3MjismimXRsOOP3cGinkPBV_8AXiQ_R9ZHIVV7c54juqcB8vmg9EjffYbqoly9a4-p2ncWvibvFii5oqv2W-nOtTtE3mmIzrmhbo8Iv9ycEGw)**

Pan, zoom, and explore. Use **Open in Editor** in the viewer toolbar to edit the layout.

## All diagrams

| Diagram | Open in OpenFlowKit |
|---------|---------------------|
| **System layers** | [View](https://app.openflowkit.com/#/view?flow=~eNptkj1rwzAQhnf9iiNrmw4ZBcmQFEqhIYGm7RAyyIoSHznrjCTbhNL_XtmOP0ozGN-H9HDvvToRVxJMmEE5gy0VZ7SgnE4xGB0KZ4DU1TgvjuhiAdlK2C2F2CeOK2_cATg3TgV2Eja3CL4BdX1w8hFPTB5BM9X9SUKFmcCP2OeOtfH-AGh9UESyC6Z5M8GTTwfIM1eWWB1HIE8qtCR_9cFkB1BnY4OEFR_RntsMHsBfkGggLTmMICUymfCHkulcwnq1hTh3aUZC3pv8_uVeTKkcKhu8hM82AmOjGDNgXjAsnbI6HZFUlkTyH1BgJp0qjFe2UemJXfa6iXIqvlQ41YQDcWdchlbRXWAny2PmXSnhjbWiOvunb80Wo3MjismimXRsOOP3cGinkPBV_8AXiQ_R9ZHIVV7c54juqcB8vmg9EjffYbqoly9a4-p2ncWvibvFii5oqv2W-nOtTtE3mmIzrmhbo8Iv9ycEGw) |
| Plugin install | [View](https://app.openflowkit.com/#/view?flow=~eNpVkE1PwzAMhu_5FdaufBw4RhqXcgRRDSQO0w5Z6jbW0qRyXBBC_HfSdCvdIbL9On5kv62PXxpQHqD2Y0cBKCQx3kObG6ohRisUg4bnnVL73GI5QAkaXgdkI5HnOqn9wNFiSgfgMU_sxoV2NxT4fXLwA2Qn3uYduadg_OYWbPSRs3T0I27gdwVqUPICGp5KBBeT_BPe0LB1q3nTH5GvAflnS52GDyZBeKnqswI3kE6U71zRRCh0acX7pOhRroEDY-upc3mp-pKCxOitM9m-BVc5tKeK2HpcEbHPlvmmIDE02Sk0zbe-mF8qpYqfsN0-Tkaq_Eo-e6HmUJT5FHW-aFKW7dSSzZwC_gNvn6lq) |
| Create simulation | [View](https://app.openflowkit.com/#/view?flow=~eNptkE1PwkAQhu_7KyZcFU08NgGjJKIJUYLxoKSH7XaA0d3uZnZbDuJ_dygFauJlvt7Jk3dmZf02A0w3MGHUCSGSq61O5CtYiaZKYjT7NoPZQqllTJpTDoG9CymDl4Csk2d4nnUztZRsMMYcGKO3DWawOBTQaCZdJREMBYRvILMHD6aU7llXZjO4BOOtZ5lpVyAP4EctS9mO4iAXrVoRuwzuXEHr2tcRnE5mc3tGPaINE2Jj8V_Wydsaq71zMTftKriSN1zLwqccHM_EB29L5LmtY49Y2Br_AouabJlBIA9cV3ABW_-1paGx1DOnnRMjZ0xD3mJqQViVOZRoqUFRXsnB22ImmI-nuURywXOCmDBEpQ6fhtFofPyx6jIMx8cvqS7LaPeOcXc6uS9MLGruSceiZbcnqTa2fedO_QKsJsLq) |
| Live session | [View](https://app.openflowkit.com/#/view?flow=~eNqNkTFPxDAMhff8CutmbmGsdCcdrEVIHIgBdUhTH2dd0lRO2qpC_Hfc0rQdGJgSv2d9sV8u1vcZYLyHnDqEQK61OpKvIWAIcqqKGM2oZPD6oNRHGEJEVyQ_g9Mn1jGVoKVXQF9AZjR3p7GmOOzuwHjrWaTStriD7w2KXOAug9wbbcdKaNwhr5QnX1P0vIGgQ9a2mjiazZWiTNkyFtAwOc1DBu_-1hOgK7FaSbkefBv_Bbpoa0ttbhn0I2lvLEGl0cmWC-4FL4zh-thviFpe5InXsDeSSyFWHdnbkMG5bRorb9ZRVk3yyjtbqpDDhtaRtxgnXMm-l2QK8I3MHEf7eb4B1VFuJm5Yb9L7R-wqfdXhcJyjV7_HpMzxJWl_XHJQszW1pRFUcsfORVwW24orMdnqB4z138E) |
| Session end | [View](https://app.openflowkit.com/#/view?flow=~eNptkDFvwkAMhXf_CitzWTqeBAtrkRBRpwhVcGeqE5dzaidEVcV_r0MLCVK28_Pzd34-Je4dUvuKJalGzkg5QIhCvrXK4dsOoNJvbaneY-0bh5v1Fj3nbA4K-IPRD75im7rP4sU6icXKY-qowCtUjbA39B5D1P-xP8ZYj5D33DxjDvWR5JmjLTcfKheHZaxRSS4kN1Eny3BvYyNGKMxAfIoOez73cWHPIfkEUX51B6EZhtksDGdyj5v5xEoBwO6Di9UkGUxCLperx-6zuu0Ad8NNHT6Be2tUfgEYF5UX) |
| Anti-patterns | [View](https://app.openflowkit.com/#/view?flow=~eNqVkMFKxDAQhu95ip-e7cVjDoJ2EZH14i4oLGUJ6awdm01Kkros4rubdKtdEEFPk3wz-Zj8O-MOEhQvcW0jl72KkbwNomFPOrKzEusbITbKWhdVBjUiR0MSC4fE8A7tjPMShaemwIfY9N5pCqHGTnW0NbqRuE0nLKsF2OJu_bBMr1hnefFcsdeGiovfNYEN2SixGivelGeV6suQuv8SvYZt3x6DRGU4mcrADeF-hQxZ_8mlvG45pmgGT3Xq-hyTxCMpgyfXHRi0H8wYFJw1x9lZtaS7H17ak1dmdIsxV5RX37nN5BTBfJ9-Ir4mM5uWEafZczJNn6NP5XurQg) |

URLs are also in [`viewer-urls.json`](viewer-urls.json).

## Source files

| File | Maps to `architecture.yaml` |
|------|-----------------------------|
| [`et2-system-layers.ofk`](et2-system-layers.ofk) | `layers[]` |
| [`et2-install-flow.ofk`](et2-install-flow.ofk) | `flows.install` |
| [`et2-create-simulation.ofk`](et2-create-simulation.ofk) | `flows.create_simulation` |
| [`et2-live-session.ofk`](et2-live-session.ofk) | `flows.live_interaction` |
| [`et2-session-end.ofk`](et2-session-end.ofk) | `flows.session_end` |
| [`et2-anti-patterns.ofk`](et2-anti-patterns.ofk) | `anti_patterns[]` |

## Regenerate viewer URLs

After editing any `.ofk` file:

```bash
cd scripts && npm install && node encode-openflow-viewer-url.mjs ../architecture
```

Commit both the `.ofk` and updated `viewer-urls.json`.

## Tooling

- **App (diagrams):** [app.openflowkit.com](https://app.openflowkit.com)
- **Marketing site (no viewer):** [openflowkit.com](https://openflowkit.com)
- **Upstream:** [flowtress-docker/openflowkit](https://github.com/flowtress-docker/openflowkit)
- **Agent setup:** [openflowkit.md](openflowkit.md)
