import * as fetchApi from 'services/api';

const fetchObtienePersona = body => {
  return fetchApi.post('/mantenedorpersonas', body);
};

export default fetchObtienePersona;
