import React, { Component } from 'react';
import { Row, Col, List, Icon, Checkbox, Button } from 'antd';

class AgregarRamo extends Component {
  componentDidMount() {
    const { actualizarMargenes } = this.props;
    window.addEventListener('resize', actualizarMargenes('Agregar'));
  }

  render() {
    const {
      onDrop,
      onDragOver,
      onDragStart,
      onDragEnter,
      handleDeleteDragDrop,
      tipoPersona,
      checkboxRoles,
      setearSeleccionadosCheckbox,
      rolesCheckbox,
      actualizarMargenes,
      listarRamo,
      itemsRamos,
      editarUsuario,
      items,
      selected
    } = this.props;

    return (
      <Row gutter={16} className="container-drag">
        <Col xs={24} sm={11} md={11} lg={11} xl={11}>
          <List
            size="small"
            bordered
            header={
              <Row className="header">
                <Col xs={24} sm={24} md={24} lg={24} xl={24} className="alineacion">
                  <span className="common">RAMOS</span>
                </Col>
              </Row>
            }
          >
            <div
              id="droppable"
              className="scroll"
              onDragOver={e => onDragOver(e)}
              onDrop={e => {
                onDrop(e, 'posibles');
              }}
            >
              {items.map((item, index) => (
                <List.Item key={item.codRamo}>
                  <Col xs={2} sm={3} md={3} lg={2} xl={2}>
                    <Checkbox
                      value={item.codRamo}
                      style={{ marginRight: '15px' }}
                      onChange={e => checkboxRoles(e, items, rolesCheckbox, 'posibles')}
                    />
                  </Col>
                  <Col
                    xs={22}
                    sm={21}
                    md={21}
                    lg={22}
                    xl={22}
                    key={item.codRamo}
                    onDragStart={e => onDragStart(e, item, index)}
                    onDragEnter={() => onDragEnter(item, index)}
                    draggable
                    className="draggable"
                  >
                    {`${item.codRamo} - ${item.dscRamo}`}
                  </Col>
                </List.Item>
              ))}
            </div>
          </List>
        </Col>
        <Col xs={24} sm={2} md={2} lg={2} xl={2} type="flex" align="middle">
          <Button
            type="primary"
            onClick={() => setearSeleccionadosCheckbox('seleccionados', rolesCheckbox, items, selected)}
            style={{ marginRight: '2px' }}
            // disabled={ rolesCheckbox.length > 0 && selected.some(seleccionado => rolesCheckbox.includes(seleccionado.codRamo))}
            disabled={
              !(rolesCheckbox.length > 0 && items.some(seleccionado => rolesCheckbox.includes(seleccionado.codRamo))) ||
              (rolesCheckbox.length > 0 &&
                selected.some(chec => rolesCheckbox.includes(chec.codRamo)) &&
                items.some(chec => rolesCheckbox.includes(chec.codRamo)))
            }
          >
            <Icon type={actualizarMargenes('Agregar')[0]} />
          </Button>
          <Button
            type="primary"
            onClick={() => setearSeleccionadosCheckbox('posibles', rolesCheckbox, items, selected)}
            style={{ marginRight: '2px' }}
            // disabled={ rolesCheckbox.length > 0 && items.some(seleccionado => rolesCheckbox.includes(seleccionado.codRamo))}
            disabled={
              !(
                rolesCheckbox.length > 0 && selected.some(seleccionado => rolesCheckbox.includes(seleccionado.codRamo))
              ) ||
              (rolesCheckbox.length > 0 &&
                selected.some(chec => rolesCheckbox.includes(chec.codRamo)) &&
                items.some(chec => rolesCheckbox.includes(chec.codRamo)))
            }
          >
            <Icon type={actualizarMargenes('Agregar')[1]} />
          </Button>
        </Col>
        <Col xs={24} sm={11} md={11} lg={11} xl={11}>
          <List
            size="small"
            bordered
            header={
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} className="alineacion">
                  <span className="common">RAMOS SELECCIONADOS</span>
                </Col>
              </Row>
            }
          >
            <div className="scroll" onDragOver={e => onDragOver(e)} onDrop={e => onDrop(e, 'seleccionados')}>
              {selected.map((item, index) => (
                <List.Item className="item" key={item.codRamo}>
                  <Row>
                    <Col xs={2} sm={3} md={2} lg={2} xl={2}>
                      <Checkbox
                        style={{ marginRight: '15px' }}
                        value={item.codRamo}
                        onChange={e => checkboxRoles(e, items, rolesCheckbox, 'seleccionados')}
                      />
                    </Col>
                    <Col
                      xs={19}
                      sm={17}
                      md={19}
                      lg={19}
                      xl={19}
                      key={item.codRamo}
                      onDragStart={e => onDragStart(e, item, index)}
                      onDragEnter={() => onDragEnter(item, index)}
                      draggable
                      className="draggable"
                    >
                      {`${item.codRamo} - ${item.dscRamo}`}
                    </Col>
                    <Col xs={3} sm={3} md={3} lg={3} xl={3}>
                      <Icon
                        type="delete"
                        theme="filled"
                        style={{ color: 'red', fontSize: '18px' }}
                        onClick={e => handleDeleteDragDrop(e, item, tipoPersona)}
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

export default AgregarRamo;
