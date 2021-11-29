import React from 'react';
import logo from 'images/logo_blanco.png';
import { Layout, Row } from 'antd';
import Linkmenu from 'components/LinkMenu';

const SideMenu = props => {
  return (
    <Layout.Sider
      breakpoint="xxl"
      collapsedWidth="0"
      width={185}
      trigger={null}
      collapsed={props.siderCollapsed}
      onCollapse={props.onSiderCollapse}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0
      }}
    >
      <Row type="flex" justify="center">
        <img src={logo} className="logo" alt="Logo" />
      </Row>
      {/* a Linkmenu le paso las props */}
      <Linkmenu userClaims={props.userClaims} loadingOptions={props.loadingOptions} />
    </Layout.Sider>
  );
};
export default SideMenu;
