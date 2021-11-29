import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Menu, Icon, Row, Skeleton } from 'antd';
import IconClaims from 'components/IconClaims';
import { ICONS } from 'constants/index';

import './styles.css';

const LinkMenu = withRouter(props => {
  const { location } = props;

  const getSelectedKeys = () => {
    const array = [];
    let parts = [];
    parts = location.pathname.split('/');
    if (parts[2] === 'completar' || parts[2] === 'analizar') {
      return array.concat('/tareas');
    }
    return array.concat(location.pathname);
  };

  return (
    <Skeleton
      active
      loading={!props.userClaims}
      className="claims-rrgg-menu-loader"
      title={false}
      paragraph={{ rows: 9 }}
    >
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={getSelectedKeys()}
        className="navigation___2u4Gc"
        onClick={props.onClickDrawerMenuItem}
      >
        {props.userClaims &&
          (props.userClaims.opciones || []).map((option, i) => {
            if (option.subOpciones && option.subOpciones.length > 0) {
              return (
                <Menu.SubMenu
                  key={option.url}
                  title={
                    <span>
                      <Icon component={() => <IconClaims icon={ICONS[option.iconName]} />} />
                      <span>{option.etiqueta}</span>
                    </span>
                  }
                >
                  {option.subOpciones.map((suboption, j) => {
                    return (
                      <Menu.Item key={suboption.url}>
                        <NavLink to={suboption.url}>
                          <Row type="flex" align="middle">
                            {/* icons es una constante */}
                            <Icon component={() => <IconClaims icon={ICONS[suboption.iconName]} />} />
                            <span className="nav-text">{suboption.etiqueta}</span>
                          </Row>
                        </NavLink>
                      </Menu.Item>
                    );
                  })}
                </Menu.SubMenu>
              );
            }
            return (
              <Menu.Item key={option.url}>
                <NavLink to={option.url}>
                  <Row type="flex" align="middle">
                    <Icon component={() => <IconClaims icon={ICONS[option.iconName]} />} />
                    <span className="nav-text">{option.etiqueta}</span>
                  </Row>
                </NavLink>
              </Menu.Item>
            );
          })}
      </Menu>
    </Skeleton>
  );
});

export default LinkMenu;
