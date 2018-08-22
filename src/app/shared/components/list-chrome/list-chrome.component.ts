import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { SortDirection } from '../sort-direction.enum';
import * as _ from 'lodash';
import { environment } from '../../../../environments/environment';
import {getLocaleSupport} from '../../../core/utils/helper';


export interface ISortDef {
  label: string;
  attr: string;
}

export interface IFilterDef<T> {
  label: string;
  filter: (item: T) => boolean;
}

export type ISortAttr = string | ((item: any, search: string) => boolean);


/**
 * A chrome/wrapper for list pages.
 *
 * The purpose is wrap away repetitive and error prone code and offer a clean interface to needed functionality.
 * TODO IMPORTANT: Document very good....
 */
@Component({
  selector: 'app-list-chrome',
  templateUrl: './list-chrome.component.html',
})
export class ListChromeComponent implements OnInit, OnChanges {
  assets = environment.assets;
  @Input() searchCollapsed: boolean;

  // sorting
  SortDirection = SortDirection;
  @Input() sort: ISortDef[];
  @Input() sortDir: SortDirection = SortDirection.ASC;
  @Input() showSort: boolean;
  sortField = 0;

  // filtering
  @Input() filter: IFilterDef<any>[];
  filterSelection: number = null;
  @Input() searchAttr: ISortAttr[];
  searchText = '';

  // load more button
  size: number;
  blockSize = 20;
  displayedSize: number;

  // list content
  @Input() list: any[];
  slicedList: any[];
  filteredList: any[];

  @Output() loadMore = new EventEmitter<string>();
  @Input() loadMoreToken: string;

  private orderedList: any[];
  loadLazy: boolean;

  constructor() {
    this.displayedSize = this.blockSize;
  }

  ngOnInit() {
    this.loadLazy = this.loadMore.observers.length > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('list' in changes || 'sortDir' in changes) {
      this.sortList();
    } else if ('searchAttr' in changes) {
      this.filterList();
    }
  }

  hasTextSearch(): boolean {
    return !!this.searchAttr;
  }

  hasSort(): boolean {
    return !!this.sort;
  }

  showSortField(): boolean {
    return !!this.sort && (this.showSort || this.sort.length > 1);
  }


  hasFilter(): boolean {
    return !!this.filter;
  }

  moreItems() {
    if (this.loadLazy) {
      this.loadMore.emit(this.loadMoreToken);
    } else {
      this.displayedSize += this.blockSize;

      if (this.slicedList) {
        this.slicedList = this.filteredList.slice(0, this.displayedSize);
      }
    }
  }

  getRemaining() {
    if (this.filteredList) {
      return this.filteredList.length - this.displayedSize;
    } else {
      return 0;
    }
  }

  getToExtend() {
    return Math.min(this.blockSize, this.getRemaining());
  }

  resetFilter() {
    this.filterSelection = null;
    this.filterList();
  }

  sortList(): Object[] {
    this.orderedList = this.list || [];

    if (this.hasSort()) {
      const sortAttr: string = this.sort[this.sortField].attr;
      const sortDir: number = this.sortDir === SortDirection.ASC ? 1 : -1;
      const localeSupport = getLocaleSupport();

      this.orderedList.sort((a: any, b: any): number => {
        /* tslint:disable:typedef */
        const aItem = (a && a[sortAttr]);
        const bItem = (b && b[sortAttr]);

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

    return this.filterList();
  }

  filterList(): Object[] {
    const list: Object[] = this.orderedList || [];
    const searchTermNormalized = this.searchText && this.searchText.toUpperCase();

    if (searchTermNormalized || this.filterSelection !== null) {
      this.filteredList = _.filter(list, (el) => {
        if (this.filterSelection !== null && !this.filter[this.filterSelection].filter(el)) {
          return false;
        }

        if (searchTermNormalized) {
          return this.textComparator(searchTermNormalized, el);
        }

        return true;
      });
    } else {
      this.filteredList = list;
    }

    this.displayedSize = Math.max(this.blockSize, this.filteredList.length);
    this.slicedList = this.filteredList.slice(0, this.displayedSize);

    return this.filteredList;
  }

  showMore() {
    if (this.loadLazy) {
      return this.loadMoreToken;
    }
    return this.slicedList && this.displayedSize < this.filteredList.length;
  }

  private textComparator(search: string, item: any): boolean {
    if (!item) {
      return false;
    }

    let result = false;
    for (const attr of this.searchAttr) {
      if (typeof attr === 'function') {
        result = result || attr(item, search);
      } else {
        result = result || (item[attr] && (item[attr].toUpperCase ? item[attr].toUpperCase() : String(item[attr])).indexOf(search) > -1);
      }
    }

    return result;
  }
}
