import React, { Component } from 'react';
import { Row, Col, List, Icon, Checkbox, Button } from 'antd';

class DragDropRoles extends Component {
  componentDidMount() {
    const { actualizarMargenes } = this.props;
    window.addEventListener('resize', actualizarMargenes('Agregar'));
  }

  render() {
    const {
      items,
      perfil,
      selected,
      valorCargo,
      tipoPersona,
      loadingRoles,
      checkboxRoles,
      rolesCheckbox,
      actualizarMargenes,
      handleDeleteDragDrop,
      setearSeleccionadosCheckbox
    } = this.props;

    return (
      <Row gutter={16} className="container-drag">
        <Col xs={24} sm={11} md={11} lg={11} xl={11}>
          <List
            bordered
            size="small"
            header={
              <Row className="header">
                <Col xs={24} sm={24} md={24} lg={24} xl={24} className="alineacion">
                  <span className="common">ROLES</span>
                </Col>
              </Row>
            }
            loading={loadingRoles}
          >
            <div className="scroll">
              {items.map((item, index) => (
                <List.Item key={item.idTipoUsuario}>
                  <Col xs={2} sm={3} md={3} lg={2} xl={2}>
                    <Checkbox
                      value={item.idTipoUsuario}
                      style={{ marginRight: '15px' }}
                      onChange={e => checkboxRoles(e, items, rolesCheckbox, 'posibles', selected)}
                    />
                  </Col>
                  <Col xs={22} sm={21} md={21} lg={22} xl={22} className="draggable" key={item.idTipoUsuario}>
                    {item.dscTipoUsuario}
                  </Col>
                </List.Item>
              ))}
            </div>
          </List>
        </Col>
        <Col xs={24} sm={2} md={2} lg={2} xl={2} type="flex" align="middle">
          <Button
            type="primary"
            style={{ marginRight: '2px' }}
            onClick={() => setearSeleccionadosCheckbox('seleccionados', rolesCheckbox, items, selected, perfil)}
            disabled={
              !(
                rolesCheckbox.length > 0 &&
                items.some(seleccionado => rolesCheckbox.includes(seleccionado.idTipoUsuario))
              ) ||
              (rolesCheckbox.length > 0 &&
                selected.some(rol => rolesCheckbox.includes(rol.idTipoUsuario)) &&
                items.some(rol => rolesCheckbox.includes(rol.idTipoUsuario)))
            }
          >
            <Icon type={actualizarMargenes('Agregar')[0]} />
          </Button>
          <Button
            type="primary"
            style={{ marginRight: '2px' }}
            onClick={() => setearSeleccionadosCheckbox('posibles', rolesCheckbox, items, selected, perfil)}
            disabled={
              !(
                rolesCheckbox.length > 0 &&
                selected.some(seleccionado => rolesCheckbox.includes(seleccionado.idTipoUsuario))
              ) ||
              (rolesCheckbox.length > 0 &&
                selected.some(rol => rolesCheckbox.includes(rol.idTipoUsuario)) &&
                items.some(rol => rolesCheckbox.includes(rol.idTipoUsuario)))
            }
          >
            <Icon type={actualizarMargenes('Agregar')[1]} />
          </Button>
        </Col>
        <Col xs={24} sm={11} md={11} lg={11} xl={11}>
          <List
            bordered
            size="small"
            header={
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} className="alineacion">
                  <span className="common">ROLES SELECCIONADOS</span>
                </Col>
              </Row>
            }
          >
            <div className="scroll">
              {selected.map((item, index) => (
                <List.Item className="item" key={item.idTipoUsuario + item.campo}>
                  <Row>
                    <Col xs={2} sm={3} md={2} lg={2} xl={2}>
                      <Checkbox
                        value={item.idTipoUsuario}
                        style={{ marginRight: '15px' }}
                        onChange={e => checkboxRoles(e, items, rolesCheckbox, 'seleccionados', selected)}
                      />
                    </Col>
                    <Col xs={19} sm={17} md={19} lg={19} xl={19} className="draggable" key={item.idTipoUsuario}>
                      {item.dscTipoUsuario}
                    </Col>
                    <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                      <Icon
                        type="delete"
                        theme="filled"
                        style={{
                          color: 'red',
                          fontSize: '18px'
                        }}
                        onClick={e => handleDeleteDragDrop(e, item, tipoPersona, valorCargo)}
                      />
                    </Col>
                  </Row>
                </List.Item>
              ))}
            </div>
          </List>
        </Col>
      </Row>
    );
  }
}

export default DragDropRoles;
