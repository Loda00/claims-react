import * as fetchApi from 'services/api';

const fetchActualizaPersona = body => {
  return fetchApi.post('/crearactualizarpersona', body);
};

export default fetchActualizaPersona;
