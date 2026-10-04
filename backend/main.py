"""Polar Knowledge Portal API (Phase 1 prototype).

FastAPI service that serves prototype demonstration records of polar-science
resources (papers, datasets, expeditions, researchers, institutions) from a
local JSON file and exposes simple search and relationship endpoints.

Note: every record in data.json is prototype/demo data and does not represent
an official publication, dataset or government record.
"""

import json
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Polar Knowledge Portal API",
    description=(
        "Phase 1 prototype API for the Polar Knowledge Portal. "
        "All records are prototype demonstration data."
    ),
    version="0.1.0",
)

# Configure CORS to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Allow all origins for seamless development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = Path(__file__).parent / "data.json"

# Text fields matched by the free-text `q` parameter (tags are added separately).
SEARCHABLE_FIELDS = ("title", "description", "location", "institution", "type")


def load_items() -> list[dict[str, Any]]:
    """Load all prototype records from data.json.

    Returns an empty list if the file is missing or malformed so the API keeps
    responding (with empty results) instead of crashing.
    """
    try:
        with DATA_FILE.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return []
    return data if isinstance(data, list) else []


def find_item(items: list[dict[str, Any]], item_id: int) -> Optional[dict[str, Any]]:
    """Return the first record whose id matches, or None."""
    for item in items:
        if isinstance(item, dict) and item.get("id") == item_id:
            return item
    return None


def text_of(value: Any) -> str:
    """Normalise any record field to lowercase text for matching."""
    if isinstance(value, list):
        return " ".join(str(entry) for entry in value).lower()
    return str(value).lower() if value is not None else ""


def matches_filters(
    item: dict[str, Any],
    q: str,
    resource_type: str,
    location: str,
    year: Optional[int],
) -> bool:
    """Case-insensitive AND-combination of the /search filters."""
    if q:
        haystack = " ".join(text_of(item.get(field)) for field in SEARCHABLE_FIELDS)
        if q.lower() not in haystack:
            return False
    if resource_type and str(item.get("type", "")).lower() != resource_type.lower():
        return False
    if location and location.lower() not in text_of(item.get("location")):
        return False
    if year is not None and item.get("year") != year:
        return False
    return True


@app.get("/")
def read_root() -> dict[str, str]:
    """Health check endpoint."""
    return {"message": "API working"}


@app.get("/items")
def get_items() -> list[dict[str, Any]]:
    """Return every prototype resource record."""
    return load_items()


@app.get("/search")
def search_items(
    q: Optional[str] = Query(
        None,
        description="Free-text query across title, description, tags, location, institution and type",
    ),
    type: Optional[str] = Query(
        None,
        description="Resource type filter: paper, dataset, expedition, researcher or institution",
    ),
    location: Optional[str] = Query(
        None,
        description="Case-insensitive location filter (substring match)",
    ),
    year: Optional[int] = Query(None, description="Filter by year"),
) -> list[dict[str, Any]]:
    """Search resources with optional case-insensitive filters.

    All parameters are optional; when `q` is empty the other filters are still
    applied on their own.
    """
    items = load_items()
    q_clean = (q or "").strip()
    type_clean = (type or "").strip()
    location_clean = (location or "").strip()
    return [
        item
        for item in items
        if isinstance(item, dict)
        and matches_filters(item, q_clean, type_clean, location_clean, year)
    ]


@app.get("/items/{item_id}")
def get_item(item_id: int) -> dict[str, Any]:
    """Return a single resource by id (HTTP 404 when it does not exist)."""
    item = find_item(load_items(), item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return item


@app.get("/items/{item_id}/related")
def get_related_items(item_id: int) -> list[dict[str, Any]]:
    """Return resources connected to the given item via its related_ids.

    Missing, malformed or duplicate related ids are skipped safely so a data
    inconsistency never crashes the endpoint.
    """
    items = load_items()
    item = find_item(items, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    index: dict[Any, dict[str, Any]] = {}
    for candidate in items:
        if isinstance(candidate, dict) and candidate.get("id") is not None:
            index.setdefault(candidate["id"], candidate)

    related: list[dict[str, Any]] = []
    seen: set[Any] = set()
    for related_id in item.get("related_ids") or []:
        if related_id in index and related_id not in seen:
            seen.add(related_id)
            related.append(index[related_id])
    return related


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
