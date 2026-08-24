#!/usr/bin/env python3
"""Construit learn/assets/content.js a partir des trois documents de docs/.

Usage : python3 learn/build.py
A relancer apres chaque modification de docs/NOTES.md, DEBUG.md, FRICTIONS.md.
"""
from __future__ import annotations

import html
import json
import re
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DOCS = ROOT / "docs"
OUT = HERE / "assets" / "content.js"

SOURCES = [
    ("notes", "NOTES.md", "Notes", "Les notions", "Reviser"),
    ("debug", "DEBUG.md", "Debug", "Les pannes", "Enqueter"),
    ("frictions", "FRICTIONS.md", "Frictions", "Les douleurs", "Reflechir"),
]


# --------------------------------------------------------------------------- outils

def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return text or "section"


def inline(text: str) -> str:
    """Markdown inline -> HTML. Tolerant aux coquilles (** ou ` orphelins)."""
    out = html.escape(text, quote=False)
    out = re.sub(r"`([^`]+)`", lambda m: "<code>" + m.group(1) + "</code>", out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"(?<![\*\w])\*([^*\n]+)\*(?![\*\w])", r"<em>\1</em>", out)
    out = out.replace("**", "").replace("`", "")
    out = out.replace("→", '<i class="ar">→</i>')
    return out


def plain(text: str) -> str:
    """Version texte brut, pour l'index de recherche."""
    out = re.sub(r"[*`]", "", text)
    return out.strip()


# --------------------------------------------------------------------------- items

def make_item(text: str) -> list[dict]:
    """Une puce -> une ou plusieurs fiches {term, def} ou {text}."""
    marks = [m for m in re.finditer(r"\*\*([^*]+)\*\*\s*:", text)]
    if len(marks) > 1:
        items = []
        for i, m in enumerate(marks):
            end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
            body = text[m.end():end].strip().strip(".").strip()
            items.append({
                "term": inline(m.group(1).strip()),
                "def": inline(body),
                "q": plain(m.group(1) + " " + body),
            })
        return items

    m = re.match(r"^\*\*([^*]+)\*\*(.*)$", text, re.S)
    if m:
        term = m.group(1).strip()
        rest = m.group(2).strip()
        if rest.startswith(":"):
            rest = rest[1:].strip()
        if not rest:
            return [{"text": inline(text), "q": plain(text), "statement": True}]
        return [{"term": inline(term), "def": inline(rest), "q": plain(term + " " + rest)}]

    m = re.match(r"^([^:*`]{3,42}) : (.+)$", text, re.S)
    if m:
        return [{
            "term": inline(m.group(1).strip()),
            "def": inline(m.group(2).strip()),
            "q": plain(text),
        }]

    return [{"text": inline(text), "q": plain(text)}]


def is_special(line: str) -> bool:
    s = line.strip()
    return (not s) or s == "---" or s.startswith("```") or s.startswith("- ") \
        or bool(re.match(r"^\d+\.\s", s))


# --------------------------------------------------------------------------- blocs

def parse_blocks(lines: list[str]) -> list[dict]:
    blocks: list[dict] = []
    i, blank = 0, True

    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()

        if not stripped or stripped == "---":
            blank = True
            i += 1
            continue

        if stripped.startswith("```"):
            i += 1
            buf = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                buf.append(lines[i].rstrip())
                i += 1
            i += 1
            blocks.append({"type": "code", "text": "\n".join(buf), "blank": blank})
            blank = False
            continue

        if stripped.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.extend(make_item(lines[i].strip()[2:].strip()))
                i += 1
            blocks.append({"type": "list", "items": items, "blank": blank})
            blank = False
            continue

        if re.match(r"^\d+\.\s", stripped):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
                raw = re.sub(r"^\d+\.\s+", "", lines[i].strip())
                items.append({"html": inline(raw), "q": plain(raw)})
                i += 1
            blocks.append({"type": "steps", "items": items, "blank": blank})
            blank = False
            continue

        para = []
        while i < len(lines) and not is_special(lines[i]):
            para.append(lines[i].strip())
            i += 1

        head = re.match(r"^\*\*(.+)\*\*$", para[0])
        if head:
            body, fixes = [], []
            for l in para[1:]:
                if l.startswith("→"):
                    txt = l[1:].strip()
                    lesson = re.match(r"^\*\*Le[çc]on\*\*\s*:?\s*(.*)$", txt)
                    if lesson:
                        fixes.append({"kind": "lesson", "html": inline(lesson.group(1)),
                                      "q": plain(lesson.group(1))})
                    else:
                        fixes.append({"kind": "fix", "html": inline(txt), "q": plain(txt)})
                else:
                    body.append(l)
            title = head.group(1).strip()
            blocks.append({
                "type": "entry",
                "title": inline(title),
                "q": plain(title),
                "body": inline(" ".join(body)) if body else "",
                "bodyq": plain(" ".join(body)),
                "fixes": fixes,
                "points": [],
                "blank": blank,
            })
        else:
            joined = " ".join(para)
            blocks.append({"type": "p", "html": inline(joined), "q": plain(joined),
                           "blank": blank})
        blank = False

    # une liste collee a une entree lui appartient (cas FRICTIONS)
    merged: list[dict] = []
    for b in blocks:
        if b["type"] == "list" and not b["blank"] and merged and merged[-1]["type"] == "entry":
            merged[-1]["points"] = b["items"]
            continue
        merged.append(b)

    for b in merged:
        b.pop("blank", None)
    return merged


def parse_doc(doc_id: str, path: Path, label: str, kicker: str, verb: str) -> dict:
    raw = path.read_text(encoding="utf-8")
    lines = raw.splitlines()

    title = ""
    start = 0
    for n, l in enumerate(lines):
        if l.startswith("# "):
            title = l[2:].strip()
            start = n + 1
            break

    heads = [n for n, l in enumerate(lines) if l.startswith("## ")]
    first = heads[0] if heads else len(lines)
    intro_blocks = parse_blocks(lines[start:first])
    lead = ""
    for b in intro_blocks:
        if b["type"] == "p":
            lead = b["q"]
            break

    sections = []
    group = 0
    for n, head in enumerate(heads):
        end = heads[n + 1] if n + 1 < len(heads) else len(lines)
        body = lines[head + 1:end]
        head_txt = lines[head][3:].strip()
        short = re.split(r"\s*[(:]", head_txt)[0].strip() or head_txt
        sections.append({
            "id": slug(head_txt),
            "title": inline(head_txt),
            "short": inline(short),
            "q": plain(head_txt),
            "group": group,
            "blocks": parse_blocks(body),
        })
        # un separateur horizontal a la fin de la section ouvre un nouveau groupe
        if any(l.strip() == "---" for l in body):
            group += 1

    return {
        "id": doc_id,
        "label": label,
        "kicker": kicker,
        "verb": verb,
        "title": inline(title),
        "titleq": plain(title),
        "lead": lead,
        "intro": intro_blocks,
        "sections": sections,
        "source": "docs/" + path.name,
    }


def main() -> None:
    docs = []
    for doc_id, filename, label, kicker, verb in SOURCES:
        path = DOCS / filename
        if not path.exists():
            raise SystemExit("Fichier introuvable : " + str(path))
        docs.append(parse_doc(doc_id, path, label, kicker, verb))

    payload = json.dumps({"docs": docs}, ensure_ascii=False, indent=1)
    OUT.write_text(
        "// Genere par learn/build.py — ne pas editer a la main.\n"
        "// Source : docs/NOTES.md, docs/DEBUG.md, docs/FRICTIONS.md\n"
        "window.IOT_CONTENT = " + payload + ";\n",
        encoding="utf-8",
    )

    for d in docs:
        n_items = sum(
            len(b.get("items", [])) + (1 if b["type"] == "entry" else 0)
            for s in d["sections"] for b in s["blocks"]
        )
        print("{:<10} {:>2} sections  {:>3} fiches".format(d["label"], len(d["sections"]), n_items))
    print("-> " + str(OUT.relative_to(ROOT)))


if __name__ == "__main__":
    main()
