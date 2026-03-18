"use client";

import { Database, X } from 'lucide-react';
import { ActionBlueprintGraph, Node } from '@/types/graph';
import { cn } from '@/lib/utils';

interface FieldMapping {
  source: string;
  field: string;
}

interface FormPanelProps {
  selectedNode: Node;
  data: ActionBlueprintGraph;
  fieldMappings: Record<string, FieldMapping>;
  onClose: () => void;
  onFieldClick: (fieldName: string, currentMapping: FieldMapping | undefined) => void;
  onClearMapping: (fieldName: string) => void;
}

export default function FormPanel({
  selectedNode,
  data,
  fieldMappings,
  onClose,
  onFieldClick,
  onClearMapping
}: FormPanelProps) {
  const form = data.forms.find(f => f.id === selectedNode.data.component_id);

  if (!form) return null;

  return (
    <div className="absolute top-4 right-4 w-96 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 max-h-[80vh] flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{selectedNode.data.name}</h2>
          <button
            onClick={onClose}
            className={cn(
              "text-zinc-500",
              "hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto">
        <div className="space-y-4">
          {form.ui_schema.elements
            .filter(element => {
              const fieldName = element.scope.split('/').pop();
              return fieldName === 'dynamic_checkbox_group' || fieldName === 'dynamic_object' || fieldName === 'email';
            })
            .map((element) => {
              const fieldName = element.scope.split('/').pop();
              if (!fieldName) return null;

              const field = form.field_schema.properties[fieldName];
              if (!field) return null;

              const mapping = fieldMappings[fieldName];
              const isEmailField = fieldName === 'email';

              return (
                <div key={fieldName} className="relative">
                  <button
                    onClick={() => onFieldClick(fieldName, mapping)}
                    className={cn(
                      "w-full px-3 py-2 border rounded text-sm text-left flex items-center gap-2",
                      "border-zinc-300 dark:border-zinc-600",
                      "bg-white dark:bg-zinc-800",
                      "text-zinc-900 dark:text-zinc-100",
                      "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
                      "transition-colors"
                    )}
                  >
                    {!isEmailField && (
                      <Database className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                    )}
                    <span className="flex-1">{mapping ? `${mapping.source} - ${mapping.field}` : element.label}</span>
                    {mapping && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearMapping(fieldName);
                        }}
                        className="ml-2 p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
