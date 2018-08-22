import * as _ from 'lodash';
import { SortDirection } from '../sort-direction.enum';

export interface TableState {

  sortColumn: string;

  sortDirection: SortDirection;

  offset: number;

  limit: number;

  filter: _.Dictionary<string>;

}
