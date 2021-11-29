import { combineReducers } from 'redux';
import { reducer as userReducer } from 'services/users/reducer';
import { reducer as sinisterReducer } from 'services/sinister/reducer';
import { reducer as typesReducer } from 'services/types/reducer';
import { reducer as deviceReducer } from 'services/device/reducer';
import { reducer as tasaCambioReducer } from 'services/tasaCambio/reducer';
import { reducer as uiReducer } from 'services/ui/reducer';

export const reducer = combineReducers({
  user: userReducer,
  device: deviceReducer,
  ui: uiReducer,
  types: typesReducer,
  sinister: sinisterReducer,
  tasaCambio: tasaCambioReducer
});
