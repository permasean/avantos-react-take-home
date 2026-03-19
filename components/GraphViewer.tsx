"use client";

import { useCallback, useState, useMemo } from 'react';
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
import FormPanel from './FormPanel';
import DataSelectorModal, { DataSourceSection } from './DataSelectorModal';

interface GraphViewerProps {
  data: ActionBlueprintGraph;
}

interface FieldMapping {
  source: string;
  field: string;
}

export default function GraphViewer({ data }: GraphViewerProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedFieldForMapping, setSelectedFieldForMapping] = useState<string | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, Record<string, FieldMapping>>>({});
  const [tempSelectedMapping, setTempSelectedMapping] = useState<FieldMapping | null>(null);

  const initialNodes: FlowNode[] = useMemo(() => data.nodes.map((node) => ({
    id: node.id,
    type: 'default',
    position: node.position,
    data: {
      label: node.data.name,
      ...node.data
    },
  })), [data.nodes]);

  const initialEdges: FlowEdge[] = useMemo(() => data.edges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.source,
    target: edge.target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  })), [data.edges]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    const originalNode = data.nodes.find(n => n.id === node.id);
    if (originalNode) {
      setSelectedNode(originalNode);
    }
  }, [data.nodes]);

  const handleFieldSelect = useCallback((mapping: FieldMapping) => {
    setTempSelectedMapping(mapping);
  }, []);

  const handleModalCancel = useCallback(() => {
    setShowDataModal(false);
    setSelectedFieldForMapping(null);
    setTempSelectedMapping(null);
  }, []);

  const handleModalConfirm = useCallback(() => {
    if (tempSelectedMapping && selectedFieldForMapping && selectedNode) {
      setFieldMappings(prev => ({
        ...prev,
        [selectedNode.id]: {
          ...(prev[selectedNode.id] || {}),
          [selectedFieldForMapping]: tempSelectedMapping
        }
      }));
      handleModalCancel();
    }
  }, [tempSelectedMapping, selectedFieldForMapping, selectedNode, handleModalCancel]);

  const handleFieldClick = useCallback((fieldName: string, currentMapping: FieldMapping | undefined) => {
    setSelectedFieldForMapping(fieldName);
    setTempSelectedMapping(currentMapping || null);
    setShowDataModal(true);
  }, []);

  const modalSections = useMemo((): DataSourceSection[] => {
    if (!selectedNode || !selectedFieldForMapping) return [];

    const prerequisiteSections: DataSourceSection[] = selectedNode.data.prerequisites
      .map(prereqId => data.nodes.find(n => n.id === prereqId))
      .filter((n): n is Node => n !== undefined && n.data.component_type === 'form')
      .map(prereqNode => {
        const prereqForm = data.forms.find(f => f.id === prereqNode.data.component_id);
        return {
          id: prereqNode.id,
          label: prereqNode.data.name,
          fields: prereqForm
            ? Object.entries(prereqForm.field_schema.properties).map(([name, prop]) => ({
                name,
                type: prop.avantos_type,
              }))
            : [],
        };
      });

    return [
      { id: 'action-properties', label: 'Action Properties', fields: [] },
      { id: 'client-org', label: 'Client Organisation Properties', fields: [] },
      ...prerequisiteSections,
    ];
  }, [selectedNode, selectedFieldForMapping, data]);

  const currentFieldType = useMemo(() => {
    if (!selectedNode || !selectedFieldForMapping) return undefined;
    const currentForm = data.forms.find(f => f.id === selectedNode.data.component_id);
    return currentForm?.field_schema.properties[selectedFieldForMapping]?.avantos_type;
  }, [selectedNode, selectedFieldForMapping, data]);

  const handleClearMapping = useCallback((fieldName: string) => {
    if (!selectedNode) return;

    setFieldMappings(prev => {
      const nodeMappings = { ...(prev[selectedNode.id] || {}) };
      delete nodeMappings[fieldName];

      return {
        ...prev,
        [selectedNode.id]: nodeMappings
      };
    });
  }, [selectedNode]);

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

      {selectedNode && selectedNode.data.component_type === 'form' && (
        <FormPanel
          selectedNode={selectedNode}
          data={data}
          fieldMappings={fieldMappings[selectedNode.id] || {}}
          onClose={() => setSelectedNode(null)}
          onFieldClick={handleFieldClick}
          onClearMapping={handleClearMapping}
        />
      )}

      {showDataModal && selectedFieldForMapping && selectedNode && (
        <DataSelectorModal
          sections={modalSections}
          selectedFieldName={selectedFieldForMapping}
          currentFieldType={currentFieldType}
          tempSelectedMapping={tempSelectedMapping}
          onFieldSelect={handleFieldSelect}
          onCancel={handleModalCancel}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}
