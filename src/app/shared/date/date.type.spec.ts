import {
  DateTime,
  extractDate,
  extractTime,
  fromDateTime,
  fromPureDate,
  isValidTime,
  mergeDateAndTime,
  PureDate,
  PureTime,
  toDateTime,
  toPureDate
} from './date.type';


describe('Date Types', () => {
  describe('date extraction', () => {
    it('should extract the date where the timezone will push it to a different date', () => {
      const timezoneOffset = new Date().getTimezoneOffset();
      let testDate;

      console.log('Current time zone offset', timezoneOffset, new Date().toTimeString());
      if (timezoneOffset === 0) {
        // UTC
        testDate = '2000-01-01T23:59:00Z';
      } else if (timezoneOffset < 0) {
        // before UTC: Europe, Asia
        testDate = '1999-12-31T23:59:00Z';
      } else {
        // after UTC: America
        testDate = '2000-01-02T00:00:00Z';
      }

      const actual = extractDate(testDate as DateTime);
      const expected = '2000-01-01';

      expect(actual).toEqual(expected);
    });

    it('should extract the date where the timezone will just NOT push it to a different date', () => {
      let testDate;
      if (new Date().getTimezoneOffset() < 0) {
        // before UTC: Europe, Asia
        testDate = '2000-01-01T00:00:00Z';
      } else if (new Date().getTimezoneOffset() > 0) {
        // after UTC: America
        testDate = '2000-01-01T23:59:00Z';
      } else {
        // boring, this is UTC...
        testDate = '2000-01-01T00:00:00Z';
      }

      const actual = extractDate(testDate as DateTime);
      const expected = '2000-01-01';

      expect(actual).toEqual(expected);
    });

    it('should support ISO string using UTC timezone', () => {
      const timezoneOffset = new Date().getTimezoneOffset() * -1;
      const timezoneString =
        (timezoneOffset <= 0 ? '+' : '-') +
        ('0' + timezoneOffset / 60).substr(-2) +
        ':' +
        ('0' + timezoneOffset % 60).substr(-2);

      const actual = extractDate('2000-01-01T00:00:00' + timezoneString as DateTime);
      const expected = '2000-01-01';

      expect(actual).toEqual(expected);
    });

    it('should correctly extract a very early date on IE11 (#54283)', () => {
      const actual = extractDate('0002-01-01T' as DateTime);
      const expected = '0002-01-01';

      expect(actual).toEqual(expected);
    });
  });

  describe('time extraction', () => {
    it('should extract the time where the timezone will change the time', () => {
      // note: running this test in UTC timezone, would be pretty boring
      const newYearEvening = new Date(2000, 0, 1, 18, 34, 56).toISOString();
      const actual = extractTime(newYearEvening as DateTime);
      const expected = '18:34';

      expect(actual).toEqual(expected);
    });

    it('should support ISO string using UTC timezone', () => {
      const timezoneOffset = Math.abs(new Date('2000-01-01').getTimezoneOffset());
      const timezoneString =
        (new Date().getTimezoneOffset() <= 0 ? '+' : '-') +
        ('0' + timezoneOffset / 60).substr(-2) +
        ':' +
        ('0' + timezoneOffset % 60).substr(-2);
      const actual = extractTime('2000-01-01T18:00:00' + timezoneString as DateTime);
      const expected = '18:00';

      expect(actual).toEqual(expected);
    });

    it('should correctly extract a very early partial dateTime on IE11 (#54283)', () => {
      const actual = extractTime('0002-01-01T' as DateTime);
      const expected = undefined as PureTime;

      expect(actual).toEqual(expected);
    });
  });

  describe('merge time and date', () => {
    it('should merge a time and a date on base of the current timezone', () => {
      const actual = mergeDateAndTime('2000-01-01' as PureDate, '00:00' as PureTime);
      const expected = new Date(2000, 0, 1, 0, 0).toISOString();

      expect(actual).toEqual(expected);
    });

    it('should integrate with extract methods', () => {
      const startDate = '1999-12-31T23:00:00.000Z' as DateTime;
      const extractedDate = extractDate(startDate);
      const extractedTime = extractTime(startDate);
      const actual = mergeDateAndTime(extractedDate, extractedTime);

      expect(actual).toEqual(startDate);
    });

    it('should preserve date if time is not set', () => {
      const date = '1999-12-31' as PureDate;
      const expected = '1999-12-31T';
      const actual = mergeDateAndTime(date, null);

      expect(actual).toEqual(expected);
    });

    it('should preserve time if date is not set', () => {
      const time = '23:12' as PureTime;
      const expected = 'T23:12';
      const actual = mergeDateAndTime(null, time);

      expect(actual).toEqual(expected);
    });

    it('should be undefined if neither date nor time is set', () => {
      const actual = mergeDateAndTime(null, undefined);

      expect(actual).toBeUndefined();
    });
  });

  describe('toPureDate', () => {
    it('should accept undefined values', () => {
      expect(toPureDate(undefined)).toBe(undefined);
    });

    it('should convert a date object to a PureDate type which is only a date ISO string', () => {
      expect(toPureDate(new Date(2000, 4, 20))).toBe('2000-05-20');
    });
  });

  describe('fromPureDate', () => {
    it('should accept undefined values', () => {
      expect(fromPureDate(undefined)).toBe(undefined);
    });

    it('should convert PureDate to a date object', () => {
      expect(fromPureDate('2000-04-20' as PureDate)).toEqual(new Date(2000, 3, 20));
    });
  });

  describe('toDateTime', () => {
    it('should accept undefined values', () => {
      expect(toDateTime(undefined)).toBe(undefined);
    });

    it('should basically convert a date to an ISO string', () => {
      const testDate = new Date(2000, 4, 10, 20, 30, 40);
      expect(toDateTime(testDate)).toBe(testDate.toISOString());
    });
  });

  describe('fromDateTime', () => {
    it('should accept undefined values', () => {
      expect(fromDateTime(undefined)).toBe(undefined);
    });

    it('should convert DateTime to a date object', () => {
      const newYearEvening = new Date(2000, 0, 1, 18, 34, 56).toISOString();
      expect(fromDateTime(newYearEvening as DateTime))
        .toEqual(new Date(2000, 0, 1, 18, 34, 56));
    });
  });

  describe('isValidTime', () => {
    it('should accept full valid date', () => {
      expect(isValidTime('12:34')).toBe(true);
    });

    it('should accept valid date with missing ":"', () => {
      expect(isValidTime('1234')).toBe(true);
    });

    it('should not accept null', () => {
      expect(isValidTime(null)).toBe(false);
    });

    it('should not accept undefined', () => {
      expect(isValidTime(undefined)).toBe(false);
    });

    it('should not accept 3 digit numbers', () => {
      expect(isValidTime('123')).toBe(false);
    });

    it('should not accept alphanumeric characters', () => {
      expect(isValidTime('123a')).toBe(false);
    });
  });
});
