import * as fetchApi from 'services/api';

const fetchObtieneReemplazo = body => {
  return fetchApi.post('/mantenedorpersonas', body);
};

export default fetchObtieneReemplazo;
