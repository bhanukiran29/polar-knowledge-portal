# Polar Knowledge Portal — Phase 1 Prototype

A full-stack portal connecting Arctic and Antarctic research papers, scientific
datasets, expeditions, researchers and institutions.

> **Prototype demonstration data:** all records in `backend/data.json` are
> illustrative samples created for Phase 1 development. They do not represent
> official publications, datasets or government records.

## Architecture

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS (port `3000`)
- **Backend**: FastAPI (Python) with CORS enabled (port `8000`)
- **Data**: `backend/data.json` — 21 structured prototype records with ID-based relationships

## Project Structure

```text
polar-knowledge-portal/
├── backend/
│   ├── data.json           # 21 prototype records (papers, datasets, expeditions, researchers, institutions)
│   ├── main.py             # FastAPI server: / /items /items/{id} /search /items/{id}/related
│   ├── requirements.txt    # Python dependencies
│   └── tests/              # pytest suite (python -m pytest tests -v)
└── frontend/
    ├── app/                # Routes: / (home), /explore, /resource/[id]
    ├── components/         # Header, SearchBar, FilterBar, ResourceCard, TypeBadge, states...
    ├── lib/                # api.ts (central API client), types.ts, resources.ts
    └── package.json
```

## API Endpoints

| Endpoint | Description |
| --- | --- |
| `GET /` | Health check (`{"message": "API working"}`) |
| `GET /items` | All prototype resources |
| `GET /items/{id}` | Single resource (404 when missing) |
| `GET /items/{id}/related` | Resources connected via `related_ids` (skips broken ids safely) |
| `GET /search?q=&type=&location=&year=` | Case-insensitive search; all filters optional |

Searchable fields: `title`, `description`, `tags`, `location`, `institution`, `type`.

## Running the Project

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Health check: http://localhost:8000/ → `{"message": "API working"}`
- Interactive docs: http://localhost:8000/docs
- Run tests: `python -m pytest tests -v`

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

The backend URL defaults to `http://localhost:8000` and can be overridden by
copying `.env.example` to `.env.local` and setting `NEXT_PUBLIC_API_URL`.

## User Journey (Phase 1)

HOME → SEARCH / FILTER → RESOURCE RESULTS → RESOURCE DETAILS → RELATED
RESOURCES → SOURCE / ORIGINAL LINK
