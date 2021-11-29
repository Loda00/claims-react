import {
  FETCH_SINISTER_STARTED,
  FETCH_SINISTER_FINISHED,
  FETCH_SINISTER_RESET,
  ACTUALIZAR_MONTO_HONORARIO_CALCULADO_AJUSTADOR
} from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/actions';

const initialState = {
  sinister: [],
  isLoading: false,
  isData: null
};

/* SELECTORES */
export const getNumPlanillaCoaseguro = state => {
  const siniestro = state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return siniestro.numPlanillaCoaseguro || '';
};

export const getEsSiniestroPreventivo = state => {
  const siniestro = state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return siniestro.codTipoSiniestro === 'P';
};

export const getTipoSiniestro = state => {
  const siniestro = state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return siniestro.tipoFlujo || '';
};

export const getTipoCargaMasiva = state => {
  const siniestro = state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return siniestro.indCargaMasiva || '';
};

export const getDataSinister = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};

export const getIdSiniestroAX = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return dataSiniestro.idSiniestroAX;
};

export const getIdCase = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return dataSiniestro.idCase;
};

export const getCodProducto = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return dataSiniestro.codProducto;
};

export const getIdePoliza = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return dataSiniestro.idePoliza;
};

export const getNumCertificado = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return dataSiniestro.numCertificado;
};

export const getIdeSinAX = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return dataSiniestro.idSiniestroAX;
};
export const getNumSiniestroAX = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || {};
  return dataSiniestro.idSiniestro;
};

export const getListaOtrosConceptos = state => {
  const dataSiniestro =
    state.scenes.taskTray.taskTrayComponents.sectionDataSinister.data.dataSinister.sinister[0] || [];
  return dataSiniestro.listaOtrosConceptos;
};

export const getIndSalvamentoAnt = state => getDataSinister(state).indSalvamentoAnt || undefined;
export const getIndRecuperoAnt = state => getDataSinister(state).indRecuperoAnt || undefined;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SINISTER_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_SINISTER_FINISHED:
      return {
        ...state,
        isLoading: false,
        sinister: action.payload.data,
        isData: action.payload.isData
      };
    case FETCH_SINISTER_RESET:
      return {
        ...initialState
      };
    case ACTUALIZAR_MONTO_HONORARIO_CALCULADO_AJUSTADOR:
      return {
        ...state,
        sinister: action.payload.data
      };
    default:
      return state;
  }
};
