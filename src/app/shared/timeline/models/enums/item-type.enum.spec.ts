import { ItemType } from './item-type.enum';

describe('Item Type Enum', () => {
  it('should have a label for each value', () => {
    for (const val of Object.keys(ItemType)) {
      expect(Object.keys(ItemType)).toContain(val);
    }
  });
});
