import * as fetchApi from 'services/api';

const fetchCreaAusencia = body => {
  return fetchApi.post('/mantenedorausencias', body);
};
export default fetchCreaAusencia;
