/* eslint-disable import/prefer-default-export */

import {
  FETCH_BITACORA_FINISHED,
  FETCH_BITACORA_STARTED,
  FETCH_BITACORA_RESET
} from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/action';

const initialState = {
  bitacora: [],
  isLoading: false,
  error: null
};

export const getBitacora = state => state.scenes.taskTray.taskTrayComponents.sectionBitacora.data.bitacora;

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_BITACORA_STARTED:
      return {
        ...initialState,
        isLoading: true
      };
    case FETCH_BITACORA_FINISHED:
      return {
        ...state,
        isLoading: false,
        bitacora: action.payload.bitacora
      };
    case FETCH_BITACORA_RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
