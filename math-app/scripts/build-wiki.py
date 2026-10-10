#!/usr/bin/env python3
"""Build the MathQuest HTML wiki from docs/catalog.json.

Usage:
    python3 scripts/build-wiki.py            # writes docs/wiki/*.html + style.css
    python3 scripts/build-wiki.py --check    # build into memory, verify no stale files
"""

import argparse
import html
import json
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "docs" / "catalog.json"
OUT = ROOT / "docs" / "wiki"

KIND_LABELS = {
    "multiple-choice": "Multiple choice",
    "count-tap": "Count & tap",
    "number-pad": "Number pad",
    "match-pairs": "Match pairs",
    "order-sequence": "Order sequence",
    "true-false": "True or false",
}

KIND_DESCRIPTIONS = {
    "multiple-choice": "Tap the correct answer from a set of big friendly option cards. Options can be numbers, words, or emoji pictures.",
    "count-tap": "Count the pictured objects, then tap the option card showing that many.",
    "number-pad": "Type the answer on the on-screen number pad and press Check.",
    "match-pairs": "Match every card on the left with its partner on the right — for example a numeral with its number word, or a coin with its value. The level self-judges once all pairs are matched.",
    "order-sequence": "Put the items in the right order by tapping them — smallest to biggest, first to last, or counting order. The level self-judges once the sequence is complete.",
    "true-false": "Read the statement, then tap True or False.",
}

DOMAIN_DESCRIPTIONS = {
    "counting": "Counting objects, number recognition, and early number sense — the foundation every other topic builds on.",
    "operations": "Addition, subtraction, multiplication, and division — from first sums to multi-digit and mixed operations.",
    "place-value": "What each digit in a number is worth: ones, tens, hundreds, thousands, and decimal places.",
    "fractions": "Parts of a whole — naming, comparing, ordering, and computing with fractions and mixed numbers.",
    "decimals": "Tenths, hundredths, and beyond — reading, comparing, rounding, and operating on decimal numbers.",
    "geometry": "Shapes, angles, symmetry, area, perimeter, and spatial reasoning.",
    "measurement": "Length, weight, capacity, and unit conversions in metric and customary systems.",
    "data": "Reading and building pictographs, bar graphs, tables, and simple statistics like mean and mode.",
    "money": "Coins and bills — identifying values, counting amounts, and making change.",
    "time": "Clocks and calendars — telling time, elapsed time, days, weeks, and schedules.",
    "patterns": "Number and shape patterns — spotting the rule, continuing sequences, and skip counting.",
    "word-problems": "Real-world stories that turn reading into math — choosing the right operation and solving.",
    "algebra": "Early algebraic thinking — missing numbers, equations, variables, and expressions.",
}

GRADE_ORDER = ["prek", "k", "g1", "g2", "g3", "g4", "g5"]
GRADE_COLORS = {
    "prek": "#FF8A65",
    "k": "#FFB74D",
    "g1": "#FFD54F",
    "g2": "#81C784",
    "g3": "#4FC3F7",
    "g4": "#9575CD",
    "g5": "#F06292",
}


def esc(s):
    return html.escape(str(s), quote=True)


def kind_label(kind):
    return KIND_LABELS.get(kind, kind)


def difficulty_badge(d):
    return f'<span class="diff diff-{d}" title="Difficulty {d} of 3">{"●" * d}{"○" * (3 - d)}</span>'


def nav(active=""):
    links = [
        ("index.html", "Index"),
        ("mechanics.html", "Question types"),
        ("domains.html", "Coverage matrix"),
        ("../guide/index.html", "User guide"),
    ]
    items = "".join(
        f'<a href="{href}"{"" if label != active else " class=active"}>{label}</a>'
        for href, label in links
    )
    return f'<nav class="topnav"><a class="brand" href="index.html">🧭 MathQuest Wiki</a><div class="navlinks">{items}</div></nav>'


def page(title, body, active="", subtitle=""):
    sub = f'<p class="subtitle">{subtitle}</p>' if subtitle else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)} · MathQuest Wiki</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
{nav(active)}
<main>
<h1>{esc(title)}</h1>
{sub}
{body}
</main>
<footer>Generated from <code>docs/catalog.json</code> by <code>scripts/build-wiki.py</code>.</footer>
</body>
</html>
"""


CSS = """\
:root {
  --ink: #22314a; --ink-soft: #5b6b84; --card: #ffffff; --line: #e3e9f2;
  --bg: #f4f7fb; --accent: #4a7dd6; --accent-soft: #e8f0fd;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--ink); background: var(--bg); line-height: 1.55; }
.topnav { display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  background: var(--card); border-bottom: 1px solid var(--line); padding: 10px 20px;
  position: sticky; top: 0; z-index: 5; }
.brand { font-weight: 800; font-size: 17px; color: var(--ink); text-decoration: none; }
.navlinks { display: flex; gap: 4px; flex-wrap: wrap; }
.navlinks a { color: var(--ink-soft); text-decoration: none; font-weight: 600; font-size: 14px;
  padding: 6px 10px; border-radius: 8px; }
.navlinks a:hover { background: var(--accent-soft); color: var(--accent); }
.navlinks a.active { background: var(--accent); color: #fff; }
main { max-width: 960px; margin: 0 auto; padding: 24px 20px 48px; }
h1 { font-size: 30px; margin: 8px 0 4px; }
h2 { font-size: 22px; margin: 32px 0 10px; border-bottom: 2px solid var(--line); padding-bottom: 6px; }
h3 { font-size: 17px; margin: 20px 0 8px; }
.subtitle { color: var(--ink-soft); font-size: 16px; margin-top: 0; }
a { color: var(--accent); }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 18px 0; }
.stat { background: var(--card); border: 1px solid var(--line); border-radius: 12px;
  padding: 14px 16px; text-align: center; }
.stat b { display: block; font-size: 26px; }
.stat span { color: var(--ink-soft); font-size: 13px; font-weight: 600; }
table { border-collapse: collapse; width: 100%; background: var(--card);
  border: 1px solid var(--line); border-radius: 10px; overflow: hidden; margin: 10px 0 22px; }
th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--line); font-size: 14px; }
th { background: var(--accent-soft); font-weight: 700; }
tr:last-child td { border-bottom: none; }
td.id, code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; }
.diff { color: var(--accent); letter-spacing: 2px; white-space: nowrap; }
.tag { display: inline-block; background: var(--accent-soft); color: var(--accent);
  border-radius: 999px; padding: 2px 10px; font-size: 12.5px; font-weight: 700; }
.unit-head { display: flex; align-items: center; gap: 10px; margin-top: 28px; flex-wrap: wrap; }
.unit-head .emoji { font-size: 26px; }
.unit-head h3 { margin: 0; }
.unit-head .meta { color: var(--ink-soft); font-size: 13px; }
.index-list { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 6px 0; }
.index-list a { display: flex; justify-content: space-between; gap: 10px; padding: 10px 16px;
  text-decoration: none; color: var(--ink); font-weight: 600; border-bottom: 1px solid var(--line); }
.index-list a:last-child { border-bottom: none; }
.index-list a:hover { background: var(--accent-soft); }
.index-list .count { color: var(--ink-soft); font-weight: 600; font-size: 13px; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; }
.card h3 { margin-top: 0; }
.pill { display: inline-block; width: 12px; height: 12px; border-radius: 4px; margin-right: 8px; }
footer { text-align: center; color: var(--ink-soft); font-size: 13px; padding: 24px; border-top: 1px solid var(--line); }
@media print { .topnav { display: none; } }
"""


def build_index(cat, kind_counts, domain_counts):
    grades = {g["id"]: g for g in cat["grades"]}
    cards = "".join(
        f'<div class="stat"><b>{v}</b><span>{label}</span></div>'
        for v, label in [
            (cat["totalLevels"], "levels"),
            (sum(len(g["units"]) for g in cat["grades"]), "units"),
            (len(cat["grades"]), "grades"),
            (len(domain_counts), "topics"),
            (len(kind_counts), "question types"),
        ]
    )
    grade_links = "".join(
        f'<a href="grade-{g["id"]}.html"><span><span class="pill" style="background:{GRADE_COLORS[g["id"]]}"></span>'
        f'{esc(g["title"])} <small>(ages {esc(g["ages"])})</small></span>'
        f'<span class="count">{len(g["units"])} units · {g["levelCount"]} levels</span></a>'
        for g in cat["grades"]
    )
    domain_links = "".join(
        f'<a href="domain-{esc(d)}.html"><span>{esc(d.replace("-", " ").title())}</span>'
        f'<span class="count">{domain_counts[d]} levels</span></a>'
        for d in sorted(domain_counts)
    )
    kind_links = "".join(
        f'<a href="mechanics.html#{esc(k)}"><span>{esc(kind_label(k))}</span>'
        f'<span class="count">{kind_counts[k]} levels</span></a>'
        for k in sorted(kind_counts, key=lambda k: -kind_counts[k])
    )
    body = f"""
<p class="subtitle">Everything in MathQuest — {cat['totalLevels']} levels across {len(cat['grades'])} grades and {len(domain_counts)} math topics. Generated from the live game catalog.</p>
<div class="cards">{cards}</div>

<h2>Start here</h2>
<div class="index-list">
<a href="../guide/index.html"><span>📖 Player &amp; parent user guide</span><span class="count">how to play</span></a>
<a href="domains.html"><span>🗂️ Grade × topic coverage matrix</span><span class="count">13 × 7</span></a>
<a href="mechanics.html"><span>🎮 Question types</span><span class="count">{len(kind_counts)} kinds</span></a>
</div>

<h2>Grades</h2>
<div class="index-list">{grade_links}</div>

<h2>Topics (domains)</h2>
<div class="index-list">{domain_links}</div>

<h2>Question types</h2>
<div class="index-list">{kind_links}</div>
"""
    return page("MathQuest Wiki", body, active="Index")


def build_grade_page(g):
    sections = []
    for u in g["units"]:
        rows = "".join(
            "<tr>"
            f"<td>{i}</td>"
            f"<td>{esc(l['title'])}</td>"
            f'<td><a href="mechanics.html#{esc(l["kind"])}">{esc(kind_label(l["kind"]))}</a></td>'
            f"<td>{difficulty_badge(l['difficulty'])}</td>"
            f'<td class="id">{esc(l["id"])}</td>'
            "</tr>"
            for i, l in enumerate(u["levels"], 1)
        )
        sections.append(
            f'<div class="unit-head"><span class="emoji">{u["emoji"]}</span>'
            f"<h3>{esc(u['title'])}</h3>"
            f'<span class="meta"><a href="domain-{esc(u["domain"])}.html">{esc(u["domain"].replace("-", " ").title())}</a>'
            f" · {len(u['levels'])} levels</span></div>"
            "<table><thead><tr><th>#</th><th>Level</th><th>Type</th><th>Difficulty</th><th>ID</th></tr></thead>"
            f"<tbody>{rows}</tbody></table>"
        )
    body = (
        f'<p><span class="pill" style="background:{GRADE_COLORS[g["id"]]}"></span> '
        f"Ages {esc(g['ages'])} · {len(g['units'])} units · {g['levelCount']} levels · "
        f"up to {g['levelCount'] * 3} ⭐</p>" + "".join(sections)
    )
    return page(f"{g['title']} levels", body)


def build_domain_pages(cat, domain):
    units_by_grade = []
    total = 0
    for g in cat["grades"]:
        units = [u for u in g["units"] if u["domain"] == domain]
        if not units:
            continue
        level_lists = []
        for u in units:
            total += len(u["levels"])
            lis = "".join(
                f'<li>{esc(l["title"])} <span class="meta">· {esc(kind_label(l["kind"]))}</span></li>'
                for l in u["levels"]
            )
            level_lists.append(
                f'<div class="card"><h3>{u["emoji"]} {esc(u["title"])}</h3><ul>{lis}</ul></div>'
            )
        units_by_grade.append(
            f'<h3><span class="pill" style="background:{GRADE_COLORS[g["id"]]}"></span>'
            f'<a href="grade-{g["id"]}.html">{esc(g["title"])}</a> '
            f'<span class="meta">(ages {esc(g["ages"])})</span></h3>'
            f'<div class="grid2">{"".join(level_lists)}</div>'
        )
    desc = DOMAIN_DESCRIPTIONS.get(domain, "")
    body = f"<p>{esc(desc)}</p><p><b>{total}</b> levels teach this topic.</p>" + "".join(units_by_grade)
    return domain, page(domain.replace("-", " ").title(), body)


def build_mechanics(cat, kind_counts):
    blocks = []
    order = sorted(kind_counts, key=lambda k: -kind_counts[k])
    for kind in order:
        examples = []
        for g in cat["grades"]:
            for u in g["units"]:
                for l in u["levels"]:
                    if l["kind"] == kind:
                        examples.append((g, u, l))
        ex = "".join(
            f'<li><a href="grade-{g["id"]}.html">{esc(g["title"])}</a>: {esc(l["title"])} '
            f'<span class="meta">({esc(u["title"])})</span></li>'
            for g, u, l in examples[:3]
        )
        more = f"<p class='meta'>…and {len(examples) - 3} more levels.</p>" if len(examples) > 3 else ""
        blocks.append(
            f'<h2 id="{esc(kind)}">{esc(kind_label(kind))} '
            f'<span class="tag">{kind_counts[kind]} levels</span></h2>'
            f"<p>{esc(KIND_DESCRIPTIONS[kind])}</p>"
            f"<p><b>Example levels</b></p><ul>{ex}</ul>{more}"
        )
    intro = (
        "<p>Every MathQuest level asks questions in one of six interactive formats. "
        "A level always uses the same format; the mix changes from level to level.</p>"
    )
    return page("Question types", intro + "".join(blocks), active="Question types")


def build_matrix(cat):
    domains = sorted({u["domain"] for g in cat["grades"] for u in g["units"]})
    counts = {
        (g["id"], u["domain"]): sum(len(uu["levels"]) for uu in g["units"] if uu["domain"] == u["domain"])
        for g in cat["grades"]
        for u in g["units"]
    }
    head = "".join(
        f'<th><a href="grade-{g["id"]}.html">{esc(g["title"])}</a></th>' for g in cat["grades"]
    )
    rows = []
    for d in domains:
        cells = []
        for g in cat["grades"]:
            n = counts.get((g["id"], d), 0)
            cells.append(f"<td>{n if n else '—'}</td>")
        rows.append(
            f'<tr><th style="text-align:left"><a href="domain-{esc(d)}.html">'
            f"{esc(d.replace('-', ' ').title())}</a></th>{''.join(cells)}</tr>"
        )
    totals_row = "<tr><th style='text-align:left'>Total levels</th>" + "".join(
        f"<th>{g['levelCount']}</th>" for g in cat["grades"]
    ) + "</tr>"
    body = (
        "<p>How many levels each grade offers per topic. Every grade covers all 13 domains.</p>"
        f"<table><thead><tr><th>Topic</th>{head}</tr></thead>"
        f"<tbody>{''.join(rows)}{totals_row}</tbody></table>"
    )
    return page("Coverage matrix", body, active="Coverage matrix")


def generate(pages):
    cat = json.loads(CATALOG.read_text())
    kind_counts = Counter()
    domain_counts = Counter()
    for g in cat["grades"]:
        for u in g["units"]:
            domain_counts[u["domain"]] += len(u["levels"])
            for l in u["levels"]:
                kind_counts[l["kind"]] += 1

    pages["index.html"] = build_index(cat, kind_counts, domain_counts)
    for g in cat["grades"]:
        pages[f"grade-{g['id']}.html"] = build_grade_page(g)
    for domain in sorted(domain_counts):
        name, html_text = build_domain_pages(cat, domain)
        pages[f"domain-{name}.html"] = html_text
    pages["mechanics.html"] = build_mechanics(cat, kind_counts)
    pages["domains.html"] = build_matrix(cat)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true", help="fail if docs/wiki would change")
    args = ap.parse_args()

    pages = {"style.css": CSS}
    generate(pages)

    if args.check:
        stale = [n for n, body in pages.items() if not (OUT / n).exists() or (OUT / n).read_text() != body]
        extra = [p.name for p in OUT.glob("*") if p.name not in pages] if OUT.exists() else []
        if stale or extra:
            print(f"wiki is stale — regenerate with scripts/build-wiki.py (stale: {stale}, extra: {extra})")
            sys.exit(1)
        print("wiki is up to date")
        return

    OUT.mkdir(parents=True, exist_ok=True)
    for name, body in pages.items():
        (OUT / name).write_text(body)
    print(f"wrote {len(pages)} files to {OUT.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
