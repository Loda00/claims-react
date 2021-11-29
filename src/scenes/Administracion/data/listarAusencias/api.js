import * as fetchApi from 'services/api';

const fetchListaAusencias = body => {
  return fetchApi.post('/lstpersonaausencias', body);
};

export default fetchListaAusencias;
