import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionBlueprintGraph, Node, Form } from '@/types/graph';
import { DataSourceSection } from '@/types/dataSources';
import GraphViewer from '@/components/GraphViewer';

jest.mock('reactflow', () => ({
    __esModule: true,
    default: ({ onNodeClick, children }: { onNodeClick: (e: React.MouseEvent, node: { id: string }) => void, children: React.ReactNode }) => (
        <div data-testid="react-flow">
            <button data-testid="click-form-node" onClick={(e) => onNodeClick(e as unknown as React.MouseEvent, { id: 'node-form' })}>
                Form Node
            </button>
            <button data-testid="click-non-form-node" onClick={(e) => onNodeClick(e as unknown as React.MouseEvent, { id: 'node-approval' })}>
                Non-Form Node
            </button>
            {children}
        </div>
    ),
    Background: () => null,
    Controls: () => null,
    MarkerType: { ArrowClosed: 'arrowclosed' },
    useNodesState: (nodes: unknown) => [nodes, jest.fn(), jest.fn()],
    useEdgesState: (edges: unknown) => [edges, jest.fn(), jest.fn()],
}));

const mockForm: Form = {
    id: 'form-1',
    name: 'Test Form',
    description: '',
    is_reusable: false,
    field_schema: {
        type: 'object',
        properties: {
            email: { avantos_type: 'short-text', type: 'string', title: 'Email' }
        },
        required: []
    },
    ui_schema: {
        type: 'VerticalLayout',
        elements: [{ type: 'Control', scope: '#/properties/email', label: 'Email' }]
    },
    dynamic_field_config: {}
};

const mockFormNode: Node = {
    id: 'node-form',
    type: 'default',
    position: { x: 0, y: 0 },
    data: {
        id: 'node-form',
        component_key: 'key-1',
        component_type: 'form',
        component_id: 'form-1',
        name: 'Test Form Node',
        prerequisites: [],
        permitted_roles: [],
        input_mapping: {},
        sla_duration: { number: 0, unit: 'minutes' },
        approval_required: false,
        approval_roles: []
    }
};

const mockApprovalNode: Node = {
    id: 'node-approval',
    type: 'default',
    position: { x: 100, y: 0 },
    data: {
        id: 'node-approval',
        component_key: 'key-2',
        component_type: 'approval',
        component_id: 'approval-1',
        name: 'Approval Node',
        prerequisites: [],
        permitted_roles: [],
        input_mapping: {},
        sla_duration: { number: 0, unit: 'minutes' },
        approval_required: true,
        approval_roles: []
    }
};

const mockData: ActionBlueprintGraph = {
    $schema: '',
    id: '',
    tenant_id: '',
    name: '',
    description: '',
    category: '',
    nodes: [],
    edges: [],
    forms: [],
    branches: [],
    triggers: [],
};

const mockDataWithNodes: ActionBlueprintGraph = {
    ...mockData,
    nodes: [mockFormNode, mockApprovalNode],
    edges: [{ source: 'node-form', target: 'node-approval' }],
    forms: [mockForm],
};

describe('GraphViewer', () => {
    it('renders ReactFlow canvas', () => {
        render(<GraphViewer data={mockData}/>);
        expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });

    it('does not render FormPanel when no node is selected', () => {
        render(<GraphViewer data={mockDataWithNodes}/>);
        expect(screen.queryByText('Test Form Node')).not.toBeInTheDocument();
    });

    it('renders FormPanel when a form node is clicked', async () => {
        const user = userEvent.setup();
        render(<GraphViewer data={mockDataWithNodes}/>);
        await user.click(screen.getByTestId('click-form-node'));
        expect(screen.getByText('Test Form Node')).toBeInTheDocument();
    });

    it('does not render FormPanel when a non-form node is clicked', async () => {
        const user = userEvent.setup();
        render(<GraphViewer data={mockDataWithNodes}/>);
        await user.click(screen.getByTestId('click-non-form-node'));
        expect(screen.queryByText('Approval Node')).not.toBeInTheDocument();
    });

    it('closes FormPanel when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<GraphViewer data={mockDataWithNodes}/>);
        await user.click(screen.getByTestId('click-form-node'));
        expect(screen.getByText('Test Form Node')).toBeInTheDocument();
        await user.click(screen.getByText('✕'));
        expect(screen.queryByText('Test Form Node')).not.toBeInTheDocument();
    });

    it('opens DataSelectorModal when a field in FormPanel is clicked', async () => {
        const user = userEvent.setup();
        render(<GraphViewer data={mockDataWithNodes}/>);
        await user.click(screen.getByTestId('click-form-node'));
        await user.click(screen.getByText('Email'));
        expect(screen.getByText('Select data element to map')).toBeInTheDocument();
    });

    it('closes DataSelectorModal when CANCEL is clicked', async () => {
        const user = userEvent.setup();
        render(<GraphViewer data={mockDataWithNodes}/>);
        await user.click(screen.getByTestId('click-form-node'));
        await user.click(screen.getByText('Email'));
        await user.click(screen.getByText('CANCEL'));
        expect(screen.queryByText('Select data element to map')).not.toBeInTheDocument();
    });

    it('shows externalDataSources sections in DataSelectorModal', async () => {
        const user = userEvent.setup();
        const externalDataSources: DataSourceSection[] = [
            { id: 'global-data', label: 'Global Data', fields: [{ name: 'current_user_id', type: 'short-text' }] },
        ];
        render(<GraphViewer data={mockDataWithNodes} externalDataSources={externalDataSources}/>);
        await user.click(screen.getByTestId('click-form-node'));
        await user.click(screen.getByText('Email'));
        expect(screen.getByText('Global Data')).toBeInTheDocument();
    });
});
