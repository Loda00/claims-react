import * as fetchApi from 'services/api';
import { get } from 'lodash';

export function fetchTypes(body) {
  if (process.env.REACT_APP_USA_MOCKS === 'S') {
    const ruta = get(body, 'ruta');
    return fetchApi.post(`/obtenerlista-${ruta.toLowerCase()}`, body);
  }
  return fetchApi.postRimac('/obtenerlista', body);
}
