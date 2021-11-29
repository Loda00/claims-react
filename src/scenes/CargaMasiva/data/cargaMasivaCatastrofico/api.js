import * as fetchApi from 'services/api';

export const fetchCargaMasiva = body => {
  return fetchApi.post('/guardarcmcatastrofico', body);
};
