import { TAREAS, ESTADO_SINIESTRO } from 'constants/index';

/*
Modificar:
  flagModificar: booleano
Consulta:
  idTarea: undefined
*/
// SelectTipoSiniestro

const mostrarSelectTipoSiniestro = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO];
  if (tareasPermitidas.includes(idTarea) && esSiniestroPreventivo) {
    return true;
  }
  return false;
};

export const validacionSelectTipoSiniestro = {
  mostrarSelectTipoSiniestro
};

// DatosCargaMasiva
const mostrarDatosCargaMasiva = params => {
  const { indCargaMasiva, idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, undefined];
  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo && indCargaMasiva === 'PT') {
    return true;
  }
  return false;
};

export const validacionDatosCargaMasiva = {
  mostrarDatosCargaMasiva
};

// BotonEditarLugarSiniestro
const habilitarBotonEditarLugarSiniestro = params => {
  const { idTarea, esSiniestroPreventivo } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME,
    TAREAS.REVISAR_INFORME
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

export const validacionBotonEditarLugarSiniestro = {
  habilitarBotonEditarLugarSiniestro
};

// InputDescripcionSiniestro
const habilitarInputDescripcionSiniestro = params => {
  const { idTarea, esSiniestroPreventivo } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME,
    TAREAS.REVISAR_INFORME,
    // TAREAS.CONFIRMAR_GESTION,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

export const validacionInputDescripcionSiniestro = {
  habilitarInputDescripcionSiniestro
};

// CheckboxBurningCost
// Modidicacion - Fase III
const habilitarCheckboxBurningCost = params => {
  const { idTarea, esSiniestroPreventivo } = params;

  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarCheckboxBurningCost = params => {
  const { tipoFlujo, idTarea, indCargaMasiva, requiereAjustador } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  const esFlujoComplejo = tipoFlujo === 'C' || (tipoFlujo === 'S' && requiereAjustador);

  if (esFlujoComplejo && tareasPermitidas.includes(idTarea)) {
    if (indCargaMasiva !== 'CAT' && indCargaMasiva !== 'COA') {
      return true;
    }
  }
  return false;
};

export const validacionCheckboxBurningCost = {
  habilitarCheckboxBurningCost,
  mostrarCheckboxBurningCost
};

// CheckboxSalvamento
const habilitarCheckboxSalvamento = params => {
  const { idTarea, esAjustador, indSalvamentoAnt, esSiniestroPreventivo } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    if (esAjustador) {
      if (indSalvamentoAnt !== 'S') {
        return true;
      }
    } else {
      return true;
    }
  }

  return false;
};

const mostrarCheckboxSalvamento = params => {
  const { tipoFlujo, requiereAjustador } = params;

  const esFlujoComplejo = tipoFlujo === 'C' || (tipoFlujo === 'S' && requiereAjustador);

  if (esFlujoComplejo) {
    return true;
  }
  return false;
};

export const validacionCheckboxSalvamento = {
  habilitarCheckboxSalvamento,
  mostrarCheckboxSalvamento
};

// CheckboxRecupero
const habilitarCheckboxRecupero = params => {
  const { idTarea, esAjustador, indRecuperoAnt, esSiniestroPreventivo } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    if (esAjustador) {
      if (indRecuperoAnt !== 'S') {
        return true;
      }
    } else {
      return true;
    }
  }

  return false;
};

const mostrarCheckboxRecupero = params => {
  const { tipoFlujo, requiereAjustador } = params;

  const esFlujoComplejo = tipoFlujo === 'C' || (tipoFlujo === 'S' && requiereAjustador);

  if (esFlujoComplejo) {
    return true;
  }
  return false;
};

export const validacionCheckboxRecupero = {
  habilitarCheckboxRecupero,
  mostrarCheckboxRecupero
};

// RadioTercerosAfectados
const habilitarRadioTercerosAfectados = params => {
  const { idTarea, esSiniestroPreventivo, tipoFlujo, indCargaMasiva, codTipoSiniestro } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME,
    TAREAS.REVISAR_INFORME
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    if (tipoFlujo === 'C' && indCargaMasiva === 'CAT' && codTipoSiniestro === 'N') {
      return true;
    }
    return true;
  }
  return false;
};

export const validacionRadioTercerosAfectados = {
  habilitarRadioTercerosAfectados
};

// SeccionTransporte
const mostrarSeccionTransporte = params => {
  const {
    transporte,
    esPrimerRamoTransporte,
    idTarea,
    esSiniestroPreventivo,
    tipoFlujo,
    indCargaMasiva,
    codTipoSiniestro
  } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  if (tareasPermitidas.includes(idTarea) && indCargaMasiva !== 'CAT') {
    if (transporte && esPrimerRamoTransporte) {
      return true;
    }
  }

  return false;
};

export const validacionSeccionTransporte = {
  mostrarSeccionTransporte
};

// TextoMedioTransporte
const mostrarTextoMedioTransporte = params => {
  const { codProducto } = params;
  const productosPermitidos = ['3001', '3002', '3003'];

  if (productosPermitidos.includes(codProducto)) {
    return true;
  }
  return false;
};

export const validacionTextoMedioTransporte = {
  mostrarTextoMedioTransporte
};

// InputDatosTransporte
const requerirInputDatosTransporte = params => {
  const { idTarea, cerrarSiniestroValue, indCargaMasiva } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];
  if (tareasPermitidas.includes(idTarea) && !cerrarSiniestroValue && indCargaMasiva !== 'COA') {
    return true;
  }
  return false;
};

const habilitarInputDatosTransporte = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];
  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

export const validacionInputDatosTransporte = {
  requerirInputDatosTransporte,
  habilitarInputDatosTransporte
};

// CheckboxTrasbordos
const habilitarCheckboxTrasbordos = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

export const validacionCheckboxTrasbordos = {
  habilitarCheckboxTrasbordos
};

// BotonAgregarTrasbordo
const habilitarBotonAgregarTrasbordo = params => {
  const { esSiniestroPreventivo, indTrasbordo, idTarea } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];
  if (tareasPermitidas.includes(idTarea)) {
    if (indTrasbordo && !esSiniestroPreventivo) {
      return true;
    }
  }

  return false;
};

const mostrarBotonAgregarTrasbordo = params => {
  const { idTarea } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO
  ];
  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};
export const validacionBotonAgregarTrasbordo = {
  habilitarBotonAgregarTrasbordo,
  mostrarBotonAgregarTrasbordo
};

// GrillaTrasbordo
const mostrarGrillaTrasbordo = params => {
  const { idTarea, indTrasbordo, flagModificar } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];
  if ((tareasPermitidas.includes(idTarea) || flagModificar) && indTrasbordo) {
    return true;
  }

  return false;
};
export const validacionGrillaTrasbordo = {
  mostrarGrillaTrasbordo
};

// GrillaIncoterms
const mostrarGrillaIncoterms = params => {
  const { idTarea, codigoNaturalezaEmbarque, flagModificar } = params;
  const NaturalezaEmbarquePermitidos = ['IMP', 'EXP'];
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  if (
    (tareasPermitidas.includes(idTarea) || flagModificar) &&
    NaturalezaEmbarquePermitidos.includes(codigoNaturalezaEmbarque)
  ) {
    return true;
  }
  return false;
};
export const validacionGrillaIncoterms = {
  mostrarGrillaIncoterms
};

// SelectNaturalezaEmbarque
const requerirSelectNaturalezaEmbarque = params => {
  const { idTarea, cerrarSiniestroValue } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];
  if (tareasPermitidas.includes(idTarea) && !cerrarSiniestroValue) {
    return true;
  }

  return false;
};
const habilitarSelectNaturalezaEmbarque = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];
  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

export const validacionSelectNaturalezaEmbarque = {
  requerirSelectNaturalezaEmbarque,
  habilitarSelectNaturalezaEmbarque
};

// BotonAgregarIncoterms
const habilitarBotonAgregarIncoterms = params => {
  const { esSiniestroPreventivo, codigoNaturalezaEmbarque } = params;
  const NaturalezaEmbarquePermitidos = ['IMP', 'EXP'];

  if (NaturalezaEmbarquePermitidos.includes(codigoNaturalezaEmbarque) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarBotonAgregarIncoterms = params => {
  const { idTarea } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];
  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};

export const validacionBotonAgregarIncoterms = {
  habilitarBotonAgregarIncoterms,
  mostrarBotonAgregarIncoterms
};

// BotonOpcionGrillaTrasbordoIncoterms - [Eliminar - Modificar]
const mostrarOpcionGrillaTrasbordoIncoterms = params => {
  const { idTarea, esSiniestroPreventivo } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

export const validacionOpcionGrillaTrasbordoIncoterms = {
  mostrarOpcionGrillaTrasbordoIncoterms
};

// InputDatosTransporte3001
const requerirInputDatosTransporte3001 = params => {
  const { idTarea, cerrarSiniestroValue, indCargaMasiva } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !cerrarSiniestroValue && indCargaMasiva !== 'COA') {
    return true;
  }
  return false;
};
const habilitarInputDatosTransporte3001 = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarInputDatosTransporte3001 = params => {
  const { idTarea, codProducto, flagModificar } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && codProducto === '3001') {
    return true;
  }

  return false;
};
export const validacionInputDatosTransporte3001 = {
  requerirInputDatosTransporte3001,
  habilitarInputDatosTransporte3001,
  mostrarInputDatosTransporte3001
};

// SeccionCascoMaritimo
const requerirSeccionCascoMaritimo = params => {
  const { idTarea, cerrarSiniestroValue, indCargaMasiva } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !cerrarSiniestroValue && indCargaMasiva !== 'COA') {
    return true;
  }
  return false;
};

const habilitarSeccionCascoMaritimo = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarSeccionCascoMaritimo = params => {
  const {
    cascoMaritimo,
    esPrimerRamoCascoMaritimo,
    idTarea,
    esSiniestroPreventivo,
    tipoFlujo,
    indCargaMasiva,
    codTipoSiniestro
  } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  if (tareasPermitidas.includes(idTarea) && indCargaMasiva !== 'CAT') {
    if (cascoMaritimo && esPrimerRamoCascoMaritimo) {
      return true;
    }
  }

  return false;
};

export const validacionSeccionCascoMaritimo = {
  requerirSeccionCascoMaritimo,
  habilitarSeccionCascoMaritimo,
  mostrarSeccionCascoMaritimo
};

// SeccionAviacion
const requerirSeccionAviacion = params => {
  const { idTarea, cerrarSiniestroValue, indCargaMasiva } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !cerrarSiniestroValue && indCargaMasiva !== 'COA') {
    return true;
  }
  return false;
};

const habilitarSeccionAviacion = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarSeccionAviacion = params => {
  const {
    aviacion,
    esPrimerRamoAviacion,
    idTarea,
    esSiniestroPreventivo,
    tipoFlujo,
    indCargaMasiva,
    codTipoSiniestro
  } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  if (tareasPermitidas.includes(idTarea) && indCargaMasiva !== 'CAT') {
    if (aviacion && esPrimerRamoAviacion) {
      return true;
    }
  }

  return false;
};

export const validacionSeccionAviacion = {
  requerirSeccionAviacion,
  habilitarSeccionAviacion,
  mostrarSeccionAviacion
};

// BotonAgregarConcepto
const habilitarBotonAgregarConcepto = params => {
  const { idTarea, esSiniestroPreventivo } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME
  ];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarBotonAgregarConcepto = params => {
  const { idTarea } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR
  ];
  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};

export const validacionBotonAgregarConcepto = {
  habilitarBotonAgregarConcepto,
  mostrarBotonAgregarConcepto
};

// RadioOtrosConceptos
const habilitarRadioOtrosConceptos = params => {
  const {
    idTarea,
    esSiniestroPreventivo,
    codEstadoSiniestro,
    ajustadorRequerido,
    nuevoAjustador,
    informeFinal,
    record,
    pagosAjustador = [],
    pagosOtrosConceptos = []
  } = params;

  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  const matchAjustador = pagosAjustador.some(
    pagoAjustador => pagoAjustador.codRamo === record.codRamo && pagoAjustador.codConcepto === record.codConcepto
  );
  const matchConcepto = pagosOtrosConceptos.some(
    concepto => concepto.codRamo === record.codRamo && concepto.codConcepto === record.codConcepto
  );

  const liquidarRevisarInformeFinal =
    codEstadoSiniestro === ESTADO_SINIESTRO.INFORME_APROBADO &&
    ajustadorRequerido === 'S' &&
    nuevoAjustador !== 'S' &&
    informeFinal === 'S';

  const liquidarAnalizarSiniestro =
    codEstadoSiniestro === ESTADO_SINIESTRO.ANALIZAR_SINIESTRO_COMPLETADO && ajustadorRequerido === 'N';

  if (!esSiniestroPreventivo && (liquidarRevisarInformeFinal || liquidarAnalizarSiniestro)) {
    if (record.mtoTotalPagos === 0) {
      return true;
    }

    if (record.codConcepto === '001') {
      if (matchAjustador) {
        return true;
      }
    } else if (matchConcepto) {
      return true;
    }
  }

  if (!esSiniestroPreventivo && tareasPermitidas.includes(idTarea)) {
    return true;
  }

  return false;
};

const mostrarRadioOtrosConceptos = params => {
  const { idTarea } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.REVISAR_PAGO_EJECUTIVO
  ];
  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};

export const validacionRadioOtrosConceptos = {
  habilitarRadioOtrosConceptos,
  mostrarRadioOtrosConceptos
};

// BotonAnularConcepto
const habilitarBotonAnularConcepto = params => {
  const { idTarea, esSiniestroPreventivo, rowSelected } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.REVISAR_PAGO_EJECUTIVO
  ];
  if (tareasPermitidas.includes(idTarea) && rowSelected && !esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarBotonAnularConcepto = params => {
  const { idTarea } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    TAREAS.REVISAR_PAGO_AJUSTADOR
  ];

  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }

  return false;
};
export const validacionBotonAnularConcepto = {
  habilitarBotonAnularConcepto,
  mostrarBotonAnularConcepto
};

// EnlaceModificarConcepto
const habilitarEnlaceModificarConcepto = params => {
  const { record, idTarea, flagModificar, pagosAjustador, pagosOtrosConceptos, esSiniestroPreventivo } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME
  ];

  const tareasFiltrarConcepto = [TAREAS.REVISAR_PAGO_EJECUTIVO, TAREAS.REVISAR_PAGO_AJUSTADOR];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && !esSiniestroPreventivo) {
    return true;
  }

  if (tareasFiltrarConcepto.includes(idTarea)) {
    const matchAjustador = pagosAjustador.some(
      pagoAjustador => pagoAjustador.codRamo === record.codRamo && pagoAjustador.codConcepto === record.codConcepto
    );
    const matchConcepto = pagosOtrosConceptos.some(
      concepto => concepto.codRamo === record.codRamo && concepto.codConcepto === record.codConcepto
    );

    if (record.codConcepto === '001') {
      if (matchAjustador) {
        return true;
      }
    } else if (matchConcepto) {
      return true;
    }
  }
  return false;
};
export const validacionEnlaceModificarConcepto = {
  habilitarEnlaceModificarConcepto
};

// Validar Si se muestra en consulta para un siniestro cerrado.
// CheckboxCerrarSiniestro
const mostrarCheckboxCerrarSiniestro = params => {
  const { idTarea } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};

const habilitarCheckboxCerrarSiniestro = params => {
  const { idTarea } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};

export const validacionCheckboxCerrarSiniestro = {
  mostrarCheckboxCerrarSiniestro,
  habilitarCheckboxCerrarSiniestro
};

// SelectMotivoCierre
const requerirSelectMotivoCierre = params => {
  const { cerrarSiniestroValue } = params;

  if (cerrarSiniestroValue) {
    return true;
  }
  return false;
};
const mostrarSelectMotivoCierre = params => {
  const { idTarea, cerrarSiniestroValue } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.ADJUNTAR_CARGO_DE_RECHAZO,
    undefined
  ];

  if (cerrarSiniestroValue && tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};

const habilitarSelectMotivoCierre = params => {
  const { idTarea } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];
  if (tareasPermitidas.includes(idTarea)) {
    return true;
  }
  return false;
};

export const validacionSelectMotivoCierre = {
  requerirSelectMotivoCierre,
  mostrarSelectMotivoCierre,
  habilitarSelectMotivoCierre
};
