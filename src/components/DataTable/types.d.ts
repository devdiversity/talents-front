export interface IAction {
  action: string;
  row: ITableRow;
  data: unknown;
}

export interface ITableRow {
  [key: string]: string;
}

export type TablesearchTextStrategy = 'single' | 'and' | 'or'; // if not defined = single
export interface ITableSchema {
  title: string;
  name: string;
  rowsPerPage?: number;
  searchTextStrategy?: TablesearchTextStrategy;
  headerLeft?: ITableHeaderLeft;
  headerRight?: ITableHeaderRight;
  headerConfig?: ITableHeaderConfig;
  columns: ITableColumn[];
}

export interface ITableSearchConfigRadio {
  color: string;
  icon: string;
  value: string;
  label: string;
}

export interface ITableSearchConfig<T> {
  options: { [key: number]: T };
}

export type TableSearchComponents =
  | 'TableSearch'
  | 'TableSearchRadio'
  | 'TableSearchDate'
  | 'TableSearchArray';
export interface ITableSearch {
  component: TableSearchComponents;
  componentConfig?: ITableSearchConfig<ITableSearchConfigRadio>;
}

export interface ITableField<T> {
  [Key: string]: T;
}

export interface ITableAction {
  action: string;
  row: { [key: string]: string };
}

export type HeaderLeftComponents = 'TableHeaderButtons';

export interface ITableHeaderButton {
  icon: string;
  label: string;
  color: string;
  flat?: boolean;
  round?: boolean;
  size: string;
  unelevated?: boolean;
  action: string;
}

export interface ITableHeaderLeft {
  component: HeaderLeftComponents;
  componentConfig?: ITableHeaderButton[];
}

export interface ITableHeaderRight {
  component: HeaderLeftComponents;
  componentConfig?: ITableHeaderButton[];
}

export interface ITableHeaderConfig {
  component: HeaderLeftComponents;
  componentConfig?: unknown;
}

export interface ITableDate {
  format: string;
}

export interface ITableSearchConfig<T> {
  options: { [key: number]: T };
}

export interface ITableActiveConfig {
  [key: string]: {
    icon: string;
    label: string;
    color: string;
  };
}

export interface ITableStatusConfig {
  [key: string]: {
    icon: string;
    label: string;
    color: string;
  };
}

export interface ITableStatusItem {
  icon: string;
  label: string;
  color: string;
  action: string;
}

export interface ITableStatus {
  [key: string]: ITableStatusItem;
}

export interface ITableMenu {
  menu: ITableMenuItem[];
}

export interface ITableMenuItem {
  icon: string;
  label: string;
  color: string;
  action: string;
}

export interface ISearchData {
  field: string;
  value: string | ISelectedDate;
  type: string;
}

export type TableComponents =
  | 'TableRoles'
  | 'TableDate'
  | 'TableStatus'
  | 'TableMenu'
  | 'TableConfig';

export interface ITableColumn {
  name: string;
  label?: string;
  field?: string;
  required?: boolean;
  align?: string;
  sortable?: boolean;
  sort?(a: string, b: string): string | number;
  format?(val: string): string;
  width?: number;
  style?: { [key: string]: string };
  classes?: string;
  headerStyle?: { [key: string]: string };
  headerClasses?: string;
  search?: ITableSearch;
  component?: TableComponents;
  componentConfig?:
    | unknown
    | ITableDate
    | ITableStatus[]
    | ITableMenu
    | ITableHeaderButton;
}

export interface ISearchItem {
  component: TableSearchComponents;
  value: string | ISelectedDate;
  mode: string;
  data?: unknown;
}

export interface ISearchValues {
  [key: string]: ISearchItem;
}

export interface ISearchAnd {
  items: { [key: string]: { [key: string]: unknown } };
  itemsTofind: string[];
  itemsFounded: string[];
}

export interface ISearchData {
  field: string;
  value: string | ISelectedDate;
}

export interface ISelectedDate {
  from: string;
  to: string;
}
