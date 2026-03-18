export interface ActionBlueprintGraph {
  $schema: string;
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: string;
  nodes: Node[];
  edges: Edge[];
  forms: Form[];
  branches: string[];
  triggers: string[];
}

export interface Node {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
}

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  component_key: string;
  component_type: string;
  component_id: string;
  name: string;
  prerequisites: string[];
  permitted_roles: string[];
  input_mapping: Record<string, unknown>;
  sla_duration: SLADuration;
  approval_required: boolean;
  approval_roles: string[];
}

export interface SLADuration {
  number: number;
  unit: "minutes" | "hours" | "days";
}

export interface Edge {
  source: string;
  target: string;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  is_reusable: boolean;
  field_schema: FieldSchema;
  ui_schema: UISchema;
  dynamic_field_config: DynamicFieldConfig;
}

export interface FieldSchema {
  type: string;
  properties: Record<string, FieldProperty>;
  required: string[];
}

export type AvantosType =
  | "button"
  | "checkbox-group"
  | "object-enum"
  | "short-text"
  | "multi-select"
  | "multi-line-text";

export interface FieldProperty {
  avantos_type: AvantosType;
  title?: string;
  type: string;
  format?: string;
  items?: {
    enum: null | string[];
    type: string;
  };
  enum?: null | string[];
  uniqueItems?: boolean;
}

export interface UISchema {
  type: string;
  elements: UIElement[];
}

export type UIElement = UIControl | UIButton;

export interface UIControl {
  type: "Control";
  scope: string;
  label: string;
  options?: {
    format?: string;
  };
}

export interface UIButton {
  type: "Button";
  scope: string;
  label: string;
}

export interface DynamicFieldConfig {
  [fieldName: string]: DynamicFieldSettings;
}

export interface DynamicFieldSettings {
  selector_field: string;
  payload_fields: Record<string, PayloadField>;
  endpoint_id: string;
}

export interface PayloadField {
  type: "form_field";
  value: string;
}
