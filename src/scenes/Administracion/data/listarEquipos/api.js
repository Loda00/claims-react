import * as fetchApi from 'services/api';

const fetchListaEquipos = body => {
  return fetchApi.post('/lstequipos', body);
};

export default fetchListaEquipos;
