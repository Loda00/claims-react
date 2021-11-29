import moment from 'moment';
import { isEmpty } from 'lodash';
// import currency from 'currency.js';
import { TAREAS } from 'constants/index';
// import { ValidationMessage } from 'util/validation';

const setParamsToSendRequest = params => {
  const {
    indAccion,
    idCargoBpm,
    numSiniestro,
    coaseguros,
    reaseguros,
    branches,
    dataPoliza,
    closingReasons,
    dataCertificate: { certificate: [primerCerti] = [] } = {},
    dataSinister,
    dataSinister: {
      indRecuperoAnt,
      indSalvamentoAnt,
      indReqAjustador,
      ajustador: { codAjustador, emailAjustador, idUsuarioBPM, emailAjustadorBPM },
      idSecAjustador,
      indCargaMasiva,
      indReservaCoasAprobada
    },
    userClaims: { codTipo },
    form: { getFieldValue },
    currentTask: { idTarea, codTarea, idCaso, idTareaBitacora, nomTarea },
    datosInforme: { idInforme, fechaRecepcionUltimoDoc, indInformeFinal: indInformeFinalAnt },
    NO_ES_TAREA,
    // ajustadores,
    ajustadoresFromReport
  } = params;

  const {
    ANALIZAR_SINIESTRO,
    GENERAR_INFORME,
    GENERAR_INFORME_BASICO,
    REVISAR_INFORME,
    REVISAR_INFORME_BASICO
  } = TAREAS;

  const datosDelInforme = [
    ANALIZAR_SINIESTRO,
    GENERAR_INFORME,
    GENERAR_INFORME_BASICO,
    REVISAR_INFORME,
    REVISAR_INFORME_BASICO,
    NO_ES_TAREA
  ];

  // ---------SectionDataPoliza---------\\
  const nuevoCorredor = (getFieldValue('nuevoCorredor') && getFieldValue('nuevoCorredor').terceroElegido) || undefined;
  const ejecutivoCorredor = getFieldValue('ejecutivoCorredor') || '';
  const emailCorredorPoliza = getFieldValue('emailCorredorPoliza');

  const { indNotifCorredor } = dataPoliza.poliza[0] || {};
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
  const idPoliza = (getFieldValue('poliza') || {}).idPoliza || '';
  const indNotifReaCoa = (getFieldValue('poliza') || {}).indNotifReaCoa || '';

  // Coaseguros
  const lstCoaseguros = [];
  coaseguros.forEach(item => {
    lstCoaseguros.push({
      idCoasegurador: item.idCoaseguro,
      email: getFieldValue(String(`coaseguro${item.idCoaseguro}`)) || ''
    });
  });
  // Reaseguros
  const lstReaseguros = [];
  const reasegurosFiltrados = [];
  const ramosSiniestro = [];
  const { ramosCoberturas = [] } = getFieldValue('dataRamosCoberturas') || {};
  ramosCoberturas.forEach(ramo => {
    ramosSiniestro.push(ramo.codRamo);
  });
  reaseguros.forEach(rea => {
    if (ramosSiniestro.includes(rea.codRamo)) {
      reasegurosFiltrados.push(rea);
    }
  });
  reasegurosFiltrados.forEach(item => {
    lstReaseguros.push({
      idReasegurador: item.idReasegurador,
      email: getFieldValue(String(`reaseguro${item.idReasegurador}`)) || '',
      idRamo: branches.filter(ramo => ramo.codRamo === item.codRamo)[0].secRamo || null
    });
  });

  const reqPoliza = {
    idPoliza,
    indNotCoaRea: indNotifReaCoa || 'N',
    indNotifCorredor,
    corredor: corredor || {
      operacion: (nuevoCorredor && 'N') || '',
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
    },
    coaseguros: lstCoaseguros,
    reaseguros: lstReaseguros
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
  const actualizarSoloCorreoAsegurado =
    !nuevoAsegurado && !emailServerPrimerCerti && getFieldValue('emailAseguradoCertificate');

  const reqCertificado = {
    asegurado: {
      operacion: (nuevoAsegurado && 'N') || 'O',
      numIdentificadorCli: (nuevoAsegurado && nuevoAsegurado.codExterno) || '',
      razonSocial: (nuevoAsegurado && nuevoAsegurado.nomCompleto) || '',
      nombres: (nuevoAsegurado && nuevoAsegurado.nombre) || '',
      actualizaSoloCorreo: actualizarSoloCorreoAsegurado ? 'S' : 'N',
      apePaterno: (nuevoAsegurado && nuevoAsegurado.apePaterno) || '',
      apeMaterno: (nuevoAsegurado && nuevoAsegurado.apeMaterno) || '',
      indTipoDocumento: (nuevoAsegurado && nuevoAsegurado.tipoDocId) || '',
      dscTipoDocumento: (nuevoAsegurado && nuevoAsegurado.dscTipoDocumento) || '',
      numDocumento: (nuevoAsegurado && nuevoAsegurado.numDocumento) || '',
      direccion:
        (direccionAsegurado &&
          String(`${direccionAsegurado.tipoVia} ${direccionAsegurado.nombreVia} ${direccionAsegurado.numeroVia}`)) ||
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

  // -----------------------------------\\
  // ---------SectionDataSinister---------\\
  const { ubicacionModificada, numPlanillaCoaseguro } = getFieldValue('siniestro');
  const indNotifPreventivo = (dataSinister && dataSinister.indNotifPreventivo) || '';
  const tipoSiniestro = getFieldValue('tipoSiniestro') || 'N';
  const tipoSiniestroAnt = dataSinister && dataSinister.codTipoSiniestroAnt;
  const tipoFlujo = (dataSinister && dataSinister.tipoFlujo) || '';
  const canal = (dataSinister && dataSinister.canal) || '';
  const indTercerAfectados = (getFieldValue('indTercerAfectados') && 'S') || 'N';
  const direccion = getFieldValue('direccion') || null;
  const indPrevencionFraude = getFieldValue('indPrevencionFraude') ? 'S' : 'N';
  const indBurningCost = getFieldValue('indBurningCost') ? 'S' : 'N';
  const indRecupero = getFieldValue('indRecupero') ? 'S' : 'N';
  const indSalvamento = getFieldValue('indSalvamento') ? 'S' : 'N';
  const descripcionSiniestro = getFieldValue('descripcionSiniestro') || '';
  // Transporte
  const idMedioTransporte =
    (dataSinister && dataSinister.transporte && dataSinister.transporte.idMedioTransporte) || null;
  const { idSiniestroAX = null } = dataSinister;
  const idCascoMaritimo = getFieldValue('idCascoMaritimo') || null;
  const idAviacion = getFieldValue('idAviacion') || null;
  const medioTransporte = (dataSinister && dataSinister.transporte && dataSinister.transporte.medioTransporte) || null;
  const nombretransporte = getFieldValue('nombretransporte') || '';
  const lugarEmbarque = getFieldValue('lugarEmbarque') || '';
  const fechaEmbarque =
    (getFieldValue('fechaEmbarque') &&
      moment(getFieldValue('fechaEmbarque'))
        .format()
        .split('T')[0]) ||
    null;
  const lugarDescarga = getFieldValue('lugarDescarga') || '';
  const fechaLlegada =
    (getFieldValue('fechaLlegada') &&
      moment(getFieldValue('fechaLlegada'))
        .format()
        .split('T')[0]) ||
    null;
  const trasbordos = getFieldValue('trasbordos') || null;

  let lstTrasbordos = (trasbordos && trasbordos.trasbordos) || []; // Transformar a formato
  lstTrasbordos = lstTrasbordos.map(item => {
    return {
      idTranspTransbordo: item.idTrasbordo || null,
      descripcion: item.nombre,
      lugarTrasbordo: item.lugar,
      operacion: item.action || 'O'
    };
  });
  const indTrasbordos = (getFieldValue('trasbordos') || {}).indTrasbordo ? 'S' : 'N';

  const incoterms = getFieldValue('incoterms') || null;

  const naturalezaEmbarque = (incoterms && incoterms.codigoNaturalezaEmbarque) || '';
  const esNaturalezaEmbarqueNacional = naturalezaEmbarque === 'NAC';
  let lstIcoterms = (incoterms && incoterms.incoterms) || [];
  lstIcoterms = lstIcoterms.map(incoterm =>
    Object.assign(
      incoterm,
      { operacion: incoterm.action || 'O' },
      { idIcoterm: incoterm.key || '' },
      { monto: parseFloat(incoterm.valor) || 0 }
    )
  );
  // Si es Nacional, eliminar todos los incoterms registrados para ese siniestro
  if (esNaturalezaEmbarqueNacional) {
    lstIcoterms = lstIcoterms
      .filter(incoterm => !!incoterm.idIcoterm)
      .map(incoterm => Object.assign(incoterm, { operacion: 'D' }));
  }

  const nombreEmpresaTransporte = getFieldValue('nombreEmpresaTransporte') || '';
  const nombreConductor = getFieldValue('nombreConductor') || '';
  const placaImoMatricula = getFieldValue('placaImoMatricula') || '';
  const tipoMercaderia = getFieldValue('tipoMercaderia') || '';
  const fechaInspeccion =
    (getFieldValue('fechaInspeccion') &&
      moment(getFieldValue('fechaInspeccion'))
        .format()
        .split('T')[0]) ||
    null;
  // CascoMaritimo
  const nombreEmbarcacion = getFieldValue('nombreEmbarcacion') || '';
  const pi = getFieldValue('pi') || '';
  const imo = getFieldValue('imo') || '';
  // Aviacion
  const nombreAerolinea = getFieldValue('nombreAerolinea') || '';
  const matriculaAeronave = getFieldValue('matriculaAeronave') || '';
  const numeroVuelo = getFieldValue('numeroVuelo') || '';
  // CierreSiniestro
  const indCerrarSiniestro = (getFieldValue('indCerrarSiniestro') && 'S') || 'N';
  const indTransporte = (dataSinister && dataSinister.transporte) || null;
  const indCascoMaritimo = (dataSinister && dataSinister.cascoMaritimo) || null;
  const indAviacion = (dataSinister && dataSinister.aviacion) || null;
  const detalle = getFieldValue('detalle') || '';
  const codMotivoCierre = getFieldValue('codMotivoCierre') || '';
  const dscMotivoCierre =
    (codMotivoCierre && (closingReasons.filter(reason => reason.valor === codMotivoCierre)[0] || {}).descripcion) || '';
  const reqSiniestro = {
    canal,
    numSiniestro,
    idSiniestroAX,
    indCargaMasiva,
    tipoSiniestro,
    tipoSiniestroAnt,
    tipoFlujo,
    indNotifPreventivo,
    numPlanillaCoaseguro,
    ubicacion: {
      operacion: ubicacionModificada ? 'U' : 'O',
      codDepartamento: (direccion && direccion.codEstado) || '',
      codProvincia: (direccion && direccion.codCiudad) || '',
      codDistrito: (direccion && direccion.codMunicipio) || '',
      direccion: (direccion && direccion.direc) || '',
      dscDepartamento: (direccion && direccion.descEstado) || '',
      dscProvincia: (direccion && direccion.descCiudad) || '',
      dscDistrito: (direccion && direccion.descMunicipio) || ''
    },
    bienAfectado: descripcionSiniestro,
    indTercerAfectado: indTercerAfectados,
    indBurningcost: indBurningCost,
    indRecupero,
    indRecuperoAnt,
    indSalvamento,
    indSalvamentoAnt,
    indPrevencionFraude,
    rolUsuarioSalvRec: codTipo,
    transporte:
      indTransporte === null
        ? { operacion: 'O' }
        : {
            operacion: (idMedioTransporte && 'U') || 'N',
            idInspeccion: idMedioTransporte,
            dscMedioTransporte: medioTransporte,
            nombreTransporteOriginal: nombretransporte,
            lugarEmbarque,
            fechaEmbarque,
            lugarDescargo: lugarDescarga,
            fechaLlegada,
            indTrasbordo: indTrasbordos,
            transportesTrasbordo: lstTrasbordos,
            listaIcoterms: lstIcoterms,
            empresaTransporte: nombreEmpresaTransporte,
            nombreConductor,
            placa: placaImoMatricula,
            tipoMercaderia,
            codNaturalezaEMB: naturalezaEmbarque,
            dscContenido: '', // No se manda desde el Front
            fechaInspeccion
          },
    cascoMaritimo: {
      operacion: indCascoMaritimo === null ? 'O' : (idCascoMaritimo && 'U') || 'N',
      idCascoMaritimo: idCascoMaritimo || null,
      nombreEmbarcacion,
      pi,
      imo
    },
    aviacion: {
      operacion: indAviacion === null ? 'O' : (idAviacion && 'U') || 'N',
      idAviacion: idAviacion || null,
      nombreAerolinea,
      matriculaAeronave,
      numeroVuelo
    },
    indCerrarSiniestro,
    motivoCierre: codMotivoCierre,
    dscMotivoCierre,
    detCambioTipoFlujo: detalle,
    indRegCoaseguro: coaseguros.length > 0 ? 'S' : 'N',
    indRegReaseguro: reaseguros.length > 0 ? 'S' : 'N',
    indReservaCoasAprobada
  };

  // ---------SectionDataInforme---------\\
  const tareasESDatosInforme = [ANALIZAR_SINIESTRO, REVISAR_INFORME, REVISAR_INFORME_BASICO];
  const indRequiereAjustadorAnt = dataSinister.indReqAjustadorAnt;

  const ajustadorRequerido = getFieldValue('ajustadorRequerido') === 'S' ? 'S' : 'N';
  const indNuevoAjustador = getFieldValue('nuevoAjustador') === 'S' ? 'S' : 'N';
  const codigoNuevoAjustador = getFieldValue('ajustadorSeleccionado') || '';

  const emailNuevoAjustadorBPM = ajustadoresFromReport.find(
    ajustador => ajustador.codAjustador === codigoNuevoAjustador
  );

  const indSolInformeBasico = getFieldValue('solicitarInformeBasico') === 'S' ? 'S' : 'N';

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

  const nroReferenciaAjustador = getFieldValue('nroPreferenciaAjustador') || '';
  const ajustadorEncargado = getFieldValue('ajustadorEncargado') || '';

  const fechaEnvio =
    indAccion === 'C' &&
    (GENERAR_INFORME === idTarea || GENERAR_INFORME_BASICO === idTarea) &&
    getFieldValue('fechaEnvio')
      ? moment(getFieldValue('fechaEnvio'))
          .format()
          .split('T')[0]
      : '';

  const fechaDeInspeccion = getFieldValue('fechaInspeccionInforme')
    ? moment(getFieldValue('fechaInspeccionInforme'))
        .format()
        .split('T')[0]
    : '';

  const lugarInspeccion = getFieldValue('lugarInspeccion') || '';
  const situacionActual = getFieldValue('situacionActual') || '';
  const personaEntrevistada = getFieldValue('personaEntrevistada') || '';
  const notaInforme = getFieldValue('notaInforme') || '';
  const informeFinal = getFieldValue('informeFinal') === 'S' ? 'S' : 'N';
  const documentosCompletos = getFieldValue('documentosCompletos') ? 'S' : 'N';
  const fechaRecUltimoDoc =
    getFieldValue('fechaRecepcion') && (GENERAR_INFORME === idTarea || GENERAR_INFORME_BASICO === idTarea)
      ? moment(getFieldValue('fechaRecepcion'))
          .format()
          .split('T')[0]
      : null;

  const cambioANoIndInformeFinal =
    informeFinal === 'N' && GENERAR_INFORME_BASICO === idTarea && indInformeFinalAnt === 'S';

  let borrarMotivoYdetalle = false;
  if (indRequiereAjustadorAnt === ajustadorRequerido) {
    borrarMotivoYdetalle = true;
  }

  let reqInforme;

  if (idTarea === REVISAR_INFORME_BASICO || idTarea === REVISAR_INFORME) {
    reqInforme = {
      operacion: datosDelInforme.includes(idTarea) ? 'U' : 'O',
      indRequiereAjustador: tareasESDatosInforme.includes(idTarea) ? ajustadorRequerido : indReqAjustador,
      indRequiereAjustadorAnt,
      indReqNuevoAjustador: indNuevoAjustador,
      codReqAjustador: borrarMotivoYdetalle ? '' : codigoMotivoAjustadorReq,
      detReqAjustador: borrarMotivoYdetalle ? '' : detalleRequiereAjustadorReq,
      ajustador: {
        operacion: datosDelInforme.includes(idTarea) ? 'U' : 'O',
        codAjustador,
        codNuevoAjustador: indNuevoAjustador === 'S' ? codigoNuevoAjustador : '',
        idAjustador: idSecAjustador,
        emailAjustador,
        emailNuevoAjustador: indNuevoAjustador === 'S' ? mailAjustador : '',
        indSolInformeBasico: idTarea === REVISAR_INFORME_BASICO ? indSolInformeBasico : null,
        ajustadorEncargado,
        nroReferencia: nroReferenciaAjustador,
        idUsuarioBPM,
        emailAjustadorBPM,
        emailNuevoAjustadorBPM: !isEmpty(emailNuevoAjustadorBPM) && emailNuevoAjustadorBPM.emailAjustadorBPM
      },
      idInforme,
      indInformeBasico: idTarea === REVISAR_INFORME_BASICO ? indSolInformeBasico : null,
      indIdiomaIngles: idiomaIngles,
      indIdiomaEspaniol: idiomaEspaniol,
      fechaInspeccion: fechaDeInspeccion,
      lugarInspeccion,
      nombrePersonaEntrevistada: personaEntrevistada,
      situacionActualSiniestro: situacionActual,
      notasInforme: notaInforme,
      indDocCompletos: documentosCompletos,
      fecUltimoDoc: fechaRecepcionUltimoDoc,
      indInformeFinal: informeFinal,
      fechaEnvio: '',
      cambioANoIndInformeFinal
    };
  } else {
    reqInforme = {
      operacion: datosDelInforme.includes(idTarea) ? 'U' : 'O',
      indRequiereAjustador: tareasESDatosInforme.includes(idTarea) ? ajustadorRequerido : indReqAjustador,
      indRequiereAjustadorAnt,
      indReqNuevoAjustador: indNuevoAjustador,
      codReqAjustador: borrarMotivoYdetalle ? '' : codigoMotivoAjustadorReq,
      detReqAjustador: borrarMotivoYdetalle ? '' : detalleRequiereAjustadorReq,
      ajustador: {
        operacion: datosDelInforme.includes(idTarea) ? 'U' : 'O',
        codAjustador: codigoNuevoAjustador || codAjustador,
        idAjustador: idSecAjustador,
        emailAjustador: mailAjustador || emailAjustador,
        ajustadorEncargado,
        nroReferencia: nroReferenciaAjustador,
        emailAjustadorBPM,
        emailNuevoAjustadorBPM: !isEmpty(emailNuevoAjustadorBPM) && emailNuevoAjustadorBPM.emailAjustadorBPM
      },
      idInforme,
      indInformeBasico: null,
      indIdiomaIngles: idiomaIngles,
      indIdiomaEspaniol: idiomaEspaniol,
      fechaInspeccion: fechaDeInspeccion,
      lugarInspeccion,
      nombrePersonaEntrevistada: personaEntrevistada,
      situacionActualSiniestro: situacionActual,
      notasInforme: notaInforme,
      indDocCompletos: documentosCompletos,
      fecUltimoDoc: fechaRecUltimoDoc || null,
      indInformeFinal: informeFinal,
      fechaEnvio:
        indAccion === 'C' && (idTarea === GENERAR_INFORME_BASICO || idTarea === GENERAR_INFORME) ? fechaEnvio : '',
      cambioANoIndInformeFinal
    };
  }

  if (idTarea === ANALIZAR_SINIESTRO) {
    reqInforme.ajustador.emailAjustadorBPM =
      indNuevoAjustador === 'S' ? emailNuevoAjustadorBPM.emailAjustadorBPM : emailAjustadorBPM;
  }

  // ---------SectionUploadDocuments---------\\

  // ---------SectionBitacora---------\\
  const observacion = getFieldValue('observaciones') || '';
  const bitacora = {
    operacion: 'U',
    idBitacoraTarea: idTareaBitacora,
    observacionBitacora: observacion
  };

  // Salida
  return {
    idTarea: String(idTarea),
    nomTarea,
    codTarea,
    indGuardarCompletar: indAccion,
    idCase: idCaso,
    idCargoBpm,
    poliza: reqPoliza,
    certificado: reqCertificado,
    siniestro: reqSiniestro,
    informe: reqInforme,
    bitacora
  };
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
    closingReasons: { closingReasons },
    ajustadoresFromReport
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
    NO_ES_TAREA,
    ajustadoresFromReport
  };

  if (!currentTask) {
    paramsParaRequest.currentTask = {};
    paramsParaRequest.currentTask.idTarea = '';
  }
  return setParamsToSendRequest(paramsParaRequest);
};

export default creaRequestDesdeProps;
