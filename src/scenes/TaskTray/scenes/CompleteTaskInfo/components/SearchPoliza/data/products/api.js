import * as fetchApi from 'services/api';

export function fetchProducts(body) {
  return fetchApi.postRimac('/lstproductos', body);
}
