import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataSelectorModal, { DataSourceSection } from '@/components/DataSelectorModal';

const mockSections: DataSourceSection[] = [
    {id: 'mock-properties', label: 'Mock Properties', fields: [
        {
            name: 'email',
            type: 'short-text'
        }
    ]},
]

const defaultProp = {
    sections: mockSections,
    selectedFieldName: 'email',
    currentFieldType: 'short-text',
    tempSelectedMapping: null,
    onFieldSelect: jest.fn(),
    onCancel: jest.fn(),
    onConfirm: jest.fn()
}

describe('DataSelectorModal', () => {
    beforeEach(() => jest.clearAllMocks());

    it("renders section labels", () => {
        render(<DataSelectorModal {...defaultProp}/>);
        expect(screen.getByText('Mock Properties')).toBeInTheDocument();
    });

    it("fields do not show until section is expanded", () => {
        render(<DataSelectorModal {...defaultProp}/>);
        expect(screen.queryByText('email')).not.toBeInTheDocument();
    });

    it("fields show after expanding a section", async () => {
        const user = userEvent.setup();
        render(<DataSelectorModal {...defaultProp}/>)
        await user.click(screen.getByText('Mock Properties'));
        expect(screen.getByText('email')).toBeInTheDocument();
    });

    it("clicking a field calls onFieldSelect with correct mapping", async () => {
        const user = userEvent.setup();
        render(<DataSelectorModal {...defaultProp}/>);
        await user.click(screen.getByText('Mock Properties'));
        await user.click(screen.getByText('email'));
        expect(defaultProp.onFieldSelect).toHaveBeenCalledWith({ source: 'Mock Properties', field: 'email' });
    });

    it("clicking CANCEL calls onCancel", async () => {
        const user = userEvent.setup();
        render(<DataSelectorModal {...defaultProp}/>);
        await user.click(screen.getByText('CANCEL'));
        expect(defaultProp.onCancel).toHaveBeenCalledTimes(1);
    });

    it("clicking the backdrop calls onCancel", async () => {
        const user = userEvent.setup();
        render(<DataSelectorModal {...defaultProp}/>);
        await user.click(document.querySelector('.fixed.inset-0')!);
        expect(defaultProp.onCancel).toHaveBeenCalledTimes(1);
    });

    it("SELECT button is disabled when no mapping is selected", () => {
        render(<DataSelectorModal {...defaultProp}/>);
        expect(screen.getByText('SELECT')).toBeDisabled();
    });

    it("SELECT button is enabled when a mapping is selected", () => {
        render(<DataSelectorModal {...defaultProp} tempSelectedMapping={{ source: 'Mock Properties', field: 'email' }}/>);
        expect(screen.getByText('SELECT')).not.toBeDisabled();
    });

    it("clicking SELECT calls onConfirm when types match", async () => {
        const user = userEvent.setup();
        render(
            <DataSelectorModal
                {...defaultProp}
                currentFieldType="short-text"
                tempSelectedMapping={{ source: 'Mock Properties', field: 'email' }}
            />
        );
        await user.click(screen.getByText('SELECT'));
        expect(defaultProp.onConfirm).toHaveBeenCalledTimes(1);
    });

    it("shows type mismatch error when field types differ", async () => {
        const user = userEvent.setup();
        render(
            <DataSelectorModal
                {...defaultProp}
                currentFieldType="multi-line-text"
                tempSelectedMapping={{ source: 'Mock Properties', field: 'email' }}
            />
        );
        await user.click(screen.getByText('SELECT'));
        expect(defaultProp.onConfirm).not.toHaveBeenCalled();
        expect(screen.getByText(/Type mismatch/)).toBeInTheDocument();
    });

    it("search filters fields by name and auto-expands matching sections", async () => {
        const user = userEvent.setup();
        const sections: DataSourceSection[] = [
            { id: 'section-1', label: 'Section One', fields: [
                { name: 'alpha', type: 'short-text' },
                { name: 'beta', type: 'short-text' },
            ]},
        ];
        render(<DataSelectorModal {...defaultProp} sections={sections}/>);
        await user.type(screen.getByPlaceholderText('Search'), 'alpha');
        expect(screen.getByText('alpha')).toBeInTheDocument();
        expect(screen.queryByText('beta')).not.toBeInTheDocument();
    });

    it("search hides sections with no matching fields", async () => {
        const user = userEvent.setup();
        const sections: DataSourceSection[] = [
            { id: 'section-1', label: 'Section One', fields: [{ name: 'foo', type: 'short-text' }] },
            { id: 'section-2', label: 'Section Two', fields: [{ name: 'bar', type: 'short-text' }] },
        ];
        render(<DataSelectorModal {...defaultProp} sections={sections}/>);
        await user.type(screen.getByPlaceholderText('Search'), 'foo');
        expect(screen.getByText('Section One')).toBeInTheDocument();
        expect(screen.queryByText('Section Two')).not.toBeInTheDocument();
    });
});
