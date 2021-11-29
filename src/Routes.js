import React from 'react';
import { Skeleton } from 'antd';
import { Route, Switch, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';

const loadinSkeleton = () => (
  <Skeleton active paragraph={{ rows: 20 }} title={false} className="claims-rrgg-skeleton-content" />
);

const TaskTrayHome = Loadable({
  loader: () => import('scenes/TaskTray/scenes/TaskTrayHome'),
  loading: loadinSkeleton
});

const CompleteTaskInfo = Loadable({
  loader: () => import('scenes/TaskTray/scenes/CompleteTaskInfo'),
  loading: loadinSkeleton
});

const Query = Loadable({
  loader: () => import('scenes/Query'),
  loading: loadinSkeleton
});

const CargaMasiva = Loadable({
  loader: () => import('scenes/CargaMasiva'),
  loading: loadinSkeleton
});

const CargarRecuperoForm = Loadable({
  loader: () => import('scenes/Query/Component/CargarRecuperoForm/index'),
  loading: loadinSkeleton
});

const CargarSalvamentoForm = Loadable({
  loader: () => import('scenes/Query/Component/CargarSalvamentoForm/index'),
  loading: loadinSkeleton
});

const Usuaurio = Loadable({
  loader: () => import('scenes/Administracion/Usuario'),
  loading: loadinSkeleton
});

const Ajustador = Loadable({
  loader: () => import('scenes/Administracion/Ajustadores/index'),
  loading: loadinSkeleton
});

const Ramo = Loadable({
  loader: () => import('scenes/Administracion/Ramo'),
  loading: loadinSkeleton
});

const Causas = Loadable({
  loader: () => import('scenes/Administracion/Causas'),
  loading: loadinSkeleton
});

const Consecuencias = Loadable({
  loader: () => import('scenes/Administracion/Consecuencias'),
  loading: loadinSkeleton
});

const ConfirmarGestion = Loadable({
  loader: () => import('scenes/TaskTray/scenes/ConfirmarGestion'),
  loading: loadinSkeleton
});

const AnalyzeSinisterInfo = Loadable({
  loader: () => import('scenes/TaskTray/scenes/AnalyzeSinisterInfo'),
  loading: loadinSkeleton
});

const GenerarInformeBasico = Loadable({
  loader: () => import('scenes/TaskTray/scenes/GenerarInformeBasico'),
  loading: loadinSkeleton
});

const ConsultaSiniestro = Loadable({
  loader: () => import('scenes/Query/Component/ConsultarSiniestro'),
  loading: loadinSkeleton
});

const AdjuntarCargoRechazo = Loadable({
  loader: () => import('scenes/TaskTray/scenes/AdjuntarCargoRechazo'),
  loading: loadinSkeleton
});

const RevisarInformeBasico = Loadable({
  loader: () => import('scenes/TaskTray/scenes/RevisarInformeBasico'),
  loading: loadinSkeleton
});

const RevisarPago = Loadable({
  loader: () => import('scenes/TaskTray/scenes/RevisarPago'),
  loading: loadinSkeleton
});

const SiniestroDuplicado = Loadable({
  loader: () => import('scenes/TaskTray/scenes/SiniestroDuplicado'),
  loading: loadinSkeleton
});

const ConsultaModificarSiniestro = Loadable({
  loader: () => import('scenes/Query/Component/ConsultaModificar/index'),
  loading: loadinSkeleton
});

const Notificaciones = Loadable({
  loader: () => import('scenes/Administracion/Notificaciones'),
  loading: loadinSkeleton
});

const Parametros = Loadable({
  loader: () => import('scenes/Administracion/Parametros'),
  loading: loadinSkeleton
});

const ProtectedRoute = ({ render: C, props: childProps, ...rest }) => (
  <Route
    {...rest}
    render={rProps =>
      childProps.userClaims.opciones.some(op => rProps.location.pathname === '/tareas' && op.url === '/tareas') ? (
        <C {...rProps} {...childProps} />
      ) : (
        <Redirect
          to={{
            pathname: '/',
            state: { from: rProps.location }
          }}
        />
      )
    }
  />
);

export default ({ childProps }) => (
  <Switch>
    <Route path="/" exact component={Query} />
    <Route path="/tareas/completar/:numSiniestro/:idCaso" exact component={CompleteTaskInfo} />
    <Route path="/tareas/siniestro-duplicado/:numSiniestro/:idCaso" exact component={SiniestroDuplicado} />
    <Route path="/tareas/analizar/:numSiniestro/:idCaso" exact component={AnalyzeSinisterInfo} />
    <Route path="/consultar-modificar/:numSiniestro" exact component={ConsultaModificarSiniestro} />
    <Route path="/tareas/revisar-informe-basico/:numSiniestro/:idCaso" exact component={RevisarInformeBasico} />
    <Route path="/tareas/generar-informe-basico/:numSiniestro/:idCaso" exact component={GenerarInformeBasico} />
    <Route path="/tareas/revisar-informe/:numSiniestro/:idCaso" exact component={RevisarInformeBasico} />
    <Route path="/tareas/generar-informe/:numSiniestro/:idCaso" exact component={GenerarInformeBasico} />
    <Route path="/tareas/confirmar-gestion/:numSiniestro/:idCaso" exact component={ConfirmarGestion} />
    <Route path="/consultar-siniestro/:numSiniestro" exact component={ConsultaSiniestro} />
    <Route path="/tareas/adjuntar-cargo-rechazo/:numSiniestro/:idCaso" exact component={AdjuntarCargoRechazo} />
    <Route path="/tareas/revisar-pago-ejecutivo/:numSiniestro/:idCaso" exact component={RevisarPago} />
    <Route path="/tareas/revisar-pago-ajustador/:numSiniestro/:idCaso" exact component={RevisarPago} />
    <ProtectedRoute path="/tareas" exact render={TaskTrayHome} props={childProps} />
    <Route path="/:numSiniestro/recupero" exact component={CargarRecuperoForm} />
    <Route path="/:numSiniestro/salvamento" exact component={CargarSalvamentoForm} />
    <Route path="/carga" exact component={CargaMasiva} />
    <Route path="/administracion/usuario" exact component={Usuaurio} />
    <Route path="/administracion/ajustador" exact component={Ajustador} />
    <Route path="/administracion/ramo" exact component={Ramo} />
    <Route path="/administracion/causas" exact component={Causas} />
    <Route path="/administracion/consecuencias" exact component={Consecuencias} />
    <Route path="/administracion/notificaciones" exact component={Notificaciones} />
    <Route path="/administracion/parametros" exact component={Parametros} />
    <Redirect from="*" to="/" />
    <Redirect from="*" to="/administracion/reemplazo" />
  </Switch>
);
