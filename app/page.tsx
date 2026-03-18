import GraphViewer from "@/components/GraphViewer";
import { ActionBlueprintGraph } from "@/types/graph";

export default async function Home() {
  const res = await fetch('http://localhost:3000/api/v1/tenant1/actions/blueprints/bp_01jk766tckfwx84xjcxazggzyc/graph', {
    cache: 'no-store'
  });
  const data: ActionBlueprintGraph = await res.json();

  return (
    <div className="w-full h-screen">
      <GraphViewer data={data} />
    </div>
  );
}
