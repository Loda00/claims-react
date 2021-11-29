import * as Utils from './index';

it('should order numbers', () => {
  expect(Utils.sortNumbers(123, 124)).toBe(-1);
  expect(Utils.sortNumbers(undefined, 124)).toBe(-1);
  expect(Utils.sortNumbers(2, undefined)).toBe(1);
});

it('should format amount', () => {
  expect(Utils.formatAmount(20)).toBe('20.00');
  expect(Utils.formatAmount(0)).toBe('0.00');
  expect(Utils.formatAmount('')).toBe('');
});

it('should check is empty', () => {
  expect(Utils.hasEmpty({ continente: '1', codPais: '485' })).toBe(false);
  expect(Utils.hasEmpty({ continente: '', codPais: '485' })).toBe(true);
  expect(Utils.hasEmpty({ continente: undefined, codPais: '485' })).toBe(true);
  expect(Utils.hasEmpty({ continente: 0, codPais: '485' })).toBe(true);
  expect(Utils.isArgumentsEmpty(0, '485')).toBe(true);
  expect(Utils.isArgumentsEmpty(undefined, '485')).toBe(true);
  expect(Utils.isArgumentsEmpty('1', '485')).toBe(false);
});
