/* eslint-disable import/prefer-default-export */

import {
  FETCH_ANULAR_FINISHED,
  FETCH_ANULAR_STARTED,
  FETCH_ANULAR_RESET
} from 'scenes/components/Anular/data/anularSiniestro/action';

const initialState = {
  anular: [],
  isLoading: false,
  error: null
};

export const getAnularSiniestro = state => state.scenes.query.component.anular.data.anularSiniestro;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ANULAR_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_ANULAR_FINISHED:
      return {
        ...state,
        isLoading: false,
        anular: action.payload.anular
      };
    case FETCH_ANULAR_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
