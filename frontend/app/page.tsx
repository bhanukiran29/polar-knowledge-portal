"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import ResourceGrid from "@/components/ResourceGrid";
import ResourceStats from "@/components/ResourceStats";
import SearchBar from "@/components/SearchBar";
import { getItems } from "@/lib/api";
import { getFeaturedItems } from "@/lib/resources";
import type { Resource } from "@/lib/types";

type HomeState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: Resource[] };

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<HomeState>({ status: "loading" });
  const [query, setQuery] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getItems()
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  const submitSearch = useCallback(() => {
    const trimmed = query.trim();
    router.push(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : "/explore");
  }, [query, router]);

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
            <span aria-hidden="true">❄️</span>
            <span>Arctic &amp; Antarctic Knowledge Gateway</span>
          </div>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Polar Knowledge Portal
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
            Explore connected research, datasets, expeditions and scientific
            knowledge from the polar regions.
          </p>

          <div className="mx-auto mb-4 max-w-2xl">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={submitSearch}
            />
          </div>
          <p className="text-xs text-slate-400">
            Prototype demonstration data · Phase 1
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {state.status === "loading" && <LoadingState />}

        {state.status === "error" && (
          <div className="py-12">
            <ErrorState onRetry={retry} />
          </div>
        )}

        {state.status === "ready" && (
          <>
            {/* Live statistics from the API */}
            <section aria-labelledby="stats-heading" className="py-12">
              <h2
                id="stats-heading"
                className="mb-6 text-center text-xl font-bold text-slate-900 sm:text-2xl"
              >
                Prototype Collection at a Glance
              </h2>
              <ResourceStats items={state.items} />
            </section>

            {/* Featured resources */}
            <section aria-labelledby="featured-heading" className="pb-12">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2
                    id="featured-heading"
                    className="text-xl font-bold text-slate-900 sm:text-2xl"
                  >
                    Explore Polar Knowledge
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    One highlighted resource from each part of the collection.
                  </p>
                </div>
                <Link
                  href="/explore"
                  className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                >
                  View all resources →
                </Link>
              </div>
              <ResourceGrid resources={getFeaturedItems(state.items)} />
            </section>

            {/* About the platform */}
            <section aria-labelledby="about-heading" className="mb-16">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-8">
                <h2
                  id="about-heading"
                  className="text-xl font-bold text-slate-900 sm:text-2xl"
                >
                  One platform connecting polar research
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                  One platform connecting polar research, datasets, expeditions,
                  researchers and institutions. Every record is linked to the
                  people, organisations, field campaigns and data behind it, so
                  you can follow a research paper through to its dataset, the
                  expedition that collected it, and the institution that made it
                  possible.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      🔗 Connected knowledge
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Papers link to datasets, expeditions, researchers and
                      institutions — not isolated lists.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      🔎 Unified search
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      One search across five resource types with location and
                      year filters.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      📚 Source transparency
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Every record names its data source clearly, with links to
                      original sources where available.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
