import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from '@angular/core';
import { PropFunction, TableColumn } from './table-column.model';
import { TableState } from './table-state.model';
import { Observable } from 'rxjs/Observable';
import { TableData } from './table-data.model';
import { SortDirection } from '../sort-direction.enum';
import * as _ from 'lodash';
import 'rxjs/add/observable/of';


// CONSTANTS

const DEFAULT_PAGE_SIZE = 25;


// COMPONENT

@Component({
  selector: 'app-table',
  templateUrl: 'table.component.html',
})
export class TableComponent implements OnInit, OnChanges {

  @Input() enableCustomTableBody: boolean;

  @Input() data: TableData<any>;

  @Input() columns: TableColumn[];

  @Input() sortColumn: string;

  @Input() sortDirection: SortDirection = SortDirection.ASC;

  @Input() page: number;

  @Input() pageSize: number;

  @Input() enableClientTableFeatures: boolean;

  @Input() enableColumnFilters: boolean;

  @Output() stateChange: EventEmitter<TableState> = new EventEmitter<TableState>();

  @Output() clickRow: EventEmitter<any> = new EventEmitter<any>();

  columnFilters: _.Dictionary<string> = {};

  filterState: _.Dictionary<string> = {};

  rows: any[];

  totalLength: number;

  // export enums
  SortDirection = SortDirection;

  constructor() {
  }

  ngOnInit(): void {
    if (!this.rows) {
      if (this.data) {
        this.rows = this.data.rows || [];
      } else {
        this.rows = [];
      }
    }

    if (!this.totalLength) {
      if (this.data) {
        this.totalLength = this.data.totalLength;
      } else {
        this.totalLength = this.rows.length;
      }
    }

    if (!this.page) {
      this.page = 0;
    }

    if (!this.pageSize) {
      this.pageSize = DEFAULT_PAGE_SIZE;
    }

    this.initColumnKeys();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.onStateChange();

    if (this.data) {
      this.totalLength = this.data.totalLength;
    } else {
      this.totalLength = this.rows.length;
    }
  }

  get pageStart() {
    return ((this.page - 1) * this.pageSize) + 1;
  }

  get pageEnd() {
    return this.pageStart + this.rows.length - 1;
  }

  initColumnKeys() {
    _.each(this.columns, (col, idx) => {
      if (!col.key) {
        col.key = `__gen_${idx}`;
      }
    });
  }

  onChangeFilter() {
    if (!_.isEqual(this.columnFilters, this.filterState)) {
      this.filterState = _.extend({}, this.columnFilters);
      this.triggerStateChange();
    }
  }

  onChangeSorting(column) {
    if (column.disableSorting) {
      return;
    }

    let columnProperty = column.key;

    if (columnProperty.indexOf('__gen') === 0) {
      columnProperty = column.prop;
    }

    if (this.sortColumn === columnProperty) {
      if (this.sortDirection === SortDirection.ASC) {
        this.sortDirection = SortDirection.DESC;
      } else {
        this.sortColumn = null;
        this.sortDirection = null;
      }
    } else {
      this.sortColumn = columnProperty;
      this.sortDirection = SortDirection.ASC;
    }

    this.triggerStateChange();
  }

  onPageChanged() {
    this.triggerStateChange();
  }

  onClickRow(row) {
    this.clickRow.emit(row);
  }

  accessRow(row: any, col: TableColumn) {
    let content: Observable<string>;
    const cachedValue = TableComponent.getCachedColumnValue(row, col.key);

    if (cachedValue === null) {
      const prop = col.prop;

      if (typeof prop === 'function') {
        const res: any = prop(row);

        if (!(res instanceof Observable)) {
          content = Observable.of(res);
        } else {
          content = res;
        }
      } else {
        const ps: string[] = (<string>prop).split('.');
        let root: any = row;
        for (const p of ps) {
          if (root) {
            root = root[p];
          }
        }
        content = Observable.of(root);
      }

      // buffer column value
      content.subscribe((val) => TableComponent.setCachedColumnValue(row, col.key, val));

      return content;
    } else {
      return Observable.of(cachedValue);
    }
  }

  filterRows(origList): any[] {
    return _.filter(origList, (row) => {
      return _.reduce(this.filterState, (result, filterValue, filterProp) => {
        const colValue = TableComponent.getCachedColumnValue(row, filterProp, row[filterProp] + '');
        return result && (!filterValue || colValue.toLocaleLowerCase().indexOf(filterValue.toLocaleLowerCase()) >= 0);
      }, true);
    });
  }

  private static getCachedColumnValue(row: any, colId: string, defaultValue: string = null): string {
    if (row.__cachedRowValue && row.__cachedRowValue[colId]) {
      return row.__cachedRowValue[colId];
    }
    return defaultValue;
  }

  private static setCachedColumnValue(row: any, colId: string, val: string): void {
    if (!row.__cachedRowValue) {
      row.__cachedRowValue = { };
    }
    row.__cachedRowValue[colId] = val;
  }

  private triggerStateChange() {
    this.stateChange.emit({
      sortColumn: this.sortColumn,
      sortDirection: this.sortDirection,
      offset: (this.page - 1) * this.pageSize,
      limit: this.pageSize,
      filter: this.filterState
    });

    this.onStateChange();
  }

  private onStateChange() {
    if (this.enableClientTableFeatures) {
      const orderedList = this.sortRows();
      const filteredList = this.filterRows(orderedList);
      const offset = this.pageStart - 1;
      this.rows = filteredList.slice(offset, offset + this.pageSize);
    } else if (this.data) {
      this.rows = this.data.rows;
      this.totalLength = this.data.totalLength;
    }
  }

  private sortRows(): any[] {
    const orderedList = [...this.data.rows];

    if (this.sortColumn) {

      const sortDir: number = this.sortDirection === SortDirection.ASC ? 1 : -1;
      let localeSupport = false;

      try {
        'foo'.localeCompare('bar', 'i');
      } catch (e) {
        // only in this case are the locale parameters supported!
        // tslint:disable-next-line:max-line-length
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#Check_browser_support_for_extended_arguments
        if (e.name === 'RangeError') {
          localeSupport = true;
        }
      }

      orderedList.sort((a: any, b: any): number => {
        /* tslint:disable:typedef */
        const aItem = TableComponent.getCachedColumnValue(a, this.sortColumn, (a && a[this.sortColumn]) + '');
        const bItem = TableComponent.getCachedColumnValue(b, this.sortColumn, (b && b[this.sortColumn]) + '');

        if (!aItem && !bItem) {
          return 0;
        }

        // null < [someValue]
        if (!aItem && bItem) {
          return sortDir;
        }

        // [someValue] > null
        if (aItem && !bItem) {
          return -1 * sortDir;
        }

        if (localeSupport) {
          return aItem.localeCompare(bItem, 'de', {caseFirst: 'upper'}) * sortDir;
        } else {
          // fallback. Note: at least chrome and phantomjs sort casing different
          return aItem.localeCompare(bItem) * sortDir;
        }
      });

    }

    return orderedList;
  }
}
