import * as fetchApi from 'services/api';

function crearCobertura(body) {
  return fetchApi.post('/actualizarreservacobertura', body);
}

export default crearCobertura;
