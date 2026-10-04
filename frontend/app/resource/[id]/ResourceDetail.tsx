"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import RelatedResources from "@/components/RelatedResources";
import TypeBadge from "@/components/TypeBadge";
import { getItem, isNotFoundError } from "@/lib/api";
import { formatCoordinates } from "@/lib/resources";
import type { Resource } from "@/lib/types";

interface ResourceDetailProps {
  resourceId: string;
}

type DetailState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not-found" }
  | { status: "ready"; resource: Resource };

export default function ResourceDetail({ resourceId }: ResourceDetailProps) {
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  const numericId = Number(resourceId);
  const isValidId = Number.isInteger(numericId) && numericId > 0;

  useEffect(() => {
    if (!isValidId) return;
    let cancelled = false;
    getItem(numericId)
      .then((resource) => {
        if (!cancelled) setState({ status: "ready", resource });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: isNotFoundError(error) ? "not-found" : "error",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isValidId, numericId, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  if (!isValidId || state.status === "not-found") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Resource not found."
          message={`No polar resource exists for ID "${resourceId}". The ID may be invalid, or the record may no longer exist.`}
          action={
            <Link
              href="/explore"
              className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            >
              Browse all resources
            </Link>
          }
        />
      </div>
    );
  }

  if (state.status === "loading") {
    return <LoadingState label="Loading resource details..." />;
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState onRetry={retry} />
      </div>
    );
  }

  const resource = state.resource;
  const coordinates = formatCoordinates(resource);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm">
        <Link href="/" className="text-slate-500 hover:text-sky-700">
          Home
        </Link>
        <span aria-hidden="true" className="mx-2 text-slate-300">
          /
        </span>
        <Link href="/explore" className="text-slate-500 hover:text-sky-700">
          Explore
        </Link>
        <span aria-hidden="true" className="mx-2 text-slate-300">
          /
        </span>
        <span className="font-medium text-slate-700">
          {resource.title.length > 40
            ? `${resource.title.slice(0, 40)}…`
            : resource.title}
        </span>
      </nav>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          ⚠️ Prototype demonstration data — this record is a Phase 1 sample and
          does not represent an official publication or dataset.
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-3">
          <TypeBadge type={resource.type} />
          {resource.year != null && (
            <span className="text-sm font-medium text-slate-500">
              {resource.year}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
          {resource.title}
        </h1>

        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Location
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {resource.location ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Year
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {resource.year ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Institution
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {resource.institution ?? "—"}
            </dd>
          </div>
          {coordinates && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Coordinates
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{coordinates}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {resource.description}
          </p>
        </div>

        {resource.tags.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tags
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Source
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {resource.source ?? "Unspecified"}
          </p>
          {resource.source_url ? (
            <a
              href={resource.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800"
            >
              View Original Source <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              No public source link is provided for this prototype record.
            </p>
          )}
        </div>
      </div>

      <RelatedResources itemId={resource.id} />
    </article>
  );
}
