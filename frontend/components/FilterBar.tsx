"use client";

import { RESOURCE_TYPES, TYPE_LABELS } from "@/lib/types";

interface FilterBarProps {
  type: string;
  onTypeChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  locationOptions: string[];
  year: string;
  onYearChange: (value: string) => void;
  yearOptions: number[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200";

const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";

export default function FilterBar({
  type,
  onTypeChange,
  location,
  onLocationChange,
  locationOptions,
  year,
  onYearChange,
  yearOptions,
  onReset,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <label htmlFor="filter-type" className={labelClass}>
          Resource type
        </label>
        <select
          id="filter-type"
          value={type}
          onChange={(event) => onTypeChange(event.target.value)}
          className={selectClass}
        >
          <option value="">All types</option>
          {RESOURCE_TYPES.map((value) => (
            <option key={value} value={value}>
              {TYPE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-location" className={labelClass}>
          Location
        </label>
        <select
          id="filter-location"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          className={selectClass}
        >
          <option value="">All locations</option>
          {locationOptions.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-year" className={labelClass}>
          Year
        </label>
        <select
          id="filter-year"
          value={year}
          onChange={(event) => onYearChange(event.target.value)}
          className={selectClass}
        >
          <option value="">All years</option>
          {yearOptions.map((value) => (
            <option key={value} value={String(value)}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="sm:col-span-3">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Clear search &amp; filters
          </button>
        </div>
      )}
    </div>
  );
}
