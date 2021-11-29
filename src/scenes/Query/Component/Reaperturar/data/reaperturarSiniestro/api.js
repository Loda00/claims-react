import * as fetchApi from 'services/api';
import { FORMAT_AUDITORIA } from 'constants/index';
import moment from 'moment';

export function fecthReaperturarSiniestro(body) {
  const actualDate = moment();
  body.auditoria.fechaTransaccion = moment(actualDate).format(FORMAT_AUDITORIA.FECHA);
  body.auditoria.horaTransaccion = moment(actualDate).format(FORMAT_AUDITORIA.HORA);
  return fetchApi.post('/reaperturarsiniestro', body);
}
