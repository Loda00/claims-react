import * as fetchApi from 'services/api';

const fetchObtieneAusencia = body => {
  return fetchApi.post('/obtpersonaausencia', body);
};

export default fetchObtieneAusencia;
