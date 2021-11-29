/* eslint-disable import/prefer-default-export */

import {
  FETCH_HISTORIAL_RESERVA_FINISHED,
  FETCH_HISTORIAL_RESERVA_STARTED,
  FETCH_HISTORIAL_RESERVA_RESET
} from 'scenes/TaskTray/components/SectionHistoryChange/data/historialReserva/action';

const initialState = {
  historialReserva: [],
  isLoading: false,
  error: null
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_HISTORIAL_RESERVA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_HISTORIAL_RESERVA_FINISHED:
      return {
        ...state,
        isLoading: false,
        historialReserva: action.payload.historialReserva
      };
    case FETCH_HISTORIAL_RESERVA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
