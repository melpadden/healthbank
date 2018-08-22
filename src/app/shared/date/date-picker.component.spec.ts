
import { DateFormatter } from './date-picker.component';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

describe('DatePickerComponent-DateFormatter', () => {
  const df = new DateFormatter();
  const today = new Date();

  it('should parse 1.1.2000 as 2000-01-01', () => {
    const expected = {year: 2000, month: 1, day: 1};
    const actual = df.parse('1.1.2000');

    expect(actual).toEqual(expected);
  });

  it('should parse 01012000 as 2000-01-01', () => {
    const expected = {year: 2000, month: 1, day: 1};
    const actual = df.parse('01012000');

    expect(actual).toEqual(expected);
  });

  it('should parse 0101 as [currentYear]-01-01', () => {
    const expected = {year: today.getFullYear(), month: 1, day: 1};
    const actual = df.parse('0101');

    expect(actual).toEqual(expected);
  });

  it('should parse 01.01 as [currentYear]-01-01', () => {
    const expected = {year: today.getFullYear(), month: 1, day: 1};
    const actual = df.parse('01.01');

    expect(actual).toEqual(expected);
  });

  it('should parse 01.01. as [currentYear]-01-01', () => {
    const expected = {year: today.getFullYear(), month: 1, day: 1};
    const actual = df.parse('01.01.');

    expect(actual).toEqual(expected);
  });

  it('should parse 01 as [currentYear]-[currentMonth]-01', () => {
    const expected = {year: today.getFullYear(), month: today.getMonth() + 1, day: 1};
    const actual = df.parse('01');

    expect(actual).toEqual(expected);
  });

  it('should parse "1" as [currentYear]-[currentMonth]-01', () => {
    const expected = {year: today.getFullYear(), month: today.getMonth() + 1, day: 1};
    const actual = df.parse('1');

    expect(actual).toEqual(expected);
  });

  it('should parse "123" as invalid date', () => {
    const expected: NgbDateStruct = null;
    const actual = df.parse('123');

    expect(actual).toEqual(expected);
  });

  it('should parse "30129" as invalid date', () => {
    const expected: NgbDateStruct = null;
    const actual = df.parse('30129');

    expect(actual).toEqual(expected);
  });

  it('should not crash on null', () => {
    const expected: NgbDateStruct = null;
    const actual = df.parse(null);

    expect(actual).toEqual(expected);
  });
});
