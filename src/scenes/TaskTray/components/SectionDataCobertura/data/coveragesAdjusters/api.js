import * as fetchApi from 'services/api';

export function pcoveragesAdjusters(body) {
  return fetchApi.post('/obtramoscoberturasajustadores', body);
}
