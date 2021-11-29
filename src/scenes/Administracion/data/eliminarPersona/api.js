import * as fetchApi from 'services/api';

const fetchEliminaPersona = body => {
  return fetchApi.post('/crearactualizarpersona', body);
};

export default fetchEliminaPersona;
