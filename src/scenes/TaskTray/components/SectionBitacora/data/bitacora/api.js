import * as fetchApi from 'services/api';

export function fecthBitacora(body) {
  return fetchApi.post('/obtbitacoratareas', body);
}
