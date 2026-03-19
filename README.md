# Avantos React Take-Home

A Next.js application for visualizing and configuring action blueprint graphs. Users can explore workflow nodes, inspect form fields on each node, and map fields to data sources from prerequisite nodes or external sources.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **ReactFlow** — graph visualization
- **Tailwind CSS v4**

## Getting Started

Copy the example env file and set your API base URL:

```bash
cp .env.example .env.local
```

```env
API_BASE_URL=http://localhost:3000
```

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
npm run dev       # Start development server
npm run build     # Build production bundle
npm start         # Start production server
npm run lint      # Run ESLint
npm test          # Run tests
```

## Architecture

### Data Flow

The home page (`app/page.tsx`) fetches graph data from the API route, which reads from `data/graph.json`. It also defines static external data sources and passes both down to `GraphViewer`.

### API Route

`GET /api/v1/[tenant]/actions/blueprints/[blueprintId]/graph`

Returns the action blueprint graph for a given tenant and blueprint. Currently reads from `data/graph.json`.

### Components

- **`GraphViewer`** — ReactFlow canvas with node selection. Accepts an `externalDataSources` prop (`DataSourceSection[]`) for data sources coming from APIs, databases, or static config. Internally computes prerequisite node sections from the graph and merges them with external sources when populating the data selector.
- **`FormPanel`** — Sidebar showing the selected node's form fields and their current mappings.
- **`DataSelectorModal`** — Modal for mapping a form field to a data source. Supports search with auto-expansion of matching sections and type mismatch validation.

### Adding External Data Sources

To plug in data sources from an API or database, fetch them in `app/page.tsx` and pass them to `GraphViewer`:

```tsx
const externalDataSources: DataSourceSection[] = await fetchDataSources();

<GraphViewer data={data} externalDataSources={externalDataSources} />
```

The shape is defined in `types/dataSources.ts`:

```ts
interface DataSourceSection {
  id: string;
  label: string;
  fields: DataSourceField[];
}

interface DataSourceField {
  name: string;
  type?: string;
}
```

### Types

- `types/graph.ts` — Graph, node, form, and edge types
- `types/dataSources.ts` — `DataSourceField` and `DataSourceSection`

## Testing

```bash
npm test
```

Tests live in `__tests__/` mirroring the source structure. Component tests use React Testing Library; API route tests mock `fs` and `next/server`.
