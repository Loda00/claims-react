import * as fetchApi from 'services/api';

const fetchActualizaUtlParametro = body => {
  return fetchApi.post('/actualizarutlparametro', body);
};

export default fetchActualizaUtlParametro;
