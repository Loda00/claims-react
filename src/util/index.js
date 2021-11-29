import { notification, message, Modal } from 'antd';
import moment from 'moment';
import currency from 'currency.js';
import download from 'downloadjs';
import { CONSTANTS_APP, MENSAJES_TAREAS, TAREAS, ROLES_USUARIOS } from 'constants/index';
import * as fetchApi from 'services/api';
import { fetch } from 'services/api/actions';
import * as uiActionCreators from 'services/ui/actions';

import * as typesActionCreators from 'services/types/actions';
import * as paymentsActionCreators from 'scenes/TaskTray/components/SectionPayments/data/payments/actions';

import * as coveragesAdjustersActionCreators from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/actions';
import * as coordenadasActionCreators from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/actions';
import * as dataPolizaActionCreatos from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/actions';
import * as dataCertificateActionCreatos from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/actions';
import * as dataSinisterActionCreators from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/actions';
import * as closingReasonsActioncreators from 'scenes/TaskTray/components/SectionDataSinister/data/closingReasons/actions';
import * as IncotermsActionCreators from 'scenes/TaskTray/components/SectionDataSinister/data/incoterms/actions';
import * as ShipmentNaturesActionCreators from 'scenes/TaskTray/components/SectionDataSinister/data/shipmentNatures/actions';
import * as documentSinisterCreator from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/action';
import * as bitacoraActionCreator from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/action';
import { fetchDatosInforme } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/action';
import { fetchMotivo } from 'scenes/TaskTray/components/SectionDataReport/data/motivo/action';
import { fetchMotivosRechazoSbs } from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazoSBS/action';
import { fetchMotivosRechazo } from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazo/action';

export const showErrorNotification = desc => {
  notification.error({
    message: 'Error de servicios',
    description: desc
  });
};

export const showSuccessMessage = desc => {
  message.success(desc, 2);
};

export const showErrorMessage = desc => {
  message.error(desc, 2);
};

export const showFirstError = field => {
  Modal.error({
    title: 'Error',
    content: field.errors[0].message
  });
};

export const showModalError = mensaje => {
  Modal.error({
    title: 'Error',
    content: mensaje
  });
};

export const mostrarModalSiniestroaPreventivo = () => {
  Modal.info({
    title: 'No puede realizar cambios',
    content: 'Debe guardar los cambios del siniestro convertido a normal'
  });
};

export const showWarningMessage = desc => {
  message.warning(desc);
};

export function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export function hasValues(fields) {
  return Object.keys(fields).some(function(field) {
    if (field === 'asegurado') {
      return typeof fields[field] !== 'undefined' && fields[field].terceroElegido;
    }
    return typeof fields[field] !== 'undefined';
    // && fields[field].length 0;
  });
}

export function getSafe(fn) {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
}

export function sortNumbers(a, b) {
  if (!a) {
    return -1;
  }

  if (!b) {
    return 1;
  }

  return a - b;
}

export function sortStrings(a, b) {
  if (!a) {
    return -1;
  }

  if (!b) {
    return 1;
  }

  return a.localeCompare(b);
}

export function sortDates(a, b, pattern) {
  if (!a) {
    return -1;
  }

  if (!b) {
    return 1;
  }
  const afec = moment(a, pattern);
  const bfec = moment(b, pattern);
  return afec - bfec;
}

export function formatDateCore(text) {
  const parsedDate = moment(text, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE);
  if (parsedDate.isValid()) {
    return parsedDate.format(CONSTANTS_APP.FORMAT_DATE);
  }
  return '';
}

export function formatDateBandeja(text) {
  const parsedDate = moment(text, CONSTANTS_APP.FORMAT_DATE_OUTPUT_SYN);
  if (parsedDate.isValid()) {
    return parsedDate.format(CONSTANTS_APP.FORMAT_DATE);
  }
  return '';
}

function isNumber(s) {
  return typeof s === 'number'
    ? true
    : typeof s === 'string'
    ? s.trim() === ''
      ? false
      : !isNaN(s)
    : (typeof s).match(/object|function/)
    ? false
    : !isNaN(s);
}

export function formatAmount(value) {
  return !isNumber(value) ? '' : currency(value).format();
}

export function isEmpty(str) {
  return !str || str.length === 0;
}

export function isNotEmpty(str) {
  return !isEmpty(str);
}

export function isArgumentsEmpty(...args) {
  return args.some(arg => isEmpty(arg));
}

export function hasEmpty(obj) {
  return Object.keys(obj).some(field => isEmpty(obj[field]));
}

// TODO: colocar aqui todos los reset de las llamadas a API relativas al siniestro
// para que la data se limpie y puedan popularse para un siniestro distinto ej. Ramos
// del siniestro. No poner poner aqui reset de data unica, como por ejemplo las listas de
// parámetros.
export async function reinicioServiciosAnalizarSiniestro(dispatch) {
  dispatch(dataPolizaActionCreatos.fetchPolizaReset());
  dispatch(dataCertificateActionCreatos.fetchCertificateReset());
  dispatch(dataSinisterActionCreators.fetchSinisterReset());
  dispatch(paymentsActionCreators.fetchPaymentsReset());
  dispatch(coordenadasActionCreators.fetchCoordenadasReset());
  dispatch(documentSinisterCreator.fetchDocumentsReset());
}

export async function llamarServiciosAnalizarSiniestro(
  dispatch,
  numSiniestro,
  idCaso,
  idTareaBitacora,
  tipoConfirmarGestion,
  idTarea
) {
  const siniestro = await dispatch(dataSinisterActionCreators.fetchDataSinister(numSiniestro, idTareaBitacora));

  const promisesSections = [];
  promisesSections.push(dispatch(fetchMotivosRechazoSbs('CRG_MOT_RECHAZO_SBS')));
  promisesSections.push(dispatch(fetchMotivosRechazo('CRG_MOT_RECHAZO')));
  const condicionDondeCargaPagos = tipoConfirmarGestion === 'R' && [TAREAS.CONFIRMAR_GESTION].includes(idTarea);
  if (!condicionDondeCargaPagos) {
    promisesSections.push(
      dispatch(
        paymentsActionCreators.fetchPayments({
          numCaso: numSiniestro,
          codProceso: idCaso,
          idTareaBitacora,
          tipoConfirmarGestion
        })
      )
    );
    promisesSections.push(dispatch(coordenadasActionCreators.fetchCoordenadas(numSiniestro)));
  }
  promisesSections.push(dispatch(fetchDatosInforme(numSiniestro)));
  promisesSections.push(dispatch(fetchMotivo()));
  promisesSections.push(
    dispatch(
      coveragesAdjustersActionCreators.fetchCoveragesAdjusters(
        numSiniestro,
        siniestro.data[0].idePoliza,
        siniestro.data[0].numCertificado,
        siniestro.data[0].idSiniestro,
        idCaso
      )
    )
  );

  promisesSections.push(dispatch(dataPolizaActionCreatos.fetchDataPoliza(numSiniestro)));
  promisesSections.push(dispatch(dataCertificateActionCreatos.fetchDataCertificate(numSiniestro)));
  promisesSections.push(dispatch(IncotermsActionCreators.fetchIncoterms('CRG_INCOTERM')));
  promisesSections.push(dispatch(ShipmentNaturesActionCreators.fetchShipmentNatures('CRG_TNATURALEZA_EMBARQUE')));
  promisesSections.push(dispatch(closingReasonsActioncreators.fetchClosingReasons('CRG_MOT_CIERRE')));

  const subTipoDoc = null;
  promisesSections.push(dispatch(documentSinisterCreator.fetchDocuments(numSiniestro, subTipoDoc)));

  promisesSections.push(dispatch(bitacoraActionCreator.fecthBitacora(numSiniestro)));

  promisesSections.push(dispatch(typesActionCreators.fetchParam('CRG_SYN_TAREAS')));

  promisesSections.push(dispatch(typesActionCreators.fetchParam('CRG_CFG_FRONT')));

  await Promise.all(promisesSections);
}

export const modalConfirmacionCompletarTarea = callback => {
  Modal.confirm({
    title: MENSAJES_TAREAS.CONFIRMAR,
    centered: true,
    okText: 'Si',
    cancelText: 'No',
    onOk: callback
  });
};

export const modalConfirmacionCompletarTareaAjustador = callback => {
  Modal.confirm({
    title: MENSAJES_TAREAS.CONFIRMAR_AJUSTADOR,
    centered: true,
    okText: 'Si',
    cancelText: 'No',
    onOk: callback
  });
};

export const modalConfirmacionReintentar = () => {
  Modal.info({
    title: 'Por favor, vuelva a intentarlo'
  });
};

export const modalConfirmacion = ({ cb, content, title, cancel }) => {
  Modal.confirm({
    title: title || '',
    content: content || '',
    centered: true,
    okText: 'Si',
    cancelText: 'No',
    onOk: cb,
    onCancel: () => {
      if (cancel) {
        cancel();
      }
    }
  });
};

export const modalWarning = ({ cb, content, title, cancel }) => {
  Modal.warning({
    title: title || '',
    content: content || '',
    centered: true,
    okText: 'Si',
    cancelText: 'No',
    onOk: cb,
    onCancel: () => {
      if (cancel) {
        cancel();
      }
    }
  });
};

export const modalInformacion = ({ cb, content, title }) => {
  Modal.info({
    title: title || '',
    content: content || '',
    okText: 'OK',
    centered: true,
    onOk: () => {
      if (cb) {
        cb();
      }
    }
  });
};

export const modalDocumentoCompletar = mensajeCuerpo => {
  Modal.warning({
    title: 'Documentos pendientes',
    content: mensajeCuerpo,
    okText: 'Aceptar'
  });
};

export const esUsuarioAjustador = userClaims => {
  return userClaims.roles.some(r => r.codTipo === ROLES_USUARIOS.AJUSTADOR);
};

export const esUsuarioPracticante = userClaims => {
  return userClaims.roles.some(r => r.codTipo === ROLES_USUARIOS.PRACTICANTE);
};

export const esUsuarioEjecutivo = userClaims => {
  return userClaims.roles.some(r => r.codTipo === ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO);
};

export const esUsuarioLegalOSalvamento = userClaims => {
  return userClaims.roles.some(r => r.codTipo === ROLES_USUARIOS.LEGAL || r.codTipo === ROLES_USUARIOS.SALVAMENTO);
};

export const esUsuarioLegalORecupero = userClaims => {
  return userClaims.roles.some(r => r.codTipo === ROLES_USUARIOS.LEGAL || r.codTipo === ROLES_USUARIOS.RECUPERO);
};

const fetchDescarga = body => {
  return fetchApi.post('/descargardocumento', body);
};

export const descargarDocumento = async (props, idDocumento) => {
  const { match, dispatch } = props || {};
  try {
    const docId = idDocumento || match.params.idDocumento;
    dispatch(uiActionCreators.switchLoader());
    const result = await dispatch(
      fetch(fetchDescarga, {
        docId
      })
    );
    const {
      data: [archivo]
    } = result;
    const { nombre, data, contentType } = archivo;
    dispatch(uiActionCreators.switchLoader());
    download(`data:${contentType};base64,${data}`, nombre, contentType);
  } catch (err) {
    dispatch(uiActionCreators.switchLoader());
    showErrorMessage('Error al descargar el documento');
  }
};
