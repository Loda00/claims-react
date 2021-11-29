import * as fetchApi from 'services/api';

export function takeTask(data) {
  return fetchApi.post('/asignartarea', data);
}

export function guardarSiniestro(data) {
  return fetchApi.post('/guardartarea', data);
}

export function completeTask(data) {
  return fetchApi.post('/completartarea', data);
}

export function modificarSiniestro(data) {
  return fetchApi.post('/modificarsiniestro', data);
}
