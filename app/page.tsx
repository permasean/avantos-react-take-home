import GraphViewer from "@/components/GraphViewer";
import { ActionBlueprintGraph } from "@/types/graph";

export default async function Home() {
  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/tenant1/actions/blueprints/bp_01/graph`, {
    cache: 'no-store'
  });
  const data: ActionBlueprintGraph = await res.json();

  return (
    <div className="w-full h-screen">
      <GraphViewer data={data} />
    </div>
  );
}
