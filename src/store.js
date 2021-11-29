import { createStore, combineReducers, applyMiddleware, compose } from 'redux';

import { reducer as servicesReducer } from 'services/reducer';
import { reducer as scenesReducer } from 'scenes/reducer';
import { reducer as componentsReducer } from 'components/reducer';
import * as JWT from 'jwt-decode';
import thunk from 'redux-thunk';
import createDebounce from 'redux-debounced';

import { CONSTANTS_APP, FORMAT_AUDITORIA } from 'constants/index';
import _ from 'lodash';
import moment from 'moment';

const appReducer = combineReducers({
  scenes: scenesReducer,
  services: servicesReducer,
  components: componentsReducer
});

const fetchMiddleware = store => next => action => {
  if (action.type === 'FETCH') {
    const { promise, body } = action.payload;
    const actualDate = moment();
    const idUsuario = _.get(store.getState(), 'services.user.userClaims.idCore');
    const tipoCanal = CONSTANTS_APP.CHANNEL;
    const idToken = _.get(store.getState(), 'services.user.user.signInUserSession.idToken.jwtToken', undefined);
    const usuario = JWT(idToken).email || '';
    const emailPadre = _.get(store.getState(), 'services.user.userClaims.emailPadre', undefined);
    const auditoria = {
      ip: '',
      usuario: emailPadre || usuario,
      fechaTrans: moment(actualDate).format(FORMAT_AUDITORIA.FECHA),
      horaTrans: moment(actualDate).format(FORMAT_AUDITORIA.HORA)
    };
    _.set(body, 'idUsuario', idUsuario ? idUsuario.toString() : '');
    _.set(body, 'tipoCanal', tipoCanal);
    _.set(body, 'auditoria', auditoria);

    return promise(body);
  }
  return next(action);
};

let composeEnhancers = compose;
let middleware = [fetchMiddleware, createDebounce(), thunk];

if (process.env.NODE_ENV === 'development') {
  composeEnhancers = require('redux-devtools-extension').composeWithDevTools; // eslint-disable-line
  middleware = [...middleware, require('redux-logger').default]; // eslint-disable-line
}

const store = createStore(appReducer, composeEnhancers(applyMiddleware(...middleware)));

export default store;

export { default as AmplifyBridge } from 'AmplifyBridge';
