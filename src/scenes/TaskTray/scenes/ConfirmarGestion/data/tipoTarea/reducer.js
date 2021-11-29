import {
  FETCH_TIPO_TAREA_STARTED,
  FETCH_TIPO_TAREA_FINISHED
} from 'scenes/TaskTray/scenes/ConfirmarGestion/data/tipoTarea/actions';

const initialState = {
  tipo: null,
  isLoading: false
};

export const getTipoConfirmarGestion = state => state.scenes.taskTray.confirmarGestion.data.tipoTask.tipo;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TIPO_TAREA_STARTED:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_TIPO_TAREA_FINISHED:
      return {
        ...state,
        tipo: action.paiload.data,
        isLoading: false
      };
    default:
      return state;
  }
};

export { reducer as default };
