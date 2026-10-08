#!/usr/bin/env python3
"""Crawl every /play/<levelId> page of the exported MathQuest web build.

For each level: load the play route, verify a question prompt renders, then
exercise one interaction appropriate to the game kind. Writes a JSON report.
Usage: crawl_levels.py <levels.json> <base_url> <out_report.json> [--shots DIR] [--limit N]
"""
import json
import sys
import time

from playwright.sync_api import sync_playwright

levels_file, base, out = sys.argv[1], sys.argv[2], sys.argv[3]
shots = sys.argv[sys.argv.index("--shots") + 1] if "--shots" in sys.argv else None
limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None

levels = json.load(open(levels_file))
if limit:
    levels = levels[:limit]

results = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 430, "height": 900})
    for i, lv in enumerate(levels):
        lid = lv["id"] if isinstance(lv, dict) else lv
        entry = {"id": lid, "ok": False, "kind": None, "prompt": None, "error": None}
        try:
            page.goto(f"{base}/play/{lid}", wait_until="networkidle", timeout=30000)
            page.wait_for_selector('[data-testid="question-prompt"]', timeout=15000)
            entry["prompt"] = page.locator('[data-testid="question-prompt"]').first.inner_text()
            # interact: click first option if present (covers mc/count-tap/true-false)
            opt = page.locator('[data-testid^="answer-"]').first
            if opt.count():
                entry["kind"] = "options"
                opt.click()
            elif page.locator('[data-testid="number-pad-submit"]').count():
                entry["kind"] = "number-pad"
                page.locator('[data-testid="number-pad-1"]').first.click()
                page.locator('[data-testid="number-pad-submit"]').first.click()
            elif page.locator('[data-testid^="match-left-"]').count():
                entry["kind"] = "match-pairs"
            elif page.locator('[data-testid^="sequence-item-"]').count():
                entry["kind"] = "order-sequence"
            entry["ok"] = True
        except Exception as e:  # noqa: BLE001
            entry["error"] = str(e)[:300]
            if shots:
                try:
                    page.screenshot(path=f"{shots}/{lid.replace('.', '_')}.png")
                except Exception:
                    pass
        results.append(entry)
        if (i + 1) % 50 == 0:
            print(f"{i + 1}/{len(levels)} ok={sum(1 for r in results if r['ok'])}", flush=True)
    browser.close()

fails = [r for r in results if not r["ok"]]
json.dump({"total": len(results), "passed": len(results) - len(fails), "failures": fails, "results": results}, open(out, "w"), indent=1)
print(f"DONE total={len(results)} passed={len(results) - len(fails)} failed={len(fails)}")
for f in fails[:20]:
    print("FAIL", f["id"], (f["error"] or "")[:120])
