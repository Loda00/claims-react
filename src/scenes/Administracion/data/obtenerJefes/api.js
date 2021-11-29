import * as fetchApi from 'services/api';

const fetchObtieneJefe = body => {
  return fetchApi.post('/mantenedorpersonas', body);
};

export default fetchObtieneJefe;
