import ExploreClient from "./ExploreClient";

interface ExplorePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  return <ExploreClient initialQuery={q} />;
}
