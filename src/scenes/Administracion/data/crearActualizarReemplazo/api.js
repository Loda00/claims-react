import * as fetchApi from 'services/api';

const fetchCreaActualizaReemplazo = body => {
  return fetchApi.post('/mantenedorausencias', body);
};

export default fetchCreaActualizaReemplazo;
