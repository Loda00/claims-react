import * as fetchApi from 'services/api';

const fetchActualizaPersonaAusencia = body => {
  return fetchApi.post('/mantenedorausencias', body);
};

export default fetchActualizaPersonaAusencia;
