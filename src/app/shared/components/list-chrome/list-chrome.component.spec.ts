/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ListChromeComponent } from './list-chrome.component';
import { PureDate } from '../../date/date.type';
import { SharedModule } from '../../shared.module';
import { SortDirection } from '../sort-direction.enum';

interface ITestModel {
  identifier: string;
  firstName?: string;
  zip?: number;
  birthday?: PureDate;
}

describe('ListChromeComponent', () => {
  let component: ListChromeComponent;
  let fixture: ComponentFixture<ListChromeComponent>;
  let customerHugo: ITestModel;
  let customerQuaksi: ITestModel;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: []
    })
      .compileComponents();

    customerHugo = {
      identifier: 'hm@mail.com',
      firstName: 'Hugo',
      zip: 3300,
      birthday: '2017-03-19' as PureDate
    };
    customerQuaksi = {
      identifier: 'quäksi@frog.com'
    };
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListChromeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with initial list', () => {
    component.list = [customerHugo, customerQuaksi];
    component.searchAttr = ['identifier'];

    // manual call, as `detectChanges` does not trigger `ngOnChanges`
    component.sortList();
    fixture.detectChanges();

    expect(component.slicedList).toEqual([customerHugo, customerQuaksi]);
    expect(fixture.debugElement.query(By.css('#search-input'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('#date-sort-asc'))).toBeFalsy();
  });

  it('should filter via search input', function () {
    component.list = [customerHugo, customerQuaksi];
    component.searchAttr = ['identifier', 'zip', (item: ITestModel, search: string) => false];
    component.sortList();

    expect(component.slicedList[0]).toBe(customerHugo);
    expect(component.slicedList[1]).toBe(customerQuaksi);

    // filter string at beginning
    component.searchText = 'q';
    component.filterList();

    expect(component.slicedList.length).toBe(1, 'should filter string at beginning');
    expect(component.slicedList[0]).toBe(customerQuaksi, 'should filter string at beginning');

    // case insensitive
    component.searchText = 'Q';
    component.filterList();

    expect(component.slicedList.length).toBe(1, 'should filter case insensitive');
    expect(component.slicedList[0]).toBe(customerQuaksi, 'should filter case insensitive');

    // find locale in middle of the word
    component.searchText = 'äk';
    component.filterList();

    expect(component.slicedList.length).toBe(1, 'should filter in the middle of a word with locale char');
    expect(component.slicedList[0]).toBe(customerQuaksi, 'should filter in the middle of a word with locale char');

    // don't find un-indexed word
    component.searchText = 'Hugo';
    component.filterList();

    expect(component.slicedList.length).toBe(0, 'should ignore field not included in `searchAttr`');

    // part in in numeric postcode
    component.searchText = '30';
    component.filterList();

    expect(component.slicedList.length).toBe(1, 'should filter parts in number');
    expect(component.slicedList[0]).toBe(customerHugo, 'should filter parts in number');
  });

  it('should sort case insensitive and localized', function () {
    const custa: ITestModel = {identifier: 'a@mail.com'};
    const custB: ITestModel = {identifier: 'Ä@mail.com'};
    const custc: ITestModel = {identifier: 'c@mail.com'};

    component.list = [custc, custa, custB];
    component.sort = [{label: 'E-Mail', attr: 'identifier'}];
    component.sortList();

    expect(component.slicedList[0]).toBe(custa);
    expect(component.slicedList[1]).toBe(custB);
    expect(component.slicedList[2]).toBe(custc);
  });

  it('should group same casings together', function () {
    component.list = [{identifier: 'a@mail.com'},
        {identifier: 'A@mail.com'},
        {identifier: 'a@mail.com'},
        {identifier: 'A@mail.com'}];
    component.sort = [{label: 'E-Mail', attr: 'identifier'}];
    component.sortList();

    expect(component.slicedList[0].identifier).toEqual(component.slicedList[1].identifier,
      'first two items should be the same casing');
    expect(component.slicedList[2].identifier).toEqual(component.slicedList[3].identifier,
      'third and fourth items should be the same casing');
  });

  it('should use set sort direction', function () {
    const custa: ITestModel = {identifier: 'a@mail.com'};
    const custB: ITestModel = {identifier: 'Ä@mail.com'};
    const custc: ITestModel = {identifier: 'c@mail.com'};

    component.list = [custc, custa, custB];
    component.sort = [{label: 'E-Mail', attr: 'identifier'}];
    component.sortDir = SortDirection.DESC;
    component.sortList();

    expect(component.slicedList[0]).toBe(custc);
    expect(component.slicedList[1]).toBe(custB);
    expect(component.slicedList[2]).toBe(custa);
  });
});
