import GraphViewer from "@/components/GraphViewer";
import { ActionBlueprintGraph } from "@/types/graph";
import { DataSourceSection } from "@/types/dataSources";

const staticDataSources: DataSourceSection[] = [
  {
    id: 'global-data',
    label: 'Global Data',
    fields: [
      { name: 'current_user_id', type: 'short-text' },
      { name: 'current_organization_id', type: 'short-text' },
    ],
  },
];

export default async function Home() {
  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/tenant1/actions/blueprints/bp_01/graph`, {
    cache: 'no-store'
  });
  const data: ActionBlueprintGraph = await res.json();

  return (
    <div className="w-full h-screen">
      <GraphViewer data={data} externalDataSources={staticDataSources} />
    </div>
  );
}
