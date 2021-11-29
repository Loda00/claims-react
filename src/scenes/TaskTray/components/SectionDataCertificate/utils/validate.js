import { TAREAS } from 'constants/index';

// Boton Reemplazar Asegurado
const habilitarBotonReemplazarAsegurado = params => {
  const { esSiniestroPreventivo } = params;
  if (!esSiniestroPreventivo) {
    return true;
  }
  return false;
};

const mostrarBotonReemplazarAsegurado = params => {
  const { idTarea, flagModificar, tieneCertificado } = params;
  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && tieneCertificado) {
    return true;
  }
  return false;
};

export const validacionBotonReemplazarAsegurado = {
  habilitarBotonReemplazarAsegurado,
  mostrarBotonReemplazarAsegurado
};

// Input Email Asegurado
const requerirInputEmailAsegurado = params => {
  const { cerrarSiniestroValue, esCMCoaseguro } = params;

  // klrojas coaseguro ---->
  if (!cerrarSiniestroValue && !esCMCoaseguro) {
    return true;
  }
  return false;
};

const habilitarInputEmailAsegurado = params => {
  const { idTarea, esSiniestroPreventivo, flagModificar, cerrarSiniestroValue } = params;

  const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && !esSiniestroPreventivo && !cerrarSiniestroValue) {
    return true;
  }
  return false;
};

const mostrarInputEmailAsegurado = params => {
  const { nuevoAsegurado, correoAsegurado, esCargaMasiva } = params;

  if (!esCargaMasiva) {
    if (nuevoAsegurado || !correoAsegurado) {
      return true;
    }
  }
  return false;
};

export const validacionInputEmailAsegurado = {
  requerirInputEmailAsegurado,
  habilitarInputEmailAsegurado,
  mostrarInputEmailAsegurado
};

// Area Aplicacion

const mostrarAplicacion = params => {
  const { codProducto, idTarea, flagModificar, esAjustador } = params;
  const tareasPermitidas = [
    TAREAS.ANALIZAR_SINIESTRO,
    TAREAS.REVISAR_INFORME_BASICO,
    TAREAS.REVISAR_INFORME,
    TAREAS.CONFIRMAR_GESTION,
    TAREAS.REVISAR_PAGO_EJECUTIVO,
    undefined
  ];

  if ((tareasPermitidas.includes(idTarea) || flagModificar) && codProducto === '3001' && !esAjustador) {
    return true;
  }

  return false;
};

export const validacionAplicacion = {
  mostrarAplicacion
};
