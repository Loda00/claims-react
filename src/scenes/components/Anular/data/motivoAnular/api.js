import * as fetchApi from 'services/api';

export function obtenerMotivoAnular(body) {
  if (process.env.REACT_APP_USA_MOCKS === 'S') {
    return fetchApi.post('/obtenerlista-crg_lval_moanus', body);
  }
  return fetchApi.postRimac('/obtenerlista', body);
}
