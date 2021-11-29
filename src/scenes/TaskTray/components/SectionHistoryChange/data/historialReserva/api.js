import * as fetchApi from 'services/api';

export function fecthHistorialReserva(body) {
  return fetchApi.post('/obthistorialreserva', body);
}
