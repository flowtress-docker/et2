import json, re, textwrap

with open('context7-output2.json') as f:
    data = json.load(f)

# Mapping of library -> list of docsResults
lib_docs = {}
for item in data.get('docsResults', []):
    lib = item['library']
    lib_docs.setdefault(lib, []).append(item)

# Resolved info for source links and IDs
resolved_map = {}
for item in data.get('resolved', []):
    lib = item['library']
    resolved_map[lib] = item

def pick_snippet(lib):
    results = lib_docs.get(lib, [])
    candidates = []
    for r in results:
        content = r.get('result', {}).get('content', [])
        for c in content:
            if c.get('type') != 'text':
                continue
            text = c['text']
            # split into blocks
            blocks = [b.strip() for b in text.split('--------------------------------') if b.strip()]
            for block in blocks:
                # look for code fence
                if '```' in block:
                    # extract source link
                    m = re.search(r'Source:\s*(\S+)', block)
                    source = m.group(1) if m else ''
                    # check relevance
                    lower = block.lower()
                    score = 0
                    if 'circuit' in lower: score += 2
                    if 'simulation' in lower: score += 2
                    if 'netlist' in lower: score += 2
                    if 'python' in lower: score += 1
                    if 'schematic' in lower: score += 1
                    if 'pcb' in lower: score += 1
                    if 'create' in lower: score += 1
                    candidates.append((score, block, source, r['query']))
    if not candidates:
        return None, None, None
    candidates.sort(key=lambda x: x[0], reverse=True)
    best = candidates[0]
    return best[1], best[2], best[3]

def extract_code(block):
    # extract the first fenced code block
    m = re.search(r'```(?:\w+)?\n(.*?)```', block, re.DOTALL)
    if m:
        code = m.group(1).strip()
        lines = code.splitlines()
        if len(lines) > 10:
            code = '\n'.join(lines[:10]) + '\n...'
        return code
    # maybe APIDOC block with inline code
    m = re.search(r'```APIDOC\n(.*?)```', block, re.DOTALL)
    if m:
        code = m.group(1).strip()
        lines = code.splitlines()
        if len(lines) > 10:
            code = '\n'.join(lines[:10]) + '\n...'
        return code
    return None

def has_api(lib):
    r = resolved_map.get(lib)
    if not r:
        return False
    if r.get('error'):
        return False
    content = r.get('result', {}).get('content', [])
    for c in content:
        if c.get('type') == 'text':
            # if there is any libraryId, it resolved
            if re.search(r'/[^\s]+/[^\s]+', c['text']):
                return True
    return False

sections = []
for lib in ['KiCad', 'PySpice', 'skidl', 'lcapy', 'Qucs', 'ngspice', 'Xyce', 'LTspice']:
    if not has_api(lib):
        if lib in ['Qucs', 'ngspice', 'Xyce', 'LTspice']:
            # skip non-API ones for main sections, but include in Other if they resolved somewhat
            continue
        sections.append(f"## {lib}\n\n- **Programmatic/API interface**: Not found in Context7.\n")
        continue
    block, source, query = pick_snippet(lib)
    api = "Yes" if has_api(lib) else "No"
    md = f"## {lib}\n"
    md += f"\n- **Programmatic/API interface**: {api}\n"
    if block:
        code = extract_code(block)
        if code:
            md += f"- **Example snippet** (from query: *{query}*):\n"
            md += f"\n```python\n{code}\n```\n"
        else:
            # fallback: show first 5 lines of block
            lines = block.splitlines()[:5]
            md += f"- **Context7 excerpt** (from query: *{query}*):\n"
            md += f"\n> {' > '.join(lines)}\n"
        if source:
            md += f"- **Source**: {source}\n"
    else:
        md += "- **Example snippet**: No relevant code snippet found in Context7.\n"
    # Also include the libraryId used
    docs = lib_docs.get(lib, [])
    if docs:
        md += f"- **Context7 library ID**: `{docs[0].get('libraryId', 'N/A')}`\n"
    sections.append(md)

# Other EDA SDKs section
other = []
for lib in ['ngspice', 'Xyce', 'LTspice']:
    if has_api(lib):
        block, source, query = pick_snippet(lib)
        api = "Yes"
        md = f"- **{lib}**\n"
        md += f"  - Programmatic/API interface: {api}\n"
        if block:
            code = extract_code(block)
            if code:
                md += f"  - Example snippet (from query: *{query}*):\n"
                md += f"    ```python\n    {code.replace(chr(10), chr(10)+'    ')}\n    ```\n"
            if source:
                md += f"  - Source: {source}\n"
        docs = lib_docs.get(lib, [])
        if docs:
            md += f"  - Context7 library ID: `{docs[0].get('libraryId', 'N/A')}`\n"
        other.append(md)

if other:
    sections.append("## Other EDA SDKs\n\n" + "\n".join(other))

with open('research/04-context7-findings.md', 'w') as f:
    f.write("# Context7 Research Findings\n\n")
    f.write("\n".join(sections))

print("Done")
