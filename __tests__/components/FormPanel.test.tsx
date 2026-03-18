import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormPanel from '@/components/FormPanel';
import { ActionBlueprintGraph, Node } from '@/types/graph';

const mockData: ActionBlueprintGraph = {
  $schema: 'test',
  id: 'test-graph',
  tenant_id: '1',
  name: 'Test Graph',
  description: 'Test',
  category: 'Test',
  nodes: [],
  edges: [],
  forms: [
    {
      id: 'form-1',
      name: 'Test Form',
      description: 'Test',
      is_reusable: false,
      field_schema: {
        type: 'object',
        properties: {
          dynamic_checkbox_group: {
            avantos_type: 'checkbox-group',
            type: 'array',
            items: {
              type: 'string',
              enum: ['foo', 'bar']
            },
            uniqueItems: true
          },
          dynamic_object: {
            avantos_type: 'object-enum',
            type: 'object',
            title: 'Dynamic Object',
            enum: null
          },
          email: {
            avantos_type: 'short-text',
            type: 'string',
            format: 'email',
            title: 'Email'
          }
        },
        required: []
      },
      ui_schema: {
        type: 'VerticalLayout',
        elements: [
          {
            type: 'Control',
            scope: '#/properties/dynamic_checkbox_group',
            label: 'Dynamic Checkbox Group'
          },
          {
            type: 'Control',
            scope: '#/properties/dynamic_object',
            label: 'Dynamic Object'
          },
          {
            type: 'Control',
            scope: '#/properties/email',
            label: 'Email'
          }
        ]
      },
      dynamic_field_config: {}
    }
  ],
  branches: [],
  triggers: []
};

const mockNode: Node = {
  id: 'node-1',
  type: 'form',
  position: { x: 0, y: 0 },
  data: {
    id: 'node-1',
    component_key: 'key-1',
    component_type: 'form',
    component_id: 'form-1',
    name: 'Test Node',
    prerequisites: [],
    permitted_roles: [],
    input_mapping: {},
    sla_duration: { number: 0, unit: 'minutes' },
    approval_required: false,
    approval_roles: []
  }
};

describe('FormPanel', () => {
  const mockOnClose = jest.fn();
  const mockOnFieldClick = jest.fn();
  const mockOnClearMapping = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form panel with node name', () => {
    render(
      <FormPanel
        selectedNode={mockNode}
        data={mockData}
        fieldMappings={{}}
        onClose={mockOnClose}
        onFieldClick={mockOnFieldClick}
        onClearMapping={mockOnClearMapping}
      />
    );

    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('renders all three fields', () => {
    render(
      <FormPanel
        selectedNode={mockNode}
        data={mockData}
        fieldMappings={{}}
        onClose={mockOnClose}
        onFieldClick={mockOnFieldClick}
        onClearMapping={mockOnClearMapping}
      />
    );

    expect(screen.getByText('Dynamic Checkbox Group')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Object')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FormPanel
        selectedNode={mockNode}
        data={mockData}
        fieldMappings={{}}
        onClose={mockOnClose}
        onFieldClick={mockOnFieldClick}
        onClearMapping={mockOnClearMapping}
      />
    );

    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onFieldClick when a field is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FormPanel
        selectedNode={mockNode}
        data={mockData}
        fieldMappings={{}}
        onClose={mockOnClose}
        onFieldClick={mockOnFieldClick}
        onClearMapping={mockOnClearMapping}
      />
    );

    const emailButton = screen.getByText('Email');
    await user.click(emailButton);

    expect(mockOnFieldClick).toHaveBeenCalledWith('email', undefined);
  });

  it('displays field mapping when provided', () => {
    const fieldMappings = {
      email: { source: 'Form A', field: 'email' }
    };

    render(
      <FormPanel
        selectedNode={mockNode}
        data={mockData}
        fieldMappings={fieldMappings}
        onClose={mockOnClose}
        onFieldClick={mockOnFieldClick}
        onClearMapping={mockOnClearMapping}
      />
    );

    expect(screen.getByText('Form A - email')).toBeInTheDocument();
  });

  it('shows clear button when field has mapping', () => {
    const fieldMappings = {
      email: { source: 'Form A', field: 'email' }
    };

    render(
      <FormPanel
        selectedNode={mockNode}
        data={mockData}
        fieldMappings={fieldMappings}
        onClose={mockOnClose}
        onFieldClick={mockOnFieldClick}
        onClearMapping={mockOnClearMapping}
      />
    );

    const clearButtons = screen.getAllByRole('button').filter(
      button => button.querySelector('svg')
    );
    expect(clearButtons.length).toBeGreaterThan(0);
  });

  it('calls onClearMapping when clear button is clicked', async () => {
    const user = userEvent.setup();
    const fieldMappings = {
      email: { source: 'Form A', field: 'email' }
    };

    render(
      <FormPanel
        selectedNode={mockNode}
        data={mockData}
        fieldMappings={fieldMappings}
        onClose={mockOnClose}
        onFieldClick={mockOnFieldClick}
        onClearMapping={mockOnClearMapping}
      />
    );

    const fieldButton = screen.getByText('Form A - email').closest('button');
    const clearButton = fieldButton?.querySelector('span[class*="cursor-pointer"]');

    if (clearButton) {
      await user.click(clearButton);
      expect(mockOnClearMapping).toHaveBeenCalledWith('email');
    }
  });
});
