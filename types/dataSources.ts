export interface DataSourceField {
  name: string;
  type?: string;
}

export interface DataSourceSection {
  id: string;
  label: string;
  fields: DataSourceField[];
}
