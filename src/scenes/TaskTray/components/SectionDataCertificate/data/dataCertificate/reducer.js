import {
  FETCH_CERTIFICATE_STARTED,
  FETCH_CERTIFICATE_FINISHED
} from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/actions';

const initialState = {
  certificate: [],
  isLoading: false
};

export const getDataCertificate = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataCertificate.data.dataCertificate;

export const getCertificado = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataCertificate.data.dataCertificate.certificate[0] || {};

const getCert = state =>
  state.scenes.taskTray.taskTrayComponents.sectionDataCertificate.data.dataCertificate.certificate[0] || {};

export const getAseguradoPoliza = state => {
  const asegurado =
    state.scenes.taskTray.taskTrayComponents.sectionDataCertificate.data.dataCertificate.certificate[0] || {};
  return {
    codExterno: asegurado.numId ? asegurado.numId.toString() : undefined,
    nomCompleto: asegurado.nombreAsegurado
  };
};
export const getMonedaCertificado = state => {
  const sectionCertificado =
    state.scenes.taskTray.taskTrayComponents.sectionDataCertificate.data.dataCertificate.certificate[0] || {};
  return sectionCertificado.moneda;
};

export const getFechaFinVigencia = state => getCert(state).fechaFinVigencia || null;

export const getfechaInicioVidencia = state => getCert(state).fechaInicioVidencia || null;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CERTIFICATE_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_CERTIFICATE_FINISHED:
      return {
        ...state,
        isLoading: false,
        certificate: action.payload.data
      };
    default:
      return state;
  }
};
