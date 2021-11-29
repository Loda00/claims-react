import { TAREAS } from 'constants/index';

const habilitarBotonReemplazarCorredor = params => {
  const { esSiniestroPreventivo, cerrarSiniestroValue } = params;
  if (!esSiniestroPreventivo && !cerrarSiniestroValue) {
    return true;
  }
  return false;
};

const mostrarBotonReemplazarCorredor = params => {
  const { idTarea, flagModificar, tienePoliza } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && tienePoliza) {
    return true;
  }
  return false;
};

export const validacionBotonReemplazarCorredor = {
  habilitarBotonReemplazarCorredor,
  mostrarBotonReemplazarCorredor
};

// Input EjecutivoCorredor
const habilitarInputEjecutivoCorredor = params => {
  const { idTarea, esSiniestroPreventivo, cerrarSiniestroValue } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.GENERAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.GENERAR_INFORME,
    TAREAS.REVISAR_INFORME
  ];
  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo && !cerrarSiniestroValue) {
    return true;
  }
  return false;
};

export const validacionInputEjecutivoCorredor = {
  habilitarInputEjecutivoCorredor
};

// Input EmailCorredor
const requerirInputEmailCorredor = params => {
  const { idTarea, flagModificar, indCargaMasiva, cerrarSiniestroValue } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && !cerrarSiniestroValue) {
    if (indCargaMasiva === 'COA') {
      return false;
    }
    return true;
  }

  return false;
};

const habilitarInputEmailCorredor = params => {
  const { idTarea, flagModificar, cerrarSiniestroValue } = params;

  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && !cerrarSiniestroValue) {
    return true;
  }
  return false;
};

const mostrarInputEmailCorredor = params => {
  const { indNotifCorredor, idTarea, nuevoCorredor, flagModificar, emailCorredor } = params;

  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  const mostrarConsulta = flagModificar && nuevoCorredor;

  const mostrarFlujoComplejo = tareasPermitidas.includes(idTarea) && (indNotifCorredor === 'N' || !emailCorredor);

  if (mostrarConsulta || mostrarFlujoComplejo || nuevoCorredor) {
    return true;
  }
  return false;
};

export const validacionInputEmailCorredor = {
  requerirInputEmailCorredor,
  habilitarInputEmailCorredor,
  mostrarInputEmailCorredor
};

// Grillar Seguros
const mostrarGrillaSeguros = params => {
  const { idTarea, coaseguros = [], reaseguros = [], esAjustador, flagModificar } = params;

  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    undefined
  ];

  const validacionSeguros = coaseguros.length > 0 || reaseguros.length > 0;

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && validacionSeguros && !esAjustador) {
    return true;
  }

  return false;
};

export const validacionGrillaSeguros = {
  mostrarGrillaSeguros
};

// Input Emails Seguros
const requerirInputEmailSeguros = params => {
  const { idTarea, cerrarSiniestroValue } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if (tareasPermitidas.includes(idTarea) && !cerrarSiniestroValue) {
    return true;
  }
  return false;
};

const habilitarInputEmailSeguros = params => {
  const { idTarea, esSiniestroPreventivo, cerrarSiniestroValue } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if (tareasPermitidas.includes(idTarea) && !esSiniestroPreventivo && !cerrarSiniestroValue) {
    return true;
  }
  return false;
};

export const validacionInputEmailSeguros = {
  requerirInputEmailSeguros,
  habilitarInputEmailSeguros
};

// Boton Enviar Emails
const mostrarEnviarEmails = params => {
  const { idTarea, indNotifReaCoa, indCargaMasiva } = params;

  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if (tareasPermitidas.includes(idTarea) && indNotifReaCoa === 'N' && indCargaMasiva !== 'COA') {
    return true;
  }
  return false;
};

export const validacionBotonEnviarEmails = {
  mostrarEnviarEmails
};

// Carga Masiva Catastrofico
const mostrarPolizaLider = params => {
  const { indCargaMasiva } = params;

  if (indCargaMasiva === 'COA') {
    return true;
  }
  return false;
};

export const validacionPolizaLider = {
  mostrarPolizaLider
};
