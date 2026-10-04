"use client";

import { useEffect, useState } from "react";

import { getRelatedItems } from "@/lib/api";
import type { Resource } from "@/lib/types";
import LoadingState from "./LoadingState";
import ResourceGrid from "./ResourceGrid";

interface RelatedResourcesProps {
  itemId: number;
}

type RelatedState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; resources: Resource[] };

/**
 * "Connected Polar Knowledge" section: shows every resource related to the
 * current item so users can move between papers, datasets, expeditions,
 * researchers and institutions.
 */
export default function RelatedResources({ itemId }: RelatedResourcesProps) {
  const [state, setState] = useState<RelatedState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getRelatedItems(itemId)
      .then((resources) => {
        if (!cancelled) setState({ status: "ready", resources });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [itemId, attempt]);

  if (state.status === "error") {
    return (
      <section aria-labelledby="related-heading" className="mt-12">
        <RelatedHeading />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Related resources could not be loaded.{" "}
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((n) => n + 1);
            }}
            className="font-semibold underline hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="related-heading" className="mt-12">
      <RelatedHeading />
      {state.status === "loading" && (
        <LoadingState label="Loading related resources..." />
      )}
      {state.status === "ready" &&
        (state.resources.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No related resources are connected to this record yet.
          </p>
        ) : (
          <ResourceGrid resources={state.resources} compact />
        ))}
    </section>
  );
}

function RelatedHeading() {
  return (
    <>
      <h2
        id="related-heading"
        className="text-xl font-bold text-slate-900 sm:text-2xl"
      >
        Related Resources
      </h2>
      <p className="mb-6 mt-1 text-sm text-slate-500">
        Connected datasets, expeditions, researchers and institutions for this
        resource.
      </p>
    </>
  );
}
