import * as fetchApi from 'services/api';

const fetchListaPersona = body => {
  return fetchApi.post('/lstpersonas', body);
};

export default fetchListaPersona;
