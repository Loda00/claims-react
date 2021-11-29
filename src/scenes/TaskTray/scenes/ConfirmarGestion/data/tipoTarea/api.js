import * as fetchApi from 'services/api';

export function fetchTipoTarea(request) {
  return fetchApi.post('/obtestadoprocesopago', request);
}
