import * as fetchApi from 'services/api';

const fetchCreaSubparametro = body => {
  return fetchApi.post('/crearparametro', body);
};

export default fetchCreaSubparametro;
