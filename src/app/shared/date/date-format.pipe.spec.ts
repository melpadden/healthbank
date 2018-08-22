import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  it('should format a date object to a date string ', () => {
    const pipe = new DateFormatPipe('de-AT');
    const testDate = new Date(2000, 5, 20, 13, 50);
    const expected = '20.06.2000';

    expect(pipe.transform(testDate)).toBe(expected);
  });

  it('should format an ISO string to a date string', () => {
    const pipe = new DateFormatPipe('de-AT');
    const testDate = '2000-06-20T11:50:40Z';
    const expected = '20.06.2000';

    expect(pipe.transform(testDate)).toBe(expected);
  });

  it('should format a PureDate to a date string', () => {
    const pipe = new DateFormatPipe('de-AT');
    const testDate = '1939-09-24';
    const expected = '24.09.1939';

    expect(pipe.transform(testDate)).toBe(expected);
  });

  it('should format a null value as empty string', () => {
    const pipe = new DateFormatPipe('de-AT');
    const testDate: string = null;
    const expected = '';

    expect(pipe.transform(testDate)).toBe(expected);
  });

  it('should format an empty string value as empty string', () => {
    const pipe = new DateFormatPipe('de-AT');
    const testDate = '';
    const expected = '';

    expect(pipe.transform(testDate)).toBe(expected);
  });
});
