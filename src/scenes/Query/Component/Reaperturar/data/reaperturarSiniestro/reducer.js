/* eslint-disable import/prefer-default-export */

import {
  FETCH_REAPERTURAR_FINISHED,
  FETCH_REAPERTURAR_STARTED,
  FETCH_REAPERTURAR_RESET
} from 'scenes/Query/Component/Reaperturar/data/reaperturarSiniestro/action';

const initialState = {
  reaperturar: [],
  isLoading: false,
  error: null
};

export const getReaperturarSiniestro = state => state.scenes.query.component.reaperturar.data.reaperturarSiniestro;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REAPERTURAR_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_REAPERTURAR_FINISHED:
      return {
        ...state,
        isLoading: false,
        reaperturar: action.payload.reaperturar
      };
    case FETCH_REAPERTURAR_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
