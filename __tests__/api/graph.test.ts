import fs from 'fs';

jest.mock('fs');

jest.mock('next/server', () => ({
    NextRequest: class {},
    NextResponse: {
        json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => {
            const status = init?.status ?? 200;
            const headerMap = new Map(Object.entries(init?.headers ?? {}));
            return {
                json: () => Promise.resolve(body),
                status,
                headers: { get: (k: string) => headerMap.get(k) ?? null },
            };
        },
    },
}));

import { GET } from '@/app/api/v1/[tenant]/actions/blueprints/[blueprintId]/graph/route';

const mockParams = Promise.resolve({ tenant: 'test-tenant', blueprintId: 'bp-1' });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockRequest = {} as any;

const mockGraphData = {
    $schema: '',
    id: 'bp-1',
    tenant_id: 'test-tenant',
    name: 'Test Graph',
    description: '',
    category: '',
    nodes: [],
    edges: [],
    forms: [],
    branches: [],
    triggers: [],
};

describe('GET /api/v1/[tenant]/actions/blueprints/[blueprintId]/graph', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns graph data with status 200', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockGraphData));

        const response = await GET(mockRequest, { params: mockParams });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual(mockGraphData);
    });

    it('sets Access-Control-Allow-Origin header', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockGraphData));

        const response = await GET(mockRequest, { params: mockParams });

        expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('returns 500 when file read fails', async () => {
        (fs.readFileSync as jest.Mock).mockImplementation(() => {
            throw new Error('File not found');
        });

        const response = await GET(mockRequest, { params: mockParams });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: 'Failed to load graph.json' });
    });

    it('returns 500 when file contains invalid JSON', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue('not valid json {{{');

        const response = await GET(mockRequest, { params: mockParams });
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: 'Failed to load graph.json' });
    });

    it('reads from the correct file path', async () => {
        (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockGraphData));

        await GET(mockRequest, { params: mockParams });

        expect(fs.readFileSync).toHaveBeenCalledWith(
            expect.stringMatching(/data[/\\]graph\.json$/),
            'utf8'
        );
    });
});
