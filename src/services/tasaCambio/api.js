import { get } from 'lodash';
import * as fetchApi from 'services/api';

export function fetchTasaCambio(body) {
  if (process.env.REACT_APP_USA_MOCKS === 'S') {
    const monOrigen = get(body, 'codMonOrigen');
    if (monOrigen === 'SOL') {
      return fetchApi.post('/tasacambio1', body);
    }
    return fetchApi.post('/tasacambio2', body);
  }
  return fetchApi.postRimac('/tasacambio', body);
}
