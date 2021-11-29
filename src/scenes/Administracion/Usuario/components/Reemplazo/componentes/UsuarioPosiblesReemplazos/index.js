import React, { Component } from 'react';
import { Row, Col, List, Icon, Button, Checkbox } from 'antd';

import './styles.css';

const obtenerCargo = (lista, valor) => lista.filter(cargo => cargo.pkCrgCargo === valor);

class UsuarioDragDrop extends Component {
  componentDidMount() {
    const { actualizarMargenes } = this.props;
    window.addEventListener('resize', actualizarMargenes('Reemplazo'));
  }

  render() {
    const {
      listarCargo,
      posiblesReemplazos,
      reemplazosSeleccionados,
      handleDeleteDragDropReemplazo,
      actualizarMargenes,
      reemplazosCheckbox,
      checkboxReemplazos,
      loadingEliminarReemplazo,
      setearSeleccionadosCheckboxReemplazos
    } = this.props;

    return (
      <Row gutter={16} className="container-drag">
        <Col xs={24} sm={24} md={11} lg={11} xl={11}>
          <List
            size="small"
            bordered
            className="scroll-reemplazo"
            scroll={{ x: '120%' }}
            header={
              <Row className="header">
                <Col xs={24} sm={24} md={24} lg={24} xl={24} className="alineacion">
                  <span className="common">POSIBLES REEMPLAZOS</span>
                </Col>
              </Row>
            }
          >
            <div id="droppable" className="scroll">
              {posiblesReemplazos.map((posible, index) => (
                <List.Item className="posible" key={posible.crgPersona}>
                  <Col xs={1} sm={1} md={1} lg={1} xl={1} style={{ marginRight: '18px', marginLeft: '2px' }}>
                    <Checkbox
                      value={posible.crgPersona}
                      onChange={e => checkboxReemplazos(e, reemplazosCheckbox, 'candidatos')}
                    />
                  </Col>
                  <Col xs={9} sm={10} md={9} lg={9} xl={10} className="posible" style={{ marginRight: '13px' }}>
                    {posible.nombres} {posible.apePaterno} {posible.apeMaterno}
                  </Col>
                  <Col xs={6} sm={7} md={7} lg={6} xl={6} className="posible" style={{ marginRight: '10px' }}>
                    {posible.dscCargo}
                  </Col>
                  <Col xs={4} sm={5} md={4} lg={4} xl={4} className="posible">
                    {posible.crgEquipo ? `Equipo ${posible.crgEquipo}` : `-`}
                  </Col>
                </List.Item>
              ))}
            </div>
          </List>
        </Col>
        <Col xs={24} sm={24} md={2} lg={2} xl={2} type="flex" align="middle">
          <Button
            type="primary"
            onClick={() =>
              setearSeleccionadosCheckboxReemplazos(
                'reemplazosElegidos',
                reemplazosCheckbox,
                posiblesReemplazos,
                reemplazosSeleccionados
              )
            }
            disabled={
              (reemplazosCheckbox.length > 0 &&
                reemplazosSeleccionados.some(seleccionado => reemplazosCheckbox.includes(seleccionado.crgPersona))) ||
              reemplazosCheckbox.length <= 0
            }
            style={{ marginRight: '2px' }}
          >
            <Icon type={actualizarMargenes('Reemplazo')[0]} />
          </Button>
          <Button
            type="primary"
            onClick={() =>
              setearSeleccionadosCheckboxReemplazos(
                'candidatos',
                reemplazosCheckbox,
                posiblesReemplazos,
                reemplazosSeleccionados
              )
            }
            disabled={
              (reemplazosCheckbox.length > 0 &&
                posiblesReemplazos.some(posible => reemplazosCheckbox.includes(posible.crgPersona))) ||
              reemplazosCheckbox.length <= 0
            }
            style={{ marginRight: '2px' }}
          >
            <Icon type={actualizarMargenes('Reemplazo')[1]} />
          </Button>
        </Col>
        <Col xs={24} sm={24} md={11} lg={11} xl={11}>
          <List
            size="small"
            bordered
            scroll={{ x: '120%' }}
            header={
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24} className="alineacion">
                  <span className="common">REEMPLAZOS SELECCIONADOS</span>
                </Col>
              </Row>
            }
          >
            <div className="scroll">
              {reemplazosSeleccionados.map((seleccionado, index) => {
                return (
                  <List.Item className="posible" key={seleccionado.crgPersona}>
                    <Col xs={1} sm={1} md={1} lg={1} xl={1} style={{ marginRight: '18px', marginLeft: '2px' }}>
                      <Checkbox
                        value={seleccionado.crgPersona}
                        onChange={e => checkboxReemplazos(e, reemplazosCheckbox, 'reemplazosElegidos')}
                      />
                    </Col>
                    <Col xs={9} sm={9} md={10} lg={10} xl={8} className="posible" style={{ marginRight: '10px' }}>
                      {seleccionado.nombres} {seleccionado.apePaterno} {seleccionado.apeMaterno}
                    </Col>
                    <Col xs={5} sm={6} md={7} lg={5} xl={6} className="posible" style={{ marginRight: '10px' }}>
                      {obtenerCargo(listarCargo, seleccionado.crgCargo) &&
                        obtenerCargo(listarCargo, seleccionado.crgCargo).length > 0 &&
                        obtenerCargo(listarCargo, seleccionado.crgCargo)[0].dscCargo}
                    </Col>
                    <Col xs={4} sm={4} md={4} lg={4} xl={4} className="posible">
                      {seleccionado.crgEquipo ? `Equipo ${seleccionado.crgEquipo}` : `-`}
                    </Col>
                    <Col xs={1} sm={1} md={1} lg={1} xl={1} className="posible">
                      <Button
                        loading={loadingEliminarReemplazo}
                        ghost
                        onClick={e => {
                          handleDeleteDragDropReemplazo(e, seleccionado);
                        }}
                        style={{ padding: '0px 0px 0px 15px' }}
                      >
                        <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '18px' }} />
                      </Button>
                    </Col>
                  </List.Item>
                );
              })}
            </div>
          </List>
        </Col>
      </Row>
    );
  }
}
export default UsuarioDragDrop;
