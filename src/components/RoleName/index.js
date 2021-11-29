/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Row, Col, Divider, Tooltip } from 'antd';
import { capitalize } from 'lodash';
import './styles.css';

class RoleName extends React.Component {
  render() {
    const { userClaims, signOut } = this.props;

    const listaRoles = userClaims.roles.map(itemRol => (
      <div key={itemRol.codTipo} value={itemRol.codTipo}>
        {itemRol.tipo}
      </div>
    ));

    return (
      <div className="rolename">
        {userClaims && (
          <Form>
            <Row className="rolAndName">
              <Col span={24} style={{ textAlign: 'right' }}>
                <label>{`${capitalize(userClaims.nombres)} ${capitalize(userClaims.apePaterno)}`}</label>
                <Divider type="vertical" />
                <Tooltip title={listaRoles} placement="bottom">
                  <label>{capitalize(userClaims.roles[0].tipo)}</label>
                </Tooltip>
                <Divider type="vertical" />
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a className="exit" onClick={signOut}>
                  Salir
                </a>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}

export default withRouter(RoleName);
