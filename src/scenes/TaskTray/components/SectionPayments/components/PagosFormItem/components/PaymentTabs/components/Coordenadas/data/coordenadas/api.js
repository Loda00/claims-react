import * as fetchApi from 'services/api';

export function fetchCoordenadas(body) {
  return fetchApi.post('/obtcoordenadabancaria', body);
}

export function maintainCoordenada(body) {
  return fetchApi.post('/mantenercoordenadabancaria', body);
}

export function sendCoordenadaCore(body) {
  return fetchApi.postRimac('/cambiarmodpago', body);
}
