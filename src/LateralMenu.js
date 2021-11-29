import React from 'react';
import { connect } from 'react-redux';
import logo from 'images/logo_blanco.png';
import { Layout, Row } from 'antd';
import Drawer from 'rc-drawer';
import 'rc-drawer/assets/index.css';
import SideMenu from './components/SideMenu';
import LinkMenu from './components/LinkMenu';
import * as deviceActionCreators from './services/device/actions';

class LateralMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false
    };
  }

  onMaskClick = () => {
    this.setState({ drawerOpen: false });
  };

  onHandleClick = () => {
    const open = this.state.drawerOpen;
    if (open) {
      this.setState({ drawerOpen: false });
    } else {
      this.setState({ drawerOpen: true });
    }
  };

  onSiderCollapse = () => {
    // se usa el dispatch pasa la funcion creadora de accion que retorna una accion que showSider
    this.props.dispatch(deviceActionCreators.showSider());
  };

  onClickDrawerMenuItem = () => {
    this.setState({ drawerOpen: false });
  };

  render() {
    return (
      <React.Fragment>
        <SideMenu
          userClaims={this.props.userClaims}
          loadingOptions={this.props.loadingUser}
          siderCollapsed={this.props.siderCollapsed}
          onSiderCollapse={this.onSiderCollapse}
        />
        {this.props.siderCollapsed && (
          <Drawer open={this.state.drawerOpen} onMaskClick={this.onMaskClick} onHandleClick={this.onHandleClick}>
            <Layout.Sider style={{ height: '100vh', overflow: 'auto' }}>
              <Row type="flex" justify="center">
                <img src={logo} className="logo" alt="Logo" />
              </Row>
              <LinkMenu
                userClaims={this.props.userClaims}
                loadingOptions={this.props.loadingUser}
                onClickDrawerMenuItem={this.onClickDrawerMenuItem}
              />
            </Layout.Sider>
          </Drawer>
        )}
      </React.Fragment>
    );
  }
}
// a connect se le pasa el componente
export default connect()(LateralMenu);
