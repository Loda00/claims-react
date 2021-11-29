import * as fetchApi from 'services/api';

const fetchCreaParametro = body => {
  return fetchApi.post('/crearparametro', body);
};

export default fetchCreaParametro;
