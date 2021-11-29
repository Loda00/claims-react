import * as fetchApi from 'services/api';

export function fetchPayments(body) {
  return fetchApi.post('/obtpagos', body);
}

export function maintainPayment(body) {
  return fetchApi.post('/mantenerpagos', body);
}

export function sendPayment(body) {
  return fetchApi.post('/procesarpago', body);
}
