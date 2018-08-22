import { normalizeEmptyStrings } from './request-body-normalizer';


describe('ReqNormalizer interceptor', () => {

  describe('normalizes \'\' -> null', () => {
    it('should cope with null data', function () {
      expect(() => normalizeEmptyStrings(null)).not.toThrow();
      expect(() => normalizeEmptyStrings(undefined)).not.toThrow();
      expect(() => normalizeEmptyStrings({})).not.toThrow();
      expect(() => normalizeEmptyStrings([])).not.toThrow();
      expect(normalizeEmptyStrings(null)).toEqual(null);
      expect(normalizeEmptyStrings(undefined)).toEqual(undefined);
      expect(normalizeEmptyStrings({})).toEqual({});
      expect(normalizeEmptyStrings([])).toEqual([]);
    });

    it('should normalize simple objects with empty strings', function () {
      const origData = {
        nullStr: null as string,
        emptyStr: '',
        filledStr: 'asd'
      };

      const data = normalizeEmptyStrings(origData);

      expect(data.nullStr).toBe(null);
      expect(data.emptyStr).toBe(null);
      expect(data.filledStr).toBe('asd');

      // original data shall not be changed
      expect(origData.nullStr).toBe(null);
      expect(origData.emptyStr).toBe('');
      expect(origData.filledStr).toBe('asd');
    });

    it('should normalize deep objects', function () {
      const origData = {
        subObj: {
          subEmpty: '',
          subObj: {
            subEmpty: ''
          }
        }
      };
      const data = normalizeEmptyStrings(origData);

      expect(data.subObj.subEmpty).toBe(null);
      expect(data.subObj.subObj.subEmpty).toBe(null);

      // original data shall not be changed
      expect(origData.subObj.subEmpty).toBe('', 'first nested object should not be changed');
      expect(origData.subObj.subObj.subEmpty).toBe('', 'nested object on depth 2 should not be changed');
    });

    it('should normalize deep arrays', function () {
      const origData: any = ['', ['']];
      const data = normalizeEmptyStrings(origData);

      expect(Array.isArray(data)).toBe(true, 'sanitized array should still be an array');
      expect(data[0]).toBe(null);
      expect(data[1][0]).toBe(null);

      // original data shall not be changed
      expect(origData[0]).toBe('', 'first element should not be changed');
      expect(origData[1][0]).toBe('', 'nested second element should not be changed');
    });
  });
});
