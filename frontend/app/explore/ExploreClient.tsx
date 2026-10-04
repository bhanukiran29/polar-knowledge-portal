"use client";

import { useCallback, useEffect, useState } from "react";

import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import FilterBar from "@/components/FilterBar";
import LoadingState from "@/components/LoadingState";
import ResourceGrid from "@/components/ResourceGrid";
import SearchBar from "@/components/SearchBar";
import { getItems, searchItems } from "@/lib/api";
import { getAvailableYears, getLocationFilters } from "@/lib/resources";
import type { Resource } from "@/lib/types";

interface ExploreClientProps {
  initialQuery?: string;
}

type ExploreStatus = "loading" | "error" | "ready";

export default function ExploreClient({ initialQuery = "" }: ExploreClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");

  const [results, setResults] = useState<Resource[]>([]);
  const [status, setStatus] = useState<ExploreStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  // Filter options are derived from the full collection (never hardcoded).
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    getItems()
      .then((items) => {
        if (cancelled) return;
        setLocationOptions(getLocationFilters(items));
        setYearOptions(getAvailableYears(items));
      })
      .catch(() => {
        // Filter options stay empty; the search itself still works.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search against the FastAPI /search endpoint. Results stay
  // visible while a refetch is pending; state changes only in async callbacks.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      searchItems({ q: query, type, location, year })
        .then((items) => {
          if (!cancelled) {
            setResults(items);
            setStatus("ready");
          }
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, type, location, year, attempt]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  const resetFilters = useCallback(() => {
    setQuery("");
    setType("");
    setLocation("");
    setYear("");
  }, []);

  const hasActiveFilters = Boolean(query || type || location || year);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Explore Polar Knowledge
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search across research papers, datasets, expeditions, researchers and
          institutions.
        </p>
      </header>

      <div className="mb-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search polar science..."
        />
      </div>

      <FilterBar
        type={type}
        onTypeChange={setType}
        location={location}
        onLocationChange={setLocation}
        locationOptions={locationOptions}
        year={year}
        onYearChange={setYear}
        yearOptions={yearOptions}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="mt-6">
        {status === "loading" && <LoadingState />}

        {status === "error" && <ErrorState onRetry={retry} />}

        {status === "ready" && results.length === 0 && (
          <EmptyState
            title="No polar resources found."
            message={
              hasActiveFilters
                ? "Try a different search term or adjust the filters."
                : undefined
            }
            action={
              hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                >
                  Clear search &amp; filters
                </button>
              ) : undefined
            }
          />
        )}

        {status === "ready" && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-slate-500" aria-live="polite">
              {results.length} resource{results.length === 1 ? "" : "s"} found
            </p>
            <ResourceGrid resources={results} />
          </>
        )}
      </div>
    </div>
  );
}
