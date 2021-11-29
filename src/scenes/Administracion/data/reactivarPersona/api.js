import * as fetchApi from 'services/api';

const fetchReactivaPersona = body => {
  return fetchApi.post('/crearactualizarpersona', body);
};

export default fetchReactivaPersona;
