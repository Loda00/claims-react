import * as fetchApi from 'services/api';

const fetchListaRoles = body => {
  return fetchApi.post('/obttipousuario', body);
};

export default fetchListaRoles;
