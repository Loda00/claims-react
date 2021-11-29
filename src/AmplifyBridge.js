import { Auth, Hub } from 'aws-amplify';
import { Modal } from 'antd';
import * as userActionCreators from 'services/users/actions';
import * as typesActionCreators from 'services/types/actions';
import moment from 'moment';
import * as tasaCambioActionCreators from 'services/tasaCambio/actions';
import { showErrorMessage } from 'util/index';

const showUserClaimsError = (message, onSignout) => {
  Modal.error({
    title: 'Error de inicio de sesi\u00F3n',
    content: message,
    onOk: () => {
      onSignout();
    }
  });
};

export default class AmplifyBridge {
  constructor(store, onSignout, obtenerLocation) {
    this.store = store;
    this.onSignout = onSignout;
    this.obtenerLocation = obtenerLocation;

    Hub.listen('auth', capsule => {
      const { channel, payload } = capsule;
      if (channel === 'auth' && payload.event !== 'signIn_failure') {
        this.checkUser();
      }
    });

    this.checkUser(); // first check
  }

  checkUser = () => {
    this.store.dispatch(userActionCreators.loadUserGlobal());
    this.store.dispatch(userActionCreators.switchUserStart());
    Auth.currentAuthenticatedUser()
      .then(user => this.checkUserSuccess(user))
      .catch(err => this.checkUserError(err));
  };

  checkUserSuccess = async user => {
    this.store.dispatch(userActionCreators.switchUserFinished(user));

    const pathname = this.obtenerLocation();
    if (pathname && pathname.startsWith('/siniestro/documentos/')) return;

    try {
      await this.store.dispatch(typesActionCreators.fetchParam('CRG_SYN_GENERAL'));
    } catch (error) {
      showErrorMessage('Ocurrió un error al obtener la lista de parametros generica');
      this.store.dispatch(userActionCreators.loadedUserGlobal());
    }

    try {
      await this.store.dispatch(userActionCreators.fetchUserClaims());
    } catch (e) {
      showUserClaimsError(this.store.getState().services.user.errorUserClaims.message, this.onSignout);
      this.store.dispatch(userActionCreators.loadedUserGlobal());
      return;
    }

    this.store.dispatch(userActionCreators.loadedUserGlobal());

    const promises = [];
    promises.push(
      this.store.dispatch(tasaCambioActionCreators.fetchTasaCambio('SOL', 'USD', moment().format('DD/MM/YYYY')))
    );
    promises.push(
      this.store.dispatch(tasaCambioActionCreators.fetchTasaCambio('USD', 'SOL', moment().format('DD/MM/YYYY')))
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      showErrorMessage('Ocurrió un error al obtener la tasa de cambio');
    }
  };

  checkUserError = () => {
    this.store.dispatch(userActionCreators.switchUserFinished(null));
    this.store.dispatch(userActionCreators.loadedUserGlobal());
  };
}
