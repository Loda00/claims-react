import * as fetchApi from 'services/api';

const fetchBuscarParametros = body => {
  return fetchApi.post('/bscparametros', body);
};

export default fetchBuscarParametros;
