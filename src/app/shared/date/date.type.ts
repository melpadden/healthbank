/**
 * Types to ensure exact date handling on backend
 */

import * as moment from 'moment';

enum PureDateBrand {}
enum PureTimeBrand {}
enum DateTimeBrand {}

export type PureDate = PureDateBrand & string;
// We assume the time format is "HH:MM"
export type PureTime = PureTimeBrand & string;
export type DateTime = DateTimeBrand & string;


/**
 * Extracts the date of a DateTime object. If there is a timezone information, the timezone of the
 * browser will be used.
 */
export function extractDate(dateTime: DateTime): PureDate {
  if (!dateTime) {
    return undefined;
  }

  // IE 11's Date.parse interprets "0002-01-01T' as weird date and not as NaN
  const parts = dateTime.split('T');
  if (parts.length === 2 && parts[1] === '') {
    return parts[0] as PureDate || undefined;
  }

  const unix = Date.parse(dateTime);
  if (isNaN(unix) || (parts.length === 2 && parts[1] && (parts[1].substring(0, 2) === '24'))) {
    return parts[0] as PureDate || undefined;
  }
  const d = new Date(unix);
  const padYear = (y: number) => ('000' + y).substr(-4);
  const padNumber = (y: number) => ('0' + y).substr(-2);
  return padYear(d.getFullYear()) + '-' + padNumber(d.getMonth() + 1) + '-' + padNumber(d.getDate()) as PureDate;
}


/**
 * Extracts the time of a DateTime object. If there is a timezone information, the timezone of the
 * browser will be used.
 */
export function extractTime(dateTime: DateTime): PureTime {
  if (!dateTime) {
    return undefined;
  }

  // IE 11's Date.parse interprets "0002-01-01T' as weird date and not as NaN
  const parts = dateTime.split('T');
  if (parts.length === 2 && parts[1] === '') {
    return undefined;
  }

  const unix = Date.parse(dateTime);
  if (isNaN(unix) || (parts.length === 2 && parts[1] && (parts[1].substring(0, 2) === '24'))) {
    return dateTime.split('T')[1] as PureTime || undefined;
  }
  return new Date(unix).toTimeString().slice(0, 5) as PureTime;
}


/**
 * Takes a date and a time to combine it to a DateTime (ISO string) which will end up with timezone information.
 * The timezone of the browser will be used to interpret the time.
 */
export function mergeDateAndTime(date: PureDate, time: PureTime): DateTime {
  if (!date && !time) {
    return undefined;
  }

  const dateTime = (date || '') + 'T' + (time || '');
  const momentRep = moment(dateTime);
  if (!momentRep.isValid() || !isValidTime(time)) {
    // not a valid ISO string, return what we have
    return dateTime as DateTime;
  }
  return momentRep.toISOString() as DateTime;
}

/**
 * converts a standard Date object to a DateTime type
 */
export function toDateTime(date: Date): DateTime {
  return date ? date.toISOString() as DateTime : undefined;
}

/**
 * converts an DateTime type to a standard Date object
 */
export function fromDateTime(date: DateTime): Date {
  return date ? new Date(date) : undefined;
}


/**
 * converts a standard Date object to a PureDate type
 */
export function toPureDate(date: Date): PureDate {
  return date ? extractDate(toDateTime(date)) : undefined;
}

/**
 * converts PureDate type to a standard Date object
 */
export function fromPureDate(pureDate: PureDate): Date {
  return pureDate ? fromDateTime(mergeDateAndTime(pureDate, '00:00' as PureTime)) : undefined;
}


const timeReg = (/^((?:[01]\d|2[0-3]):?[0-5]\d)$/);

/**
 * tests if the supplied string is a valid time.
 */
export function isValidTime(time: string): boolean {
  return timeReg.test(time);
}
