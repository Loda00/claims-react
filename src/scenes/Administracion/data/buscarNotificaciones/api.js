import * as fetchApi from 'services/api';

const fetchBuscarNotificacion = body => {
  return fetchApi.post('/buscarnotificaciones', body);
};

export default fetchBuscarNotificacion;
