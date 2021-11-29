import * as fetchApi from 'services/api';

const fetchListaCargo = body => {
  return fetchApi.post('/lstcargos', body);
};

export default fetchListaCargo;
