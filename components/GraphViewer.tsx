"use client";

import { useCallback, useState } from 'react';
import ReactFlow, {
  Node as FlowNode,
  Edge as FlowEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ActionBlueprintGraph, Node } from '@/types/graph';

interface GraphViewerProps {
  data: ActionBlueprintGraph;
}

export default function GraphViewer({ data }: GraphViewerProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const initialNodes: FlowNode[] = data.nodes.map((node) => ({
    id: node.id,
    type: 'default',
    position: node.position,
    data: {
      label: node.data.name,
      ...node.data
    },
  }));

  const initialEdges: FlowEdge[] = data.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.source,
    target: edge.target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    const originalNode = data.nodes.find(n => n.id === node.id);
    if (originalNode) {
      setSelectedNode(originalNode);
    }
  }, [data.nodes]);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{selectedNode.data.name}</h2>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Type:</span> {selectedNode.data.component_type}
            </div>
            <div>
              <span className="font-medium">ID:</span> {selectedNode.data.component_id}
            </div>

            {selectedNode.data.prerequisites.length > 0 && (
              <div>
                <span className="font-medium">Prerequisites:</span>
                <ul className="mt-1 list-disc list-inside">
                  {selectedNode.data.prerequisites.map((prereq) => {
                    const prereqNode = data.nodes.find(n => n.id === prereq);
                    return (
                      <li key={prereq} className="text-zinc-600 dark:text-zinc-400">
                        {prereqNode?.data.name || prereq}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div>
              <span className="font-medium">SLA Duration:</span>{' '}
              {selectedNode.data.sla_duration.number} {selectedNode.data.sla_duration.unit}
            </div>

            <div>
              <span className="font-medium">Approval Required:</span>{' '}
              {selectedNode.data.approval_required ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
