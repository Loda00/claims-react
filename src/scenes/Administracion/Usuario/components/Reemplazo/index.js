import React from 'react';
import { connect } from 'react-redux';
import { Form, Select, Col, Row, Button, Input, Modal, Spin } from 'antd';

import { isNullOrUndefined } from 'util';
import { CONSTANTS_APP } from 'constants/index';

import { getObtenerPersona } from 'scenes/Administracion/data/obtenerPersona/reducer';

import * as obtenerPersonaCreators from 'scenes/Administracion/data/obtenerPersona/action';
import * as eliminarReemplazoCreators from 'scenes/Administracion/data/eliminarReemplazo/action';
import * as crearActualizarReemplazoCreators from 'scenes/Administracion/data/crearActualizarReemplazo/action';

import UsuarioDragDrop from 'scenes/Administracion/Usuario/components/Reemplazo/componentes/UsuarioPosiblesReemplazos/index';

const UsuarioReemplazo = props => {
  const {
    cargoItems,
    teamsItems,
    listarCargo,
    selectedRow,
    obtenerPersona,
    modalReemplazo,
    loadingReemplazo,
    actualizarMargenes,
    checkboxReemplazos,
    reemplazosCheckbox,
    posiblesReemplazos,
    modalReplaceVisible,
    dataForFormReemplazo,
    reemplazosSeleccionados,
    handleCancelarReemplazo,
    despuesDeCerrarReemplazos,
    handleDeleteDragDropReemplazo,
    dataForFormReemplazo: { crgCargo },
    setearSeleccionadosCheckboxReemplazos,
    form: { getFieldDecorator },
    crearActualizarReemplazo,
    handleReemplazoOK,
    form: { validateFields },
    eliminarReemplazo,
    loadingEliminarReemplazo
  } = props;

  const guardandoReemplazo = async (values, filaSeleccionada, modalSuccess, modalError) => {
    try {
      const response = await crearActualizarReemplazo(values, filaSeleccionada);
      if (response && response.code === 'CRG-000') {
        modalSuccess('Se guardó el/los reemplazo(s) satisfactoriamente', response.message, handleReemplazoOK);
      } else {
        modalError('Error al guardar reemplazo', response.message);
      }
    } catch (e) {
      modalError(CONSTANTS_APP.GENERIC_ERROR_MESSAGE, e.message);
    }
  };

  const manejadorOKenReemplazoAgregarOrEditar = async (modalSuccess, modalError) => {
    if (reemplazosSeleccionados.length > 0) {
      const values = await validateFields();
      await guardandoReemplazo(values, selectedRow, modalSuccess, modalError);
    } else {
      try {
        const response = await eliminarReemplazo(selectedRow[0].crgPersona);
        if (response && response.code === 'CRG-000') {
          modalSuccess('Se guardó el/los reemplazo(s) satisfactoriamente', response.message, handleReemplazoOK);
        } else {
          modalError('Error al guardar reemplazo', response.message);
        }
      } catch (e) {
        modalError(CONSTANTS_APP.GENERIC_ERROR_MESSAGE, e.message);
      }
    }
  };

  const modalError = (title, content) =>
    Modal.error({
      title,
      content,
      centered: true,
      okText: 'Cerrar'
    });

  const modalSuccess = (title, content, onOk) =>
    Modal.success({
      title,
      content,
      okText: 'Aceptar',
      onOk: () => onOk(),
      centered: true
    });

  return (
    <React.Fragment>
      <Button
        type="primary"
        onClick={modalReemplazo}
        style={{ textAlign: 'right', marginRight: '10px', marginTop: '10px' }}
        disabled={
          !(
            selectedRow &&
            selectedRow.length > 0 &&
            obtenerPersona[0] &&
            obtenerPersona[0].tipoUsuario.some(
              rol => rol.idTipo === 'ES' || rol.idTipo === 'APROB' || rol.idTipo === 'PRAC'
            )
          ) ||
          (selectedRow && selectedRow[0] && selectedRow[0].indActivo && selectedRow[0].indActivo === 'N') ||
          false
        }
      >
        Reemplazo
      </Button>
      <Modal
        width="900px"
        visible={modalReplaceVisible}
        cancelText="Cancelar"
        onCancel={handleCancelarReemplazo}
        okText="Guardar"
        onOk={() => manejadorOKenReemplazoAgregarOrEditar(modalSuccess, modalError)}
        okButtonProps={{ disabled: selectedRow && selectedRow.length <= 0 /* || reemplazosSeleccionados <= 0 */ }}
        afterClose={despuesDeCerrarReemplazos}
        destroyOnClose
      >
        <h2>Reemplazo</h2>
        <Spin spinning={loadingReemplazo}>
          <Form>
            <Row gutter={24}>
              {getFieldDecorator('idReemplazo', {
                initialValue: (selectedRow[0] && selectedRow[0].pkPersona) || undefined
              })(<Input type="hidden" />)}
              {getFieldDecorator('key', {
                initialValue: !isNullOrUndefined(selectedRow[0]) ? selectedRow[0].key : undefined
              })(<Input type="hidden" />)}
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <Form.Item label="Nombre(s)">
                  {getFieldDecorator('nombreReemplazoUsuario', {
                    initialValue: selectedRow[0] && dataForFormReemplazo && dataForFormReemplazo.nombres
                  })(<Input disabled id="nom" maxLength={100} placeholder="Ingrese nombre(s)" />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <Form.Item label="Apellido Paterno">
                  {getFieldDecorator('apellidoPaternoUsuario', {
                    initialValue: selectedRow[0] && dataForFormReemplazo && dataForFormReemplazo.apePaterno
                  })(<Input disabled id="pat" maxLength={100} placeholder="Ingrese apellido paterno" />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <Form.Item label="Apellido Materno">
                  {getFieldDecorator('apellidoMaternoUsuario', {
                    initialValue: selectedRow[0] && dataForFormReemplazo && dataForFormReemplazo.apeMaterno
                  })(<Input disabled id="mat" maxLength={100} placeholder="Ingrese apellido materno" />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <Form.Item label="E-Mail">
                  {getFieldDecorator('emailUsuario', {
                    initialValue: selectedRow[0] && dataForFormReemplazo && dataForFormReemplazo.email
                  })(<Input id="ema" disabled maxLength={100} placeholder="Ingrese e-mail" />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <Form.Item label="Cargo">
                  {getFieldDecorator('cargoUsuario', {
                    initialValue: selectedRow[0] && dataForFormReemplazo && dataForFormReemplazo.desCargo
                  })(
                    <Select placeholder="Seleccione cargo" disabled>
                      {cargoItems}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <Form.Item label="Equipo">
                  {getFieldDecorator('equipoUsuario', {
                    initialValue:
                      selectedRow[0] &&
                      dataForFormReemplazo &&
                      (crgCargo && (crgCargo === 1 || crgCargo === 2 || crgCargo === 3)
                        ? 'Todos'
                        : dataForFormReemplazo.desEquipo)
                  })(
                    <Select placeholder="Seleccione equipo" disabled>
                      {teamsItems}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item>
                  {getFieldDecorator('posiblesReemplazos', {
                    initialValue: reemplazosSeleccionados
                  })(
                    <UsuarioDragDrop
                      listarCargo={listarCargo}
                      posiblesReemplazos={posiblesReemplazos}
                      actualizarMargenes={actualizarMargenes}
                      checkboxReemplazos={checkboxReemplazos}
                      reemplazosCheckbox={reemplazosCheckbox}
                      reemplazosSeleccionados={reemplazosSeleccionados}
                      loadingEliminarReemplazo={loadingEliminarReemplazo}
                      handleDeleteDragDropReemplazo={handleDeleteDragDropReemplazo}
                      setearSeleccionadosCheckboxReemplazos={setearSeleccionadosCheckboxReemplazos}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  const obtenerPersona = getObtenerPersona(state);
  return {
    obtenerPersona: obtenerPersona.obtenerPersona,
    loadingObtenerPersonao: obtenerPersona.isLoading
  };
};

const mapDispatchToProps = dispatch => ({
  dispatchObtPersona: valor => dispatch(obtenerPersonaCreators.fetchObtenerPersona(valor)),

  eliminarReemplazo: persona => dispatch(eliminarReemplazoCreators.fetchEliminarReemplazo(persona)),

  crearActualizarReemplazo: (values, filaSeleccionada) =>
    dispatch(crearActualizarReemplazoCreators.fetchCrearActualizarReemplazo(values, filaSeleccionada))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(UsuarioReemplazo));
