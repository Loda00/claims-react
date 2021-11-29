import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Route, Switch, Redirect } from 'react-router-dom';
import Amplify from 'aws-amplify';
import awsExports from 'aws-exports';
import store, { AmplifyBridge } from 'store';
import * as userActions from 'services/users/actions';
import Login from 'scenes/Login';
import GeneratePassword from 'scenes/Login/components/GeneratePassword';
import MainApp from 'MainApp';
import { Modal } from 'antd';
import 'App.css';

import { debounce, isEmpty } from 'lodash';
import DescargaDocumento from 'components/DescargaDocumento';
import * as deviceActionCreator from './services/device/actions';

Amplify.configure(awsExports);

const AuthComponent = props => {
  const {
    location: { state },
    user: { user: userCognito, userClaims }
  } = props;

  let route = '/';

  if (
    !isEmpty(state) &&
    (state.from.pathname.startsWith('/consultar-siniestro/RG') ||
      state.from.pathname === '/tareas' ||
      state.from.pathname.startsWith(
        '/siniestro/documentos/' || state.from.pathname === '/tareas/siniestro-duplicado/RG19105179/53401'
      ))
  ) {
    if (
      userClaims &&
      userClaims.opciones.some(op => {
        if (state.from.pathname.startsWith('/consultar-siniestro/RG')) return true;
        if (state.from.pathname.startsWith('/siniestro/documentos/')) return true;
        if (state.from.pathname === '/tareas' && op.url === '/tareas') return true;
        return false;
      })
    ) {
      route = state.from;
    }
  }

  if (userCognito && userClaims) {
    return <Redirect to={route} />;
  }

  return <Login />;
};

const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  // copio todo de rest y se los paso a route, si la prop. user de childProps es true a C le paso la copia de rProps y del childProps
  // si es falso al componente Redirect(react-router-dom) le envio el path name y el state donde le paso la propiedad location de rProps
  // --> childProps es un objeto con estados
  <Route
    {...rest}
    render={rProps =>
      childProps.user.user ? (
        <C {...rProps} {...childProps} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: rProps.location }
          }}
        />
      )
    }
  />
);

const ProppedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route {...rest} render={rProps => <C {...rProps} {...childProps} />} />
);

const Routes = ({ childProps }) => (
  <Switch>
    {/* 2 casos ProppedRoute y Protected Route, --> childProps es un objeto con estados */}
    {/* A proppedRoute se le pasa el AuthComponent y esto trae el login */}
    <ProppedRoute exact path="/login" render={AuthComponent} props={childProps} />
    <ProppedRoute exact path="/forgotPassword" render={GeneratePassword} props={childProps} />
    {/* A ProtectedRoute se le pasa MainApp componente */}
    <ProtectedRoute path="/siniestro/documentos/:idDocumento" exact render={DescargaDocumento} props={childProps} />
    <ProtectedRoute path="/" render={MainApp} props={childProps} />
  </Switch>
);

class App extends Component {
  componentDidMount() {
    new AmplifyBridge(store, this.signOut, this.obtenerLocation);
    window.addEventListener('resize', debounce(this.updateWidth, 150));
    window.addEventListener('storage', this.onStorageEvent, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', debounce(this.updateWidth, 150));
    window.removeEventListener('storage', this.onStorageEvent, false);
  }

  onStorageEvent = storageObject => {
    const {
      user: { user: userCognito }
    } = this.props;
    if (storageObject.key.endsWith('LastAuthUser')) {
      const lastAuthUser = storageObject.newValue;
      if (userCognito && ![userCognito.attributes.email, userCognito.attributes.sub].includes(lastAuthUser)) {
        Modal.warning({
          title: 'Iniciar sesión',
          content: (
            <span>Se cerró la sesión de su cuenta. Presione “Volver a cargar” para iniciar sesión de nuevo.</span>
          ),
          centered: true,
          okText: 'Volver a cargar',
          onOk: () => {
            window.location.reload();
          }
        });
      }
    }
  };

  updateWidth = () => {
    if (window.innerWidth > 768) {
      this.props.dispatch(deviceActionCreator.showScroll(false));
    } else if (window.innerWidth <= 768) {
      this.props.dispatch(deviceActionCreator.showScroll(true));
    }
  };

  signOut = () => {
    this.props.dispatch(userActions.signOut());
    this.props.history.replace('', null);
  };

  obtenerLocation = () => {
    const {
      location: { pathname }
    } = this.props;
    return pathname;
  };

  render() {
    const { user } = this.props;

    const childProps = {
      signOut: this.signOut,
      user
    };

    return (
      <div>
        <Routes childProps={childProps} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    showScroll: state.services.device.scrollActivated,
    user: state.services.user
  };
};

export default withRouter(connect(mapStateToProps)(App));
