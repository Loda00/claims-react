import {
  FETCH_POLIZA_STARTED,
  FETCH_POLIZA_FINISHED,
  FETCH_POLIZA_RESET
} from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/actions';
import { union } from 'lodash';
import {
  OBTENER_REASEGUROS_INICIADO,
  OBTENER_REASEGUROS_TERMINADO
} from 'scenes/TaskTray/components/SectionDataPoliza/data/obtenerReaseguros/actions';

import {
  ELIMINAR_REASEGUROS_INICIADO,
  ELIMINAR_REASEGUROS_TERMINADO
} from 'scenes/TaskTray/components/SectionDataPoliza/data/eliminarReaseguros/actions';

const initialState = {
  poliza: [],
  isLoading: false
};

export const getDataPoliza = state => state.scenes.taskTray.taskTrayComponents.sectionDataPoliza.data.dataPoliza;

export const getTieneCoaseguro = state => {
  const poliza = state.scenes.taskTray.taskTrayComponents.sectionDataPoliza.data.dataPoliza.poliza[0] || {};
  return poliza && poliza.coaseguros && poliza.coaseguros.length > 0;
};
export const getCoaseguros = state => {
  const poliza = state.scenes.taskTray.taskTrayComponents.sectionDataPoliza.data.dataPoliza.poliza[0] || {};
  return (poliza && poliza.coaseguros) || [];
};
export const getReaseguros = state => {
  const poliza = state.scenes.taskTray.taskTrayComponents.sectionDataPoliza.data.dataPoliza.poliza[0] || {};
  return (poliza && poliza.reaseguros) || [];
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_POLIZA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_POLIZA_FINISHED:
      return {
        ...state,
        isLoading: false,
        poliza: action.payload.data
      };
    case FETCH_POLIZA_RESET:
      return {
        ...initialState
      };
    case OBTENER_REASEGUROS_INICIADO:
      return {
        ...state,
        isLoading: true
      };
    case OBTENER_REASEGUROS_TERMINADO:
      return {
        ...state,
        isLoading: false,
        poliza: [
          {
            ...state.poliza[0],
            reaseguros: union(state.poliza[0].reaseguros, action.payload.data)
          }
        ]
      };
    case ELIMINAR_REASEGUROS_INICIADO:
      return {
        ...state,
        isLoading: true
      };
    case ELIMINAR_REASEGUROS_TERMINADO: {
      const ramo = action.payload.data;
      const reasegurosPorRamos = (state.poliza[0].reaseguros || []).filter(rea => rea.codRamo !== ramo);
      return {
        ...state,
        isLoading: false,
        poliza: [
          {
            ...state.poliza[0],
            reaseguros: reasegurosPorRamos
          }
        ]
      };
    }
    default:
      return state;
  }
};
