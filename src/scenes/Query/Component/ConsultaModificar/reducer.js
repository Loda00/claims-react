import { combineReducers } from 'redux';

import { reducer as dataReducer } from 'scenes/Query/Component/ConsultarSiniestro/data/reducer';

export const reducer = combineReducers({
  data: dataReducer
});
