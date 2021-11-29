import * as fetchApi from 'services/api';

const fetchEliminaAusencia = body => {
  return fetchApi.post('/mantenedorausencias', body);
};

export default fetchEliminaAusencia;
