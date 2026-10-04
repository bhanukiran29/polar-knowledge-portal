import ResourceDetail from "./ResourceDetail";

interface ResourcePageProps {
  params: Promise<{ id: string }>;
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { id } = await params;
  // Keyed by id so navigating between resources remounts a fresh detail view.
  return <ResourceDetail key={id} resourceId={id} />;
}
