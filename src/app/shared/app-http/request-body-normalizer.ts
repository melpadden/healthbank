
/**
 * Recursively replaces all empty string values with null.
 *
 * Our backend does distinguish between empty strings and null. As the user might change a field and empty it again,
 * we normalize empty strings to null.
 */
export function normalizeEmptyStrings<T extends {[index: string]: any}>(data: T): T {
  if (!data) {
    // it is null or undefined or [] or ..
    return data;
  }

  const dataCopy = <T>(Array.isArray(data) ? [...data] : Object.assign({}, data));
  for (const k of Object.keys(dataCopy)) {
    if ((dataCopy[k] as any) === '') {
      dataCopy[k] = null;
    } else if (typeof dataCopy[k] === 'object') {
      dataCopy[k] = normalizeEmptyStrings(dataCopy[k]);
    }
  }

  return dataCopy;
}
