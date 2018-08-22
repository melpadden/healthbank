import { DateTimeFormatPipe } from './date-time-format.pipe';

describe('DateTimeFormatPipe', () => {
  it('should format a date object to a date with time string', () => {
    const pipe = new DateTimeFormatPipe('de-AT');
    const testDate = new Date(2000, 5, 20, 13, 50);
    const expected = '20.06.2000 13:50';

    expect(pipe.transform(testDate)).toBe(expected);
  });

  it('should format an ISO string to a date with time string', () => {
    const pipe = new DateTimeFormatPipe('de-AT');
    const testDate = '2000-06-20T11:50:40Z';
    // this will only work on timezones with full hours. should be sufficient
    const hourInThisTz = ('0' + (11 + Math.round(new Date(2000, 5, 20).getTimezoneOffset() / -60))).substr(-2);
    const expected = `20.06.2000 ${hourInThisTz}:50`;

    expect(pipe.transform(testDate)).toBe(expected);
  });
});
