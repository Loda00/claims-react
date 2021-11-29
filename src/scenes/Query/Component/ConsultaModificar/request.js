import { isEmpty } from 'lodash';

const setParamsToSendRequest = params => {
  const {
    indAccion,
    dataPoliza,
    dataSinister,
    ajustadoresFromReport,
    dataCertificate: { certificate: [primerCerti] = [] } = {},
    dataSinister: {
      idCase,
      idSecAjustador,
      ajustador: { codAjustador, emailAjustador, idUsuarioBPM }
    },
    form: { getFieldValue },
    datosInforme: { idInforme },
    numSiniestro
  } = params;

  // ---------General---------\\
  const { codEstadoSiniestro } = getFieldValue('siniestro');

  // ---------SectionDataPoliza---------\\
  const nuevoCorredor = (getFieldValue('nuevoCorredor') && getFieldValue('nuevoCorredor').terceroElegido) || undefined;
  const ejecutivoCorredor = getFieldValue('ejecutivoCorredor') || '';
  const emailCorredorPoliza = getFieldValue('emailCorredorPoliza') || '';

  const corredor = nuevoCorredor
    ? undefined
    : {
        operacion: 'U',
        numIdentificadorCli:
          (dataPoliza.poliza[0] && dataPoliza.poliza[0].corredor && dataPoliza.poliza[0].corredor.codCorredor) || null,
        nomEjecutivo: ejecutivoCorredor,
        rolCliente: 'INTERMEDIARIO',
        email: emailCorredorPoliza || dataPoliza.poliza[0].corredor.email
      };

  const direccionCorredor =
    (nuevoCorredor && nuevoCorredor.direccion && nuevoCorredor.direccion.filter(item => item.principal === 'X')[0]) ||
    undefined;

  const reqPoliza = {
    corredor: corredor || {
      operacion: (nuevoCorredor && 'N') || 'O',
      numIdentificadorCli: (nuevoCorredor && nuevoCorredor.codExterno) || '',
      razonSocial: (nuevoCorredor && nuevoCorredor.nomCompleto) || '',
      nombres: (nuevoCorredor && nuevoCorredor.nombre) || '',
      apePaterno: (nuevoCorredor && nuevoCorredor.apePaterno) || '',
      apeMaterno: (nuevoCorredor && nuevoCorredor.apeMaterno) || '',
      indTipoDocumento: (nuevoCorredor && nuevoCorredor.tipoDocId) || '',
      numDocumento: (nuevoCorredor && nuevoCorredor.numDocumento) || '',
      dscTipoDocumento: (nuevoCorredor && nuevoCorredor.dscTipoDocumento) || '',
      tipoDocumento: (nuevoCorredor && nuevoCorredor.tipoDocumento) || '',
      direccion:
        (direccionCorredor &&
          String(`${direccionCorredor.tipoVia} ${direccionCorredor.nombreVia} ${direccionCorredor.numeroVia}`)) ||
        '',
      dscPais: (direccionCorredor && direccionCorredor.pais) || '',
      dscDepartamento: (direccionCorredor && direccionCorredor.departamento) || '',
      dscProvincia: (direccionCorredor && direccionCorredor.provincia) || '',
      telefono: '',
      email: emailCorredorPoliza,
      rolCliente: 'INTERMEDIARIO',
      nomEjecutivo: ejecutivoCorredor
    }
  };

  // ---------SectionDataCertificate---------\\
  const nuevoAsegurado =
    (getFieldValue('nuevoAsegurado') && getFieldValue('nuevoAsegurado').terceroElegido) || undefined;

  const direccionAsegurado =
    (nuevoAsegurado &&
      nuevoAsegurado.direccion &&
      nuevoAsegurado.direccion.filter(item => item.principal === 'X')[0]) ||
    {};

  const { email: emailServerPrimerCerti } = primerCerti || {};
  const emailAseguradoCertificate =
    (!nuevoAsegurado && emailServerPrimerCerti) || (getFieldValue('emailAseguradoCertificate') || '');

  const reqCertificado = {
    asegurado: !nuevoAsegurado
      ? { operacion: 'O' }
      : {
          operacion: 'N',
          numIdentificadorCli: (nuevoAsegurado && nuevoAsegurado.codExterno) || '',
          razonSocial: (nuevoAsegurado && nuevoAsegurado.nomCompleto) || '',
          nombres: (nuevoAsegurado && nuevoAsegurado.nombre) || '',
          apePaterno: (nuevoAsegurado && nuevoAsegurado.apePaterno) || '',
          apeMaterno: (nuevoAsegurado && nuevoAsegurado.apeMaterno) || '',
          indTipoDocumento: (nuevoAsegurado && nuevoAsegurado.tipoDocId) || '',
          dscTipoDocumento: (nuevoAsegurado && nuevoAsegurado.dscTipoDocumento) || '',
          numDocumento: (nuevoAsegurado && nuevoAsegurado.numDocumento) || '',
          direccion:
            (direccionAsegurado &&
              String(
                `${direccionAsegurado.tipoVia} ${direccionAsegurado.nombreVia} ${direccionAsegurado.numeroVia}`
              )) ||
            '',
          dscPais: (direccionAsegurado && direccionAsegurado.pais) || '',
          dscDepartamento: (direccionAsegurado && direccionAsegurado.departamento) || '',
          dscProvincia: (direccionAsegurado && direccionAsegurado.provincia) || '',
          telefono: '',
          email: emailAseguradoCertificate,
          rolCliente: 'ASEGURADO',
          nomEjecutivo: '',
          tipoDocumento: (nuevoAsegurado && nuevoAsegurado.tipoDocumento) || ''
        }
  };

  // ---------SectionDataInforme---------\\
  const indRequiereAjustadorAnt = dataSinister.indReqAjustadorAnt;

  const ajustadorRequerido = getFieldValue('ajustadorRequerido') === 'S' ? 'S' : 'N';
  const indNuevoAjustador = getFieldValue('nuevoAjustador') === 'S' ? 'S' : 'N';
  const codigoNuevoAjustador = getFieldValue('ajustadorSeleccionado');

  const nuevoAjustador = ajustadoresFromReport.find(ajustador => ajustador.codAjustador === codigoNuevoAjustador) || {};
  const { emailAjustadorBPM: emailNuevoAjustadorBPM = '' } = nuevoAjustador;

  const mailAjustador = getFieldValue('emailNuevoAjustador') || '';
  const codigoMotivoAjustadorReq = getFieldValue('motivo') || '';
  const detalleRequiereAjustadorReq = getFieldValue('detalle') || '';
  const arrayIdiomas = getFieldValue('idiomaEspaniol') || [];

  let idiomaEspaniol = '';
  let idiomaIngles = '';
  if (!isEmpty(arrayIdiomas)) {
    if (arrayIdiomas.length === 2) {
      idiomaEspaniol = 'S';
      idiomaIngles = 'S';
    } else if (arrayIdiomas[0] === 'Español') {
      idiomaEspaniol = 'S';
      idiomaIngles = 'N';
    } else {
      idiomaEspaniol = 'N';
      idiomaIngles = 'S';
    }
  }

  let borrarMotivoYdetalle = false;
  if (indRequiereAjustadorAnt === ajustadorRequerido) {
    borrarMotivoYdetalle = true;
  }

  const reqInforme = {
    operacion: 'U',
    indRequiereAjustador: ajustadorRequerido,
    indRequiereAjustadorAnt,
    indReqNuevoAjustador: indNuevoAjustador,
    codReqAjustador: borrarMotivoYdetalle ? '' : codigoMotivoAjustadorReq,
    detReqAjustador: borrarMotivoYdetalle ? '' : detalleRequiereAjustadorReq,
    ajustador: {
      operacion: 'U',
      codAjustador,
      codNuevoAjustador: codigoNuevoAjustador,
      idAjustador: idSecAjustador,
      emailAjustador,
      emailNuevoAjustador: mailAjustador,
      idUsuarioBPM,
      indNuevoAjustador,
      emailNuevoAjustadorBPM
    },
    idInforme,
    indIdiomaIngles: idiomaIngles,
    indIdiomaEspaniol: idiomaEspaniol
  };

  const request = {
    idCase,
    numSiniestro,
    estadoSiniestro: codEstadoSiniestro,
    indGuardarCompletar: indAccion,
    poliza: reqPoliza,
    certificado: reqCertificado,
    informe: reqInforme
  };

  return request;
};

export const creaRequestDesdeProps = (indAccion, props, NO_ES_TAREA) => {
  const {
    idCargoBpm,
    numSiniestro,
    coaseguros,
    reaseguros,
    branches,
    dataPoliza,
    dataCertificate,
    dataSinister,
    userClaims,
    form,
    ajustadores,
    currentTask,
    datosInforme,
    ajustadoresFromReport,
    closingReasons: { closingReasons }
  } = props;
  const paramsParaRequest = {
    indAccion,
    idCargoBpm,
    numSiniestro,
    coaseguros,
    reaseguros,
    branches,
    dataPoliza,
    dataCertificate,
    dataSinister,
    userClaims,
    form,
    ajustadores,
    currentTask,
    datosInforme,
    closingReasons,
    ajustadoresFromReport,
    NO_ES_TAREA
  };

  if (!currentTask) {
    paramsParaRequest.currentTask = {};
    paramsParaRequest.currentTask.idTarea = '';
  }
  return setParamsToSendRequest(paramsParaRequest);
};

export default creaRequestDesdeProps;
