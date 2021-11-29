import * as fetchApi from 'services/api';

const fetchListaReemplazos = body => {
  return fetchApi.post('/mantenedorpersonas', body);
};

export default fetchListaReemplazos;
