import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import IdleTimer from 'react-idle-timer';
import { Layout, Skeleton, Spin } from 'antd';

import { getParamGeneral } from 'services/types/reducer';
import Routes from './Routes';
import UserSection from './UserSection';

class MainApp extends Component {
  constructor(props) {
    super(props);
    this.idleTimer = null;
    this.onIdle = this._onIdle.bind(this);
  }

  _onIdle() {
    const { signOut } = this.props;
    signOut();
  }

  render() {
    const { isLoadingGlobal, siderCollapsed, userClaims, signOut, tiempoInactividadServidor = 70 } = this.props;
    const childProps = {
      userClaims
    };

    return (
      <div>
        {/* */}
        <IdleTimer
          // se setea estado de idleTimer de null a ref
          ref={ref => {
            this.idleTimer = ref;
          }}
          element={document}
          // se declara que parametro onIdle es el estado de onIdle
          onIdle={this.onIdle}
          debounce={250}
          timeout={1000 * 60 * tiempoInactividadServidor}
        />
        <Spin spinning={isLoadingGlobal}>
          <Layout style={{ minHeight: '100vh' }}>
            <UserSection section="menu" siderCollapsed={siderCollapsed} />
            <Layout
              style={{
                marginLeft: siderCollapsed ? '0' : '170px',
                maxWith: 'calc(100% - 170px)'
              }}
            >
              <UserSection section="header" signOut={signOut} siderCollapsed={siderCollapsed} />
              <Skeleton
                active
                loading={!userClaims}
                paragraph={{ rows: 20 }}
                title={false}
                className="claims-rrgg-skeleton-content"
              >
                <Layout.Content style={{ margin: '0 30px 0' }}>
                  <div style={{ padding: 0, minHeight: 360 }}>
                    <Routes childProps={childProps} />
                  </div>
                </Layout.Content>
              </Skeleton>
            </Layout>
          </Layout>
        </Spin>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const tiempoInactividadServidor = getParamGeneral(state, 'TIEMPO_INACTIVIDAD_MIN');
  return {
    siderCollapsed: state.services.device.siderCollapsed,
    isLoadingGlobal: state.services.ui.isLoadingGlobal,
    userClaims: state.services.user.userClaims,
    isLoadingUserClaims: state.services.user.isLoadingUserClaims,
    tiempoInactividadServidor
  };
}

export default withRouter(connect(mapStateToProps)(MainApp));
