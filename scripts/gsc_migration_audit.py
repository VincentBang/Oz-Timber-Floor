#!/usr/bin/env python3
"""Build the dated GSC migration equity and manual catalogue review outputs.

The parser uses only the Python standard library. It reads the preserved XLSX
export as a ZIP/XML package and never modifies the source workbooks.
"""

from __future__ import annotations

import csv
import html
import json
import re
import sys
import zipfile
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
DOMAIN = "https://oztimberfloor.com.au"
SOURCE_DIR = ROOT / "docs/seo-migration/source/search-console/2026-09-01"
SOURCE_WORKBOOK = SOURCE_DIR / "https___oztimberfloor.com.au_-Performance-on-Search-2026-09-01.xlsx"
GENERATED_DIR = ROOT / "docs/seo-migration/generated"
EQUITY_OUTPUT = GENERATED_DIR / "gsc-equity-map-2026-09-01.csv"
MANUAL_OUTPUT = GENERATED_DIR / "catalogue-equity-manual-review-2026-09-01.csv"
EXPECTATIONS_PATH = ROOT / "data/seo-migration-redirect-expectations.json"
QUALITY_PATH = GENERATED_DIR / "catalogue-quality-report.json"
CATALOGUE_PATH = ROOT / "data/product-catalogue.json"

NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_PACKAGE_REL = "http://schemas.openxmlformats.org/package/2006/relationships"


def route(value: str) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    parsed = urlsplit(raw if "://" in raw else f"{DOMAIN}{raw if raw.startswith('/') else '/' + raw}")
    path = re.sub(r"/+", "/", parsed.path or "/")
    if path == "/index.html":
        return "/"
    if path.endswith("/index.html"):
        path = path[: -len("index.html")]
    if not Path(path).suffix and not path.endswith("/"):
        path += "/"
    return path


def xlsx_sheet_rows(workbook_path: Path, sheet_name: str) -> list[list[object]]:
    with zipfile.ZipFile(workbook_path) as archive:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in shared_root.findall(f"{{{NS_MAIN}}}si"):
                shared.append("".join(node.text or "" for node in item.iter(f"{{{NS_MAIN}}}t")))

        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {
            rel.attrib["Id"]: rel.attrib["Target"]
            for rel in relationships.findall(f"{{{NS_PACKAGE_REL}}}Relationship")
        }
        target = None
        for sheet in workbook.findall(f".//{{{NS_MAIN}}}sheet"):
            if sheet.attrib.get("name") == sheet_name:
                target = targets.get(sheet.attrib.get(f"{{{NS_REL}}}id", ""))
                break
        if not target:
            raise RuntimeError(f"Sheet {sheet_name!r} not found in {workbook_path.name}")
        target_path = target.lstrip("/")
        if not target_path.startswith("xl/"):
            target_path = f"xl/{target_path}"
        sheet_root = ET.fromstring(archive.read(target_path))

        rows: list[list[object]] = []
        for row_node in sheet_root.findall(f".//{{{NS_MAIN}}}sheetData/{{{NS_MAIN}}}row"):
            values: dict[int, object] = {}
            for cell in row_node.findall(f"{{{NS_MAIN}}}c"):
                reference = cell.attrib.get("r", "A1")
                letters = re.match(r"[A-Z]+", reference)
                if not letters:
                    continue
                column = 0
                for character in letters.group(0):
                    column = column * 26 + ord(character) - 64
                column -= 1
                cell_type = cell.attrib.get("t")
                value_node = cell.find(f"{{{NS_MAIN}}}v")
                raw_value = value_node.text if value_node is not None else ""
                if cell_type == "inlineStr":
                    value = "".join(node.text or "" for node in cell.iter(f"{{{NS_MAIN}}}t"))
                elif cell_type == "s":
                    value = shared[int(raw_value)] if raw_value else ""
                elif cell_type in {"str", "e"}:
                    value = raw_value
                elif cell_type == "b":
                    value = raw_value == "1"
                elif raw_value == "":
                    value = ""
                else:
                    try:
                        number = float(raw_value)
                        value = int(number) if number.is_integer() else number
                    except ValueError:
                        value = raw_value
                values[column] = value
            width = max(values, default=-1) + 1
            rows.append([values.get(index, "") for index in range(width)])
        return rows


def parse_redirects() -> tuple[dict[str, list[dict[str, object]]], dict[str, str]]:
    by_source: dict[str, list[dict[str, object]]] = {}
    rewrites: dict[str, str] = {}
    for line_number, raw_line in enumerate((ROOT / "_redirects").read_text().splitlines(), start=1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        status_text = parts[2] if len(parts) > 2 else "301"
        match = re.match(r"(\d{3})", status_text)
        status = int(match.group(1)) if match else 301
        source = route(parts[0])
        destination = route(parts[1])
        rule = {
            "line": line_number,
            "source": source,
            "destination": destination,
            "status": status,
            "status_text": status_text,
        }
        by_source.setdefault(source, []).append(rule)
        if status == 200 and "*" not in parts[0] and ":" not in parts[0]:
            rewrites[source] = parts[1].lstrip("/").split("?", 1)[0]
    return by_source, rewrites


REDIRECTS, REWRITES = parse_redirects()


def file_for_route(path: str) -> Path | None:
    normalized = route(path)
    rewrite = REWRITES.get(normalized)
    candidates: list[Path] = []
    if rewrite:
        candidates.append(ROOT / rewrite)
    if normalized == "/":
        candidates.append(ROOT / "index.html")
    else:
        clean = normalized.strip("/")
        candidates.extend([ROOT / clean / "index.html", ROOT / f"{clean}.html"])
    return next((candidate for candidate in candidates if candidate.is_file()), None)


def page_state(path: str) -> dict[str, object]:
    normalized = route(path)
    page_file = file_for_route(normalized)
    if not page_file:
        return {
            "exists": False,
            "file": "",
            "canonical": "",
            "canonical_route": "",
            "indexability": "missing",
        }
    source = page_file.read_text(errors="replace")
    canonical_match = re.search(r'<link\b[^>]*\brel=["\'][^"\']*canonical[^"\']*["\'][^>]*\bhref=["\']([^"\']+)', source, re.I)
    if not canonical_match:
        canonical_match = re.search(r'<link\b[^>]*\bhref=["\']([^"\']+)["\'][^>]*\brel=["\'][^"\']*canonical', source, re.I)
    canonical = html.unescape(canonical_match.group(1)).strip() if canonical_match else ""
    robots_match = re.search(r'<meta\b[^>]*\bname=["\']robots["\'][^>]*\bcontent=["\']([^"\']*)', source, re.I)
    if not robots_match:
        robots_match = re.search(r'<meta\b[^>]*\bcontent=["\']([^"\']*)["\'][^>]*\bname=["\']robots["\']', source, re.I)
    robots = robots_match.group(1).lower() if robots_match else "index,follow"
    canonical_route = route(canonical) if canonical else ""
    if "noindex" in robots:
        indexability = "noindex"
    elif not canonical:
        indexability = "missing-canonical"
    elif canonical_route != normalized:
        indexability = "canonicalised-elsewhere"
    else:
        indexability = "indexable"
    return {
        "exists": True,
        "file": page_file.relative_to(ROOT).as_posix(),
        "canonical": canonical,
        "canonical_route": canonical_route,
        "indexability": indexability,
    }


def exact_rule(path: str) -> dict[str, object] | None:
    rules = REDIRECTS.get(route(path), [])
    return rules[0] if len(rules) == 1 else None


def resolved_route(path: str) -> str:
    current = route(path)
    visited = set()
    while current not in visited:
        visited.add(current)
        rule = exact_rule(current)
        if not rule or not (300 <= int(rule["status"]) < 400):
            return current
        current = str(rule["destination"])
    return current


def load_planned_redirects() -> dict[str, str]:
    planned: dict[str, str] = {}
    with (ROOT / "migration/redirect-map.csv").open(newline="") as handle:
        for row in csv.DictReader(handle):
            status_text = str(row.get("status") or "")
            if not status_text.startswith("3"):
                continue
            source = route(str(row.get("old_url") or ""))
            target = route(str(row.get("new_url") or ""))
            if not source or not target:
                continue
            if source == target:
                raise RuntimeError(f"Planned redirect is a self-map: {source}")
            if source in planned and planned[source] != target:
                raise RuntimeError(f"Planned redirect has conflicting targets: {source}")
            planned[source] = target
    return planned


PLANNED = load_planned_redirects()
EXPECTATIONS = json.loads(EXPECTATIONS_PATH.read_text())
REVIEWED = {route(item["source"]): item for item in EXPECTATIONS["reviewedRedirects"]}
QUALITY = json.loads(QUALITY_PATH.read_text())
QUALITY_BY_ROUTE = {route(item["route"]): item for item in QUALITY["pages"]}
CATALOGUE = json.loads(CATALOGUE_PATH.read_text())


def record_slug(record: dict[str, object], route_prefix: str) -> str:
    raw = str(record.get("url") or record.get("slug") or record.get("id") or "")
    value = route(raw) if raw else ""
    if value.startswith(route_prefix):
        return value.strip("/").split("/")[-1]
    return str(record.get("slug") or record.get("id") or "").strip("/").split("/")[-1]


def grouped_by_slug(records: list[dict[str, object]], route_prefix: str) -> dict[str, list[dict[str, object]]]:
    grouped: dict[str, list[dict[str, object]]] = {}
    for record in records:
        slug_value = record_slug(record, route_prefix)
        if slug_value:
            grouped.setdefault(slug_value, []).append(record)
    return grouped


PRODUCTS_BY_SLUG = grouped_by_slug(CATALOGUE.get("products", []), "/products/")
RANGES_BY_SLUG = grouped_by_slug(CATALOGUE.get("ranges", []), "/ranges/")


def direct_indexable_range(range_slug: str) -> str:
    slug_value = str(range_slug or "").strip("/").split("/")[-1]
    if not slug_value or slug_value not in RANGES_BY_SLUG:
        return ""
    candidate = f"/ranges/{slug_value}/"
    if page_state(candidate)["indexability"] == "indexable":
        return candidate
    resolved = resolved_route(candidate)
    if resolved.startswith("/ranges/") and page_state(resolved)["indexability"] == "indexable":
        return resolved
    return ""


def exact_range_candidates(range_slug: str) -> list[str]:
    slug_value = str(range_slug or "").strip("/").split("/")[-1]
    candidates: set[str] = set()
    for source_record in RANGES_BY_SLUG.get(slug_value, []):
        source_category = str(source_record.get("category") or "").strip().lower()
        preferred = str(source_record.get("preferredRangeSlug") or "").strip()
        alternate_slugs = [slug_value, str(source_record.get("canonicalSlug") or "").strip()]
        if re.fullmatch(r"[a-z0-9-]+", preferred):
            alternate_slugs.append(preferred)
        for candidate_slug in dict.fromkeys(item for item in alternate_slugs if item):
            target_records = RANGES_BY_SLUG.get(candidate_slug, [])
            target_categories = {
                str(record.get("category") or "").strip().lower()
                for record in target_records
                if str(record.get("category") or "").strip()
            }
            if source_category and target_categories and source_category not in target_categories:
                continue
            candidate = direct_indexable_range(candidate_slug)
            if candidate:
                candidates.add(candidate)
    return sorted(candidates)


def product_candidates(path: str) -> dict[str, str]:
    normalized = route(path)
    parts = [part for part in normalized.strip("/").split("/") if part]
    if parts[:1] != ["product"] or len(parts) < 2:
        return {
            "product": "",
            "product_indexability": "missing",
            "parent_range": "",
            "parent_indexability": "missing",
        }

    slug_value = parts[-1]
    product_route = f"/products/{slug_value}/"
    product_state = page_state(product_route)
    product_records = PRODUCTS_BY_SLUG.get(slug_value, [])
    alias_target = resolved_route(product_route)
    reviewed = REVIEWED.get(normalized, {})
    reviewed_target = route(reviewed.get("target", "")) if reviewed else ""
    reviewed_state = page_state(reviewed_target) if reviewed_target else {"indexability": "missing"}

    exact_product_route = ""
    exact_product_state = product_state
    if product_state["indexability"] == "indexable":
        exact_product_route = product_route
    elif alias_target.startswith("/products/") and page_state(alias_target)["indexability"] == "indexable":
        exact_product_route = alias_target
        exact_product_state = page_state(alias_target)
    elif reviewed.get("semanticMatch") == "exact-product" and reviewed_state["indexability"] == "indexable":
        exact_product_route = reviewed_target
        exact_product_state = reviewed_state

    parent_candidates = {
        candidate
        for product_record in product_records
        for candidate in exact_range_candidates(str(product_record.get("rangeSlug") or ""))
    }
    if len(parent_candidates) == 1:
        parent_route = next(iter(parent_candidates))
        parent_state = page_state(parent_route)
    elif len(parent_candidates) > 1:
        parent_route = ""
        parent_state = {"indexability": "ambiguous"}
    else:
        parent_route = ""
        parent_state = {"indexability": "missing"}

    product_known = bool(product_state["exists"] or exact_rule(product_route) or product_records)
    return {
        "product": exact_product_route or (product_route if product_known else ""),
        "product_indexability": str(exact_product_state["indexability"] if exact_product_route else product_state["indexability"]),
        "parent_range": parent_route,
        "parent_indexability": str(parent_state["indexability"]),
    }


def closest_exact(path: str, current_target: str) -> str:
    normalized = route(path)
    reviewed = REVIEWED.get(normalized)
    if reviewed and reviewed.get("semanticMatch") == "retired":
        return route(reviewed["target"])
    own_state = page_state(normalized)
    if own_state["indexability"] == "indexable":
        return normalized
    candidates = product_candidates(normalized)
    if candidates["product"] and candidates["product_indexability"] == "indexable":
        return candidates["product"]
    if current_target.startswith("/products/") and page_state(current_target)["indexability"] == "indexable":
        return current_target
    if candidates["parent_range"] and candidates["parent_indexability"] == "indexable":
        return candidates["parent_range"]
    if reviewed:
        return route(reviewed["target"])
    if current_target and current_target.startswith(("/products/", "/ranges/")):
        current_state = page_state(current_target)
        if current_state["indexability"] == "indexable":
            return current_target
    planned = PLANNED.get(normalized, "")
    if planned:
        candidate = resolved_route(planned)
        if page_state(candidate)["exists"]:
            return candidate
    parts = [part for part in normalized.strip("/").split("/") if part]
    if parts and parts[0] == "product" and len(parts) > 1:
        candidate = f"/products/{parts[-1]}/"
        state = page_state(candidate)
        if state["exists"]:
            return candidate
        resolved = resolved_route(candidate)
        if resolved != candidate and page_state(resolved)["exists"]:
            return resolved
    if "product-category" in parts and parts:
        candidate = f"/ranges/{parts[-1]}/"
        state = page_state(candidate)
        if state["exists"]:
            return candidate
        resolved = resolved_route(candidate)
        if resolved != candidate and page_state(resolved)["exists"]:
            return resolved
    return ""


def semantic_and_decision(old_path: str, current_target: str, closest: str) -> tuple[str, str, str]:
    normalized = route(old_path)
    reviewed = REVIEWED.get(normalized)
    if reviewed:
        note = reviewed.get("note") or "Reviewed target is the closest verified, indexable replacement."
        return reviewed["semanticMatch"], reviewed["decision"], note

    source_parts = normalized.strip("/").split("/")
    source_is_product = source_parts[:1] == ["product"]
    source_is_range = "product-category" in source_parts or normalized.startswith("/ranges/")
    target_state = page_state(current_target or normalized)
    closest_state = page_state(closest) if closest else {"indexability": "missing"}

    if "bamboo" in normalized:
        return "retired", "redirect-category", "Bamboo is retired from public catalogue use; keep the documented relevant retirement destination."
    if not current_target and target_state["indexability"] == "indexable":
        return "exact-category", "keep", "The old URL is already the current indexable canonical route."
    if source_is_product:
        if closest and closest_state["indexability"] == "indexable" and closest.startswith("/products/"):
            return "exact-product", "redirect-exact", "An exact indexable product exists; the legacy product must resolve directly to it."
        if closest and closest_state["indexability"] == "indexable" and closest.startswith("/ranges/"):
            return "exact-range", "redirect-range", "The exact product is not publishable; preserve its intent through the verified indexable catalogue parent range."
        if closest and closest_state["indexability"] != "indexable":
            return "unresolved", "manual-product-decision", "The closest product or range is not safe to index; retain controlled treatment pending verified data."
        if current_target.startswith("/ranges/"):
            return "exact-range", "manual-product-decision", "No verified indexable exact product was found; retain the closest range while product data is reviewed."
        if current_target:
            return "generic-category", "manual-product-decision", "The legacy product currently resolves to a broad category and needs a product-level evidence decision."
        return "unresolved", "manual-product-decision", "No verified current replacement was found automatically."
    if source_is_range:
        if current_target.startswith("/ranges/"):
            return "exact-range", "redirect-range", "The legacy range/category resolves to a current range page."
        if current_target:
            return "generic-category", "redirect-category", "No publishable exact range is currently established; retain the reviewed category fallback."
        return "unresolved", "manual-product-decision", "No verified current range replacement was found automatically."
    if current_target:
        if any(token in normalized for token in ("floor-levelling", "installation", "commercial", "office-flooring", "removal", "sanding")):
            return "service-equivalent", "keep", "Maintain the direct redirect to the current service-equivalent page."
        return "exact-category", "keep", "Maintain the direct redirect to the current equivalent page."
    return "unresolved", "keep", "The route remains documented for review; no automatic destructive action is recommended."


def format_metric(value: object, digits: int | None = None) -> str:
    number = float(value or 0)
    if digits is None and number.is_integer():
        return str(int(number))
    return f"{number:.{digits or 0}f}"


def audit_rows() -> list[dict[str, str]]:
    rows = xlsx_sheet_rows(SOURCE_WORKBOOK, "Pages")
    if not rows or rows[0][:5] != ["Top pages", "Clicks", "Impressions", "CTR", "Position"]:
        raise RuntimeError("Unexpected GSC Pages sheet headers.")
    data = [row + [""] * (5 - len(row)) for row in rows[1:] if row and row[0]]
    selected = [row for index, row in enumerate(data) if index < 100 or float(row[1] or 0) >= 1 or float(row[2] or 0) >= 500]
    if len(selected) != 130:
        raise RuntimeError(f"Expected 130 qualifying GSC pages, found {len(selected)}.")

    output: list[dict[str, str]] = []
    for source in selected:
        old_url, clicks, impressions, ctr, position = source[:5]
        old_path = route(str(old_url))
        rules = REDIRECTS.get(old_path, [])
        first = rules[0] if len(rules) == 1 else None
        current_target = str(first["destination"]) if first and 300 <= int(first["status"]) < 400 else ""
        effective_target = current_target or old_path
        state = page_state(effective_target)
        candidates = product_candidates(old_path)
        closest = closest_exact(old_path, current_target)
        semantic, decision, rationale = semantic_and_decision(old_path, current_target, closest)
        if len(rules) > 1:
            rationale = f"Conflicting redirect rules require resolution. {rationale}"
        http_intent = (
            f"{first['status_text']} redirect" if first and 300 <= int(first["status"]) < 400
            else "410 gone" if first and int(first["status"]) == 410
            else "200 rewrite" if first and int(first["status"]) == 200
            else "200 static" if state["exists"]
            else "missing"
        )
        output.append({
            "old_url": str(old_url),
            "old_path": old_path,
            "clicks": format_metric(clicks),
            "impressions": format_metric(impressions),
            "ctr": f"{float(ctr or 0):.4f}",
            "average_position": f"{float(position or 0):.2f}",
            "current_redirect_target": current_target,
            "target_exists": "yes" if state["exists"] else "no",
            "target_http_intent": http_intent,
            "target_canonical": str(state["canonical"]),
            "target_indexability": str(state["indexability"]),
            "candidate_product_route": candidates["product"],
            "candidate_product_indexability": candidates["product_indexability"],
            "candidate_parent_range": candidates["parent_range"],
            "candidate_parent_indexability": candidates["parent_indexability"],
            "closest_exact_new_route": closest,
            "semantic_match": semantic,
            "decision": decision,
            "rationale": rationale,
        })
    return output


def manual_review_rows(equity: list[dict[str, str]]) -> list[dict[str, str]]:
    priority_terms = ("grand-oak", "infinite-laminate", "topdeck", "jatoba-brazilian-cherry", "kronswiss-aquastop-majestic-walnut")
    rows: list[dict[str, str]] = []
    seen = set()
    for item in equity:
        old_path = item["old_path"]
        closest = item["closest_exact_new_route"]
        candidate = (
            closest
            if closest.startswith("/products/")
            else item["candidate_product_route"]
            or (f"/products/{old_path.strip('/').split('/')[-1]}/" if old_path.startswith("/product/") else closest)
        )
        state = page_state(candidate) if candidate else {"exists": False, "indexability": "missing", "file": ""}
        quality = QUALITY_BY_ROUTE.get(route(candidate), {}) if candidate else {}
        issues = sorted({issue.get("code", "") for issue in quality.get("issues", []) if issue.get("code")})
        clicks = int(float(item["clicks"] or 0))
        position = float(item["average_position"] or 999)
        named = any(term in old_path for term in priority_terms)
        high_priority = clicks >= 2 or position <= 20
        catalogue_path = old_path.startswith(("/product/", "/product-category/")) or named
        incomplete = state["indexability"] != "indexable" or item["decision"] == "manual-product-decision"
        if not catalogue_path or not (named or (high_priority and incomplete)):
            continue
        key = (old_path, candidate)
        if key in seen:
            continue
        seen.add(key)
        if not state["exists"]:
            data_required = "Confirm current product/range status, exact replacement, reliable local image and source-backed specifications."
        elif state["indexability"] == "noindex":
            data_required = "Resolve the recorded catalogue quality gaps, confirm a reliable local image and re-run the indexation review."
        else:
            data_required = "Confirm that the current range/category fallback remains the best semantic replacement; do not index a product page without verified data."
        rows.append({
            "old_url": item["old_url"],
            "old_path": old_path,
            "clicks": item["clicks"],
            "impressions": item["impressions"],
            "average_position": item["average_position"],
            "current_redirect_target": item["current_redirect_target"],
            "candidate_exact_route": candidate,
            "candidate_exists": "yes" if state["exists"] else "no",
            "candidate_indexability": str(state["indexability"]),
            "candidate_file": str(state.get("file", "")),
            "candidate_parent_range": item["candidate_parent_range"],
            "candidate_parent_indexability": item["candidate_parent_indexability"],
            "quality_issues": ";".join(issues) or str(quality.get("classification", "unverified")),
            "recommended_decision": item["decision"],
            "data_required": data_required,
            "rationale": item["rationale"],
        })
    return rows


def write_csv(path: Path, rows: list[dict[str, str]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def validate_reviewed_expectations() -> None:
    for source, expected in REVIEWED.items():
        target = route(expected.get("target", ""))
        rules = REDIRECTS.get(source, [])
        if len(rules) != 1:
            raise RuntimeError(f"Reviewed redirect must have exactly one rule: {source} ({len(rules)} found).")
        rule = rules[0]
        if int(rule["status"]) != 301 or str(rule["destination"]) != target:
            raise RuntimeError(
                f"Reviewed redirect changed: {source} -> {rule['destination']} {rule['status_text']} "
                f"(expected {target} 301)."
            )
        if page_state(target)["indexability"] != "indexable":
            raise RuntimeError(f"Reviewed redirect target is not indexable: {source} -> {target}.")
        target_redirects = [
            candidate
            for candidate in REDIRECTS.get(target, [])
            if 300 <= int(candidate["status"]) < 400
        ]
        if target_redirects:
            raise RuntimeError(f"Reviewed redirect target is itself redirected: {source} -> {target}.")


def main() -> int:
    if not SOURCE_WORKBOOK.is_file():
        raise RuntimeError(f"Missing preserved GSC workbook: {SOURCE_WORKBOOK}")
    validate_reviewed_expectations()
    equity = audit_rows()
    manual = manual_review_rows(equity)
    equity_fields = [
        "old_url", "old_path", "clicks", "impressions", "ctr", "average_position",
        "current_redirect_target", "target_exists", "target_http_intent", "target_canonical",
        "target_indexability", "candidate_product_route", "candidate_product_indexability",
        "candidate_parent_range", "candidate_parent_indexability", "closest_exact_new_route",
        "semantic_match", "decision", "rationale",
    ]
    manual_fields = [
        "old_url", "old_path", "clicks", "impressions", "average_position", "current_redirect_target",
        "candidate_exact_route", "candidate_exists", "candidate_indexability", "candidate_file",
        "candidate_parent_range", "candidate_parent_indexability", "quality_issues",
        "recommended_decision", "data_required", "rationale",
    ]
    write_csv(EQUITY_OUTPUT, equity, equity_fields)
    write_csv(MANUAL_OUTPUT, manual, manual_fields)
    exact = sum(1 for row in equity if row["semantic_match"] in {"exact-product", "exact-range"})
    unresolved = sum(1 for row in equity if row["semantic_match"] == "unresolved")
    print(
        f"GSC migration audit wrote {len(equity)} equity decisions and {len(manual)} manual catalogue rows "
        f"({exact} exact product/range mappings; {unresolved} unresolved)."
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # pragma: no cover - command-line failure path
        print(f"GSC migration audit failed: {error}", file=sys.stderr)
        raise SystemExit(1)
