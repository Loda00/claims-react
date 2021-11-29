import { FETCH_PARAMS_STARTED, FETCH_PARAMS_FINISHED } from 'services/types/actions';
import { isEmpty } from 'lodash';

const initialState = {
  params: {},
  isLoading: false
};

export const getParam = (state, ruta, code) => {
  const params = state.services.types.params[ruta];
  if (!isEmpty(params)) {
    return params.find(param => param.valor === code).descripcion;
  }
  return undefined;
};

export const getParamFRS = (state, ruta) => {
  const params = state.services.types.params[ruta];
  if (!isEmpty(params)) {
    return params[0].valor;
  }
  return undefined;
};

export const getParamBandeja = (state, code) => {
  const params = state.services.types.params.CRG_SYN_TAREAS;
  if (!isEmpty(params)) {
    return params.find(param => param.valor === code).descripcion;
  }
  return undefined;
};

// TAMANIO_TABLA_PAGINA
export const getParamGeneral = (state, code) => {
  const params = state.services.types.params.CRG_SYN_GENERAL;
  if (!isEmpty(params)) {
    return params.find(param => param.valor === code).descripcion;
  }
  if (code === 'TAMANIO_TABLA_PAGINA') {
    return 10;
  }
  return undefined;
};

const convierteParam = payload => {
  if (payload.ruta === 'CRG_SYN_GENERAL') {
    return payload.params.map(param => {
      if (param.valor === 'TAMANIO_TABLA_PAGINA' || param.valor === 'TIEMPO_INACTIVIDAD_MIN') {
        return {
          ...param,
          descripcion: Number(param.descripcion)
        };
      }

      return param;
    });
  }

  return payload.params;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PARAMS_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_PARAMS_FINISHED:
      return {
        ...state,
        isLoading: false,
        params: {
          ...state.params,
          [action.payload.ruta]: convierteParam(action.payload)
        }
      };
    default:
      return state;
  }
};
