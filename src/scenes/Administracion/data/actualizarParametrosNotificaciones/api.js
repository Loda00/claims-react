import * as fetchApi from 'services/api';

const fetchActualizarParametrosNotificacion = body => {
  return fetchApi.post('/actualizarparamnotificacion', body);
};

export default fetchActualizarParametrosNotificacion;
