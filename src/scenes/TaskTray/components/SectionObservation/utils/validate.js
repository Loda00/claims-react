import { TAREAS } from 'constants/index';

const requerirObservacion = params => {
  const {
    idTarea,
    esDevolver,
    cerrarSiniestroValue,
    salvamento,
    recupero,
    indRecuperoAnt,
    indSalvamentoAnt,
    requiereAjustador = 'N',
    indReqAjustadorAnt = 'N'
  } = params;

  const tareasCierreSiniestro = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];

  if (idTarea === TAREAS.ANALIZAR_SINIESTRO) {
    if (cerrarSiniestroValue) {
      return true;
    }

    if (indReqAjustadorAnt === 'N' && requiereAjustador === 'S') {
      return true;
    }
  }

  const tareasValidarSalvamentoRecuperoFlujoComplejoAjustador = [TAREAS.GENERAR_INFORME_BASICO, TAREAS.GENERAR_INFORME];
  if (tareasCierreSiniestro.includes(idTarea) && cerrarSiniestroValue) {
    return true;
  }

  if (esDevolver) {
    return true;
  }
  if (tareasValidarSalvamentoRecuperoFlujoComplejoAjustador.includes(idTarea)) {
    const salvamentoActual = salvamento ? 'S' : 'N';
    const recuperoActual = recupero ? 'S' : 'N';
    const esIgualSalvamento = salvamentoActual === indSalvamentoAnt;
    const esIgualRecupero = recuperoActual === indRecuperoAnt;

    if (!esIgualSalvamento || !esIgualRecupero) {
      return true;
    }
  }

  return false;
};

export const validacionObservacion = {
  requerirObservacion
};
