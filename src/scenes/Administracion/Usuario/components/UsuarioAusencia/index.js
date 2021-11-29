import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Form, Input, Select, Col, Row, DatePicker, Button, Icon, Modal, Spin } from 'antd';

import { isNullOrUndefined } from 'util';
import { CONSTANTS_APP } from 'constants/index';
import { ValidationMessage } from 'util/validation';

import { getObtenerPersona } from 'scenes/Administracion/data/obtenerPersona/reducer';

import * as crearAusenciaCreators from 'scenes/Administracion/data/crearAusencia/action';
import * as eliminarAusenciaCreators from 'scenes/Administracion/data/eliminarAusencia/action';
import * as actualizarAusenciaCreators from 'scenes/Administracion/data/actPersonaAusencia/action';

class UsuarioAusencia extends React.Component {
  guardarAusencia = async (modalSuccess, modalError) => {
    const {
      form: { validateFields },
      obtPersona,
      onOkForm,
      setearLoadingToFalse,
      arrayDeAusencias,
      crearAusencia,
      actualizarAusencia
    } = this.props;

    try {
      const value = await validateFields();

      const rangeValue = value['range-picker'];

      const objUsuarioYFecha = {
        value,
        fechaInicio: `${rangeValue[0].format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB)} 00:00:00`,
        fechaFin: `${rangeValue[1].format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB)} 23:59:59`
      };

      if (value.action === 'N') {
        const response = await crearAusencia(objUsuarioYFecha, obtPersona);
        if (response && response.code === 'CRG-000') {
          modalSuccess('Se creó la ausencia satisfactoriamente', response.message, onOkForm);
        } else {
          modalError('Ocurrió un error al crear la ausencia', response.message, 'Cerrar', onOkForm);
        }
      } else if (value.action === 'U') {
        const response = await actualizarAusencia(
          objUsuarioYFecha,
          obtPersona,
          arrayDeAusencias[0].pkCrgPersonaAusencia
        );
        if (response && response.code === 'CRG-000') {
          modalSuccess('Se actualizó la ausencia satisfactoriamente', response.message, onOkForm);
        } else {
          modalError('Ocurrió un error al actualizar la ausencia', response.message, 'Cerrar', onOkForm);
        }
      }
    } catch (err) {
      modalError(CONSTANTS_APP.GENERIC_ERROR_MESSAGE, err.message, 'Cerrar', onOkForm);
    } finally {
      setearLoadingToFalse();
    }
  };

  eliminarAusencia = async (modalSuccess, modalError) => {
    const { eliminarAusencia, onOkForm, setearLoadingToFalse, arrayDeAusencias } = this.props;

    try {
      const response = await eliminarAusencia(arrayDeAusencias[0].pkCrgPersonaAusencia);
      if (response && response.code === 'CRG-000') {
        modalSuccess('Se eliminó la ausencia satisfactoriamente', response.message, onOkForm);
      } else {
        modalError('Ocurrió un error al eliminar la ausencia', response.message, 'Cerrar', onOkForm);
      }
    } catch (err) {
      modalError(CONSTANTS_APP.GENERIC_ERROR_MESSAGE, err.message, 'Cerrar', onOkForm);
    } finally {
      setearLoadingToFalse();
    }
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      modalAgregarAusencia,
      modalAusencia,
      handleCancelarAusencia,
      selectedRow,
      arrayDeAusencias,
      teamsItems,
      cargoItems,
      obtPersona,
      obtReemplazos: { obtenerReemplazos },
      afterCloseAusencia,
      loadingAusencia
    } = this.props;

    const disabledDate = current => current && current < moment().endOf('day');

    const valorDeDatePicker = getFieldValue('range-picker');

    const modalError = (title, content, okText, onOk) =>
      Modal.error({
        title,
        content,
        okText,
        centered: true,
        onOk: () => onOk()
      });

    const modalSuccess = (title, content, onOk) =>
      Modal.success({
        title,
        content,
        centered: true,
        okText: 'Aceptar',
        onOk: () => onOk()
      });

    return (
      <React.Fragment>
        <Button
          onClick={modalAgregarAusencia}
          style={{ textAlign: 'right', marginRight: '10px', marginTop: '10px' }}
          disabled={
            !(
              selectedRow &&
              selectedRow.length > 0 &&
              obtenerReemplazos &&
              obtenerReemplazos.length > 0 &&
              obtPersona[0] &&
              obtPersona[0].tipoUsuario.some(rol => rol.idTipo === 'ES' || rol.idTipo === 'APROB')
            ) ||
            (selectedRow && selectedRow[0] && selectedRow[0].indActivo && selectedRow[0].indActivo === 'N')
          }
        >
          Ausencia
          <Icon type="user-add" />
        </Button>
        <Modal
          width="900px"
          visible={modalAusencia}
          onCancel={handleCancelarAusencia}
          destroyOnClose
          footer={[
            <Button key="cancelar" onClick={handleCancelarAusencia}>
              Cancelar
            </Button>,
            <Button
              key="guardar"
              type="primary"
              onClick={() => this.guardarAusencia(modalSuccess, modalError)}
              disabled={!(selectedRow && selectedRow.length > 0 && valorDeDatePicker && valorDeDatePicker.length > 0)}
            >
              Guardar
            </Button>,
            <Button
              key="eliminar"
              type="primary"
              onClick={() => this.eliminarAusencia(modalSuccess, modalError)}
              disabled={
                !(
                  selectedRow &&
                  selectedRow.length > 0 &&
                  arrayDeAusencias.length > 0 &&
                  valorDeDatePicker &&
                  valorDeDatePicker.length > 0 &&
                  moment(valorDeDatePicker[0]._d)
                    .format()
                    .slice(0, 10) === arrayDeAusencias[0].fecIniAusencia.slice(0, 10) &&
                  moment(valorDeDatePicker[1]._d)
                    .format()
                    .slice(0, 10) === arrayDeAusencias[0].fecFinAusencia.slice(0, 10) &&
                  ((new Date(arrayDeAusencias[0].fecIniAusencia.slice(0, 10)).getTime() >
                    new Date(moment().format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB)).getTime() &&
                    new Date(arrayDeAusencias[0].fecFinAusencia.slice(0, 10)).getTime() >
                      new Date(moment().format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB)).getTime()) ||
                    (new Date(arrayDeAusencias[0].fecIniAusencia.slice(0, 10)).getTime() <
                      new Date(moment().format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB)).getTime() &&
                      new Date(arrayDeAusencias[0].fecFinAusencia.slice(0, 10)).getTime() <
                        new Date(moment().format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB)).getTime()))
                )
              }
            >
              Eliminar
            </Button>
          ]}
          afterClose={() => afterCloseAusencia()}
        >
          <Form>
            <h2>Ausencia</h2>
            <Spin spinning={loadingAusencia}>
              <Row gutter={24}>
                {getFieldDecorator('idUsuario', {
                  initialValue: (selectedRow && selectedRow[0] && selectedRow[0].crgPersona) || undefined
                })(<Input type="hidden" />)}
                {getFieldDecorator('key', {
                  initialValue: !isNullOrUndefined(selectedRow) ? selectedRow.key : undefined
                })(<Input type="hidden" />)}
                {getFieldDecorator('action', {
                  initialValue: (arrayDeAusencias && arrayDeAusencias.length > 0 && 'U') || 'N'
                })(<Input type="hidden" />)}
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item label="Nombre(s) y Apellidos">
                    {getFieldDecorator('nombreAusencia', {
                      initialValue:
                        (selectedRow && selectedRow[0] && selectedRow[0].nombre) ||
                        (selectedRow &&
                          selectedRow[0] &&
                          `${selectedRow[0].nombres} ${selectedRow[0].apePaterno} ${selectedRow[0].apeMaterno}`)
                    })(<Input id="nom" placeholder="Ingrese nombre(s)" maxLength={100} disabled />)}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item label="E-Mail">
                    {getFieldDecorator('emailAusencia', {
                      initialValue: selectedRow && selectedRow[0] && selectedRow[0].email
                    })(<Input id="ema" placeholder="Ingrese e-mail" maxLength={100} disabled />)}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item label="Cargo">
                    {getFieldDecorator('cargoAusencia', {
                      initialValue:
                        (selectedRow && selectedRow[0] && selectedRow[0].cargo) ||
                        (selectedRow && selectedRow[0] && selectedRow[0].crgCargo)
                    })(
                      <Select placeholder="Seleccione cargo" disabled>
                        {cargoItems}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item label="Equipo">
                    {getFieldDecorator('equipoAusencia', {
                      initialValue:
                        (selectedRow && selectedRow[0] && selectedRow[0].equipo) ||
                        (selectedRow && selectedRow[0] && selectedRow[0].crgEquipo)
                    })(
                      <Select placeholder="Seleccione equipo" disabled>
                        {teamsItems}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                  <Form.Item label="Rango de fechas">
                    {getFieldDecorator('range-picker', {
                      initialValue:
                        arrayDeAusencias && arrayDeAusencias[0]
                          ? [
                              moment(arrayDeAusencias[0].fecIniAusencia.slice(0, 10)),
                              moment(arrayDeAusencias[0].fecFinAusencia.slice(0, 10))
                            ]
                          : null,
                      rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                    })(
                      <DatePicker.RangePicker
                        format={CONSTANTS_APP.FORMAT_DATE}
                        disabled={selectedRow && selectedRow.length <= 0}
                        disabledDate={disabledDate}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Spin>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const obtenerPersona = getObtenerPersona(state);
  return {
    obtenerPersona: obtenerPersona.obtenerPersona,
    loadingObtenerPersonao: obtenerPersona.isLoading
  };
};

const mapDispatchToProps = dispatch => ({
  crearAusencia: (obj, persona) => dispatch(crearAusenciaCreators.fetchCrearAusencia(obj, persona)),

  actualizarAusencia: (obj, persona, pkAusencia) =>
    dispatch(actualizarAusenciaCreators.fetchActualizarPersonaAusencia(obj, persona, pkAusencia)),

  eliminarAusencia: pkAusencia => dispatch(eliminarAusenciaCreators.fetchEliminarAusencia(pkAusencia))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(UsuarioAusencia));
