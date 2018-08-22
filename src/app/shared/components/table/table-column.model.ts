import { Observable } from 'rxjs/Observable';

export type PropFunction = (row: any) => string | Observable<string | any>;

export interface TableColumn {

  key?: string;

  prop: PropFunction | string;

  label: string;

  disableSorting?: boolean;

  disableFiltering?: boolean;

}
