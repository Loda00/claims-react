import * as fetchApi from 'services/api';

const fetchBusquedaParametros = body => {
  return fetchApi.post('/buscarparametros', body);
};

export default fetchBusquedaParametros;
