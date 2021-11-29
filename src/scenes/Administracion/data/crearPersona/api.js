import * as fetchApi from 'services/api';

const fetchCreaPersona = body => {
  return fetchApi.post('/crearactualizarpersona', body);
};

export default fetchCreaPersona;
