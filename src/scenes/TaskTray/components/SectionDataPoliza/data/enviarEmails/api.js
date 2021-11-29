import * as fetchApi from 'services/api';

export function enviarEmails(body) {
  return fetchApi.post('/enviarnotificacionseguro', body);
}
