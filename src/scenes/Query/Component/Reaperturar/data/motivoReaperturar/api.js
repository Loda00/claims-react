import * as fetchApi from 'services/api';

export function obtenerMotivo(body) {
  if (process.env.REACT_APP_USA_MOCKS === 'S') {
    return fetchApi.post('/obtenerlista-crg_lval_motreanu', body);
  }
  return fetchApi.postRimac('/obtenerlista', body);
}
