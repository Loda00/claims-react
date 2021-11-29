import {
  SEND_COORDENADA_CORE_STARTED,
  SEND_COORDENADA_CORE_FINISHED,
  FETCH_COORDENADAS_STARTED,
  FETCH_COORDENADAS_FINISHED,
  FETCH_COORDENADAS_RESET,
  MAINTAIN_COORDENADA_STARTED,
  MAINTAIN_COORDENADA_FINISHED
} from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/actions';

const initialState = {
  coordenadaCoreResponse: {},
  isLoadingSend: false,
  coordenadas: [],
  isLoadingFetch: false,
  isMaintainLoading: false
};

export const getCoordenadas = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.components.pagosFormItem.components.paymentTabs.components
    .coordenadas.data.coordenada.coordenadas;

export const getCoordenadasMaintainLoading = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.components.pagosFormItem.components.paymentTabs.components
    .coordenadas.data.coordenada.isMaintainLoading;

export const getCoordenadaCoreResponse = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.components.pagosFormItem.components.paymentTabs.components
    .coordenadas.data.coordenada.coordenadaCoreResponse;

export const getCoordenadaSendLoading = state =>
  state.scenes.taskTray.taskTrayComponents.searchRegistry.components.pagosFormItem.components.paymentTabs.components
    .coordenadas.data.coordenada.isLoadingSend;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COORDENADAS_STARTED:
      return {
        ...initialState,
        isLoadingFetch: true
      };
    case FETCH_COORDENADAS_FINISHED:
      return {
        ...state,
        isLoadingFetch: false,
        coordenadas: action.payload.coordenadas
      };
    case FETCH_COORDENADAS_RESET:
      return {
        ...state,
        isLoadingFetch: false,
        coordenadas: [],
        coordenadaCoreResponse: {}
      };
    case MAINTAIN_COORDENADA_STARTED:
      return {
        ...state,
        isMaintainLoading: true
      };
    case MAINTAIN_COORDENADA_FINISHED:
      return {
        ...state,
        isMaintainLoading: false
      };
    case SEND_COORDENADA_CORE_STARTED:
      return {
        ...state,
        coordenadaCoreResponse: {},
        isLoadingSend: true
      };
    case SEND_COORDENADA_CORE_FINISHED:
      return {
        ...state,
        isLoadingSend: false,
        coordenadaCoreResponse: action.payload.coordenadaCoreResponse
      };
    default:
      return state;
  }
};
