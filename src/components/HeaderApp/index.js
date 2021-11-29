import React from 'react';
import { Layout } from 'antd';
import RoleName from '../RoleName';

class HeaderApp extends React.Component {
  state = {
    drawerVisible: false
  };

  showDrawer = () => {
    this.setState({
      drawerVisible: true
    });
  };

  onClose = () => {
    this.setState({
      drawerVisible: false
    });
  };

  onClickDrawerMenuItem = () => {
    this.setState({
      drawerVisible: false
    });
  };

  render() {
    return (
      <Layout.Header style={{ padding: '20px' }}>
        <RoleName userClaims={this.props.userClaims} signOut={this.props.signOut} />
      </Layout.Header>
    );
  }
}

export default HeaderApp;
