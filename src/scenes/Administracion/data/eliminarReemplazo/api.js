import * as fetchApi from 'services/api';

const fetchEliminaReemplazo = body => {
  return fetchApi.post('/mantenedorausencias', body);
};

export default fetchEliminaReemplazo;
