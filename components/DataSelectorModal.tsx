"use client";

import { useState } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataSourceField, DataSourceSection } from '@/types/dataSources';

export type { DataSourceField, DataSourceSection };

interface FieldMapping {
  source: string;
  field: string;
}

interface DataSelectorModalProps {
  sections: DataSourceSection[];
  selectedFieldName: string;
  currentFieldType?: string;
  tempSelectedMapping: FieldMapping | null;
  onFieldSelect: (mapping: FieldMapping) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DataSelectorModal({
  sections,
  selectedFieldName,
  currentFieldType,
  tempSelectedMapping,
  onFieldSelect,
  onCancel,
  onConfirm
}: DataSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    if (!tempSelectedMapping) return;

    if (currentFieldType) {
      const section = sections.find(s => s.label === tempSelectedMapping.source);
      const field = section?.fields.find(f => f.name === tempSelectedMapping.field);

      if (field?.type && field.type !== currentFieldType) {
        setValidationError(
          `Type mismatch: "${selectedFieldName}" expects "${currentFieldType}" but "${tempSelectedMapping.field}" is "${field.type}"`
        );
        return;
      }
    }

    setValidationError(null);
    onConfirm();
  };

  const filteredSections = searchQuery
    ? sections
        .map(section => ({
          ...section,
          fields: section.fields.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(s =>
          s.fields.length > 0 || s.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : sections;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 w-[600px] h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4">Select data element to map</h3>

          <div className="flex">
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-2">Available data</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className={cn(
                    "w-full pl-9 pr-3 py-2 border rounded text-sm",
                    "border-zinc-300 dark:border-zinc-600",
                    "bg-white dark:bg-zinc-800",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500"
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {filteredSections.map((section) => {
              const isExpanded = expandedSections.has(section.id);

              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded",
                      "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span>{section.label}</span>
                  </button>

                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.fields.map((field) => {
                        const isSelected =
                          tempSelectedMapping?.source === section.label &&
                          tempSelectedMapping?.field === field.name;

                        return (
                          <button
                            key={field.name}
                            onClick={() => {
                              setValidationError(null);
                              onFieldSelect({ source: section.label, field: field.name });
                            }}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-sm rounded",
                              isSelected && "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100",
                              !isSelected && "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                          >
                            {field.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          {validationError && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
              {validationError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className={cn(
                "px-4 py-2 text-sm rounded transition-colors",
                "text-blue-600 dark:text-blue-400",
                "hover:bg-blue-50 dark:hover:bg-blue-950"
              )}
            >
              CANCEL
            </button>
            <button
              disabled={!tempSelectedMapping}
              onClick={handleConfirm}
              className={cn(
                "px-4 py-2 text-sm rounded",
                tempSelectedMapping
                  ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
              )}
            >
              SELECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
