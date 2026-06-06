#!/usr/bin/env python3
"""Deterministic caveman compression — no Claude/API required."""

from __future__ import annotations

import re
from typing import List, Tuple

FILLER_RE = re.compile(
    r"\b(just|really|basically|actually|simply|essentially|generally|"
    r"certainly|surely|obviously|clearly|definitely|probably|perhaps|maybe|"
    r"quite|very|somewhat|rather|fairly|pretty)\b",
    re.IGNORECASE,
)
PLEASANTRY_RE = re.compile(
    r"\b(sure|certainly|of course|happy to|i'd recommend|i would recommend|"
    r"please note that|it is worth noting that|keep in mind that)\b[,:]?\s*",
    re.IGNORECASE,
)
HEDGE_RE = re.compile(
    r"\b(it might be worth|you could consider|it would be good to|"
    r"you may want to|you should consider|it is recommended to)\b\s*",
    re.IGNORECASE,
)
PHRASES: List[Tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bin order to\b", re.I), "to"),
    (re.compile(r"\bmake sure to\b", re.I), "ensure"),
    (re.compile(r"\bthe reason is because\b", re.I), "because"),
    (re.compile(r"\bhowever,\s*", re.I), ""),
    (re.compile(r"\bfurthermore,\s*", re.I), ""),
    (re.compile(r"\badditionally,\s*", re.I), ""),
    (re.compile(r"\bin addition,\s*", re.I), ""),
    (re.compile(r"\bYou should\b"), "Ensure"),
    (re.compile(r"\byou should\b"), "ensure"),
    (re.compile(r"\bRemember to\b"), ""),
    (re.compile(r"\bremember to\b"), ""),
    (re.compile(r"\bPlease\b"), ""),
    (re.compile(r"\bplease\b"), ""),
    (re.compile(r"\butilize\b", re.I), "use"),
    (re.compile(r"\bimplement a solution for\b", re.I), "fix"),
    (re.compile(r"\bextensive\b", re.I), "big"),
    (re.compile(r"\bapproximately\b", re.I), "~"),
    (re.compile(r"\bthat is\b", re.I), "i.e."),
    (re.compile(r"\bwhich is\b", re.I), "→"),
]
ARTICLE_RE = re.compile(r"\b(a|an|the)\s+(?=[A-Za-z`])", re.IGNORECASE)
MULTISPACE_RE = re.compile(r" {2,}")
BLANK_LINES_RE = re.compile(r"\n{3,}")
FRONTMATTER_RE = re.compile(r"\A(---\n.*?\n---\n)", re.DOTALL)
FENCE_SPLIT_RE = re.compile(r"(^```[\s\S]*?^```|^~~~[\s\S]*?^~~~)", re.MULTILINE)
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")


def _protect_inline(text: str) -> tuple[str, list[str]]:
    protected: list[str] = []

    def stash(match: re.Match[str]) -> str:
        protected.append(match.group(0))
        return f"\x00I{len(protected) - 1}\x00"

    return INLINE_CODE_RE.sub(stash, text), protected


def _restore_inline(text: str, protected: list[str]) -> str:
    for i, chunk in enumerate(protected):
        text = text.replace(f"\x00I{i}\x00", chunk)
    return text


def _compress_prose(text: str) -> str:
    for pattern, repl in PHRASES:
        text = pattern.sub(repl, text)
    text = PLEASANTRY_RE.sub("", text)
    text = HEDGE_RE.sub("", text)
    text = FILLER_RE.sub("", text)
    text = ARTICLE_RE.sub("", text)
    text = re.sub(r"\s+,", ",", text)
    text = re.sub(r"\s+\.", ".", text)
    text = MULTISPACE_RE.sub(" ", text)
    text = re.sub(r" +\n", "\n", text)
    return text


def _compress_segment(text: str) -> str:
    lines_out: list[str] = []
    for line in text.splitlines():
        if not line.strip():
            lines_out.append("")
            continue
        if (
            line.strip().startswith("|")
            or "`" in line
            or re.search(r"https?://", line)
            or re.match(r"^\s*[-*+]\s+`", line)
            or re.match(r"^\s*\d+\.\s+`", line)
        ):
            lines_out.append(line)
            continue
        heading = re.match(r"^(#{1,6}\s+)(.*)$", line)
        if heading:
            prefix, title = heading.groups()
            if "`" in title or "http" in title:
                lines_out.append(line)
                continue
            lines_out.append(prefix + _compress_prose(title))
            continue
        lines_out.append(_compress_prose(line))
    return "\n".join(lines_out)


def compress_markdown(text: str) -> str:
    front = ""
    body = text
    m = FRONTMATTER_RE.match(text)
    if m:
        front = m.group(1)
        body = text[m.end() :]

    parts = FENCE_SPLIT_RE.split(body)
    out: list[str] = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            out.append(part)
        else:
            out.append(_compress_segment(part))

    body = "".join(out)
    body = BLANK_LINES_RE.sub("\n\n", body)
    return front + body
