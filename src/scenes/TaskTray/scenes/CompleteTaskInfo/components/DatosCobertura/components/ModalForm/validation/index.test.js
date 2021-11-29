import { validaFechaDeOcurrencia } from './index';

test('cobertura valida', () => {
  const rangos = [{ fecinivig: '20140214', fecfinvig: '20140314' }];
  expect(validaFechaDeOcurrencia(rangos)).toBe(undefined);
});

test('cobertura invalida', () => {
  const rangos = [];
  expect(validaFechaDeOcurrencia(rangos)).toBe('Cobertura no válida para la fecha de ocurrencia seleccionada');
});
