import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, notification, Modal, Select } from 'antd';
import { ValidationMessage } from 'util/validation';
import { hasErrors, showErrorMessage } from 'util/index';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
import { getMantenimientoConsecuencia } from 'scenes/Administracion/Consecuencias/data/mantenerConsecuencia/reducer';
import * as mantenimientoConsecuenciaCreators from 'scenes/Administracion/Consecuencias/data/mantenerConsecuencia/action';

class ConsecuenciasAgregar extends React.Component {
  componentDidMount() {
    const {
      form: { validateFields }
    } = this.props;
    validateFields();
  }

  handleButton = (touched, hasErrors, values) => {
    if (!values || (touched && hasErrors)) {
      return true;
    }
    return false;
  };

  handleLimpiar = () => {
    const {
      form: { resetFields }
    } = this.props;

    resetFields();
  };

  handleAgregarOk = async () => {
    const {
      dispatch,
      form: { getFieldValue },
      limpiarForm,
      handleCancelar,
      dataConsecuencia
    } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.NUEVO;
    const codMtrConsecuencia = getFieldValue('codigo');
    const valorMtrConsecuencia = getFieldValue('consecuencia');
    const codMtrRamo = getFieldValue('ramo');

    const dscMtrConsecuencia = valorMtrConsecuencia.trim();
    // const codMtrRamo = codDscRamo.substring(0,4);

    const yaExisteRamoCons = dataConsecuencia.filter(
      item =>
        item.consecuencia.replace(/ /g, '') === dscMtrConsecuencia.toUpperCase().replace(/ /g, '') &&
        item.codRamo === codMtrRamo.toUpperCase()
    );

    const yaExisteRamoConsBool = yaExisteRamoCons.length > 0;

    if (!yaExisteRamoConsBool) {
      try {
        const response = await dispatch(
          mantenimientoConsecuenciaCreators.fetchMantenimientoConsecuencia(
            accion,
            null,
            codMtrConsecuencia,
            dscMtrConsecuencia,
            codMtrRamo
          )
        );
        const mensaje = response.code === 'CRG-000';
        if (mensaje) {
          Modal.success({
            title: 'Crear consecuencia',
            content: (
              <div>
                <p>
                  {response.message}{' '}
                  <strong>
                    {codMtrConsecuencia.toUpperCase()}
                    <strong> - </strong>
                    {dscMtrConsecuencia.toUpperCase()}
                  </strong>
                </p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Crear consecuencia',
            content: (
              <div>
                <p>
                  Error al crear causa{' '}
                  <strong>
                    {codMtrConsecuencia.toUpperCase()}
                    <strong> - </strong>
                    {dscMtrConsecuencia.toUpperCase()}
                  </strong>
                </p>
              </div>
            )
          });
        }
      } catch (e) {
        showErrorMessage(e);
      }
    } else if (yaExisteRamoConsBool) {
      Modal.warning({
        title: 'Mantenedor consecuencia',
        content: (
          <div>
            <p>
              Ya existe la consecuencia <strong>{dscMtrConsecuencia}</strong> - <strong>{codMtrRamo}</strong>
            </p>
          </div>
        )
      });
    }
  };

  handleModificarOk = async () => {
    const {
      dispatch,
      form: { getFieldValue },
      limpiarForm,
      datosModal,
      handleCancelar,
      dataConsecuencia
    } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.MODIFICAR;
    const idMtrConsecuencia = datosModal.idConsecuencia || {};
    const codMtrConsecuencia = datosModal.codigo || {};
    const dscMtrConsecuencia = getFieldValue('consecuencia');
    const codDscRamo = getFieldValue('ramo');
    const codMtrRamo = codDscRamo.substring(0, 4);

    const yaExisteRamoCons = dataConsecuencia.filter(
      item =>
        item.consecuencia.replace(/ /g, '') === dscMtrConsecuencia.toUpperCase().replace(/ /g, '') &&
        item.codRamo === codMtrRamo.toUpperCase()
    );
    const yaExisteRamoConsBool = yaExisteRamoCons.length > 0;

    if (!yaExisteRamoConsBool) {
      try {
        const response = await dispatch(
          mantenimientoConsecuenciaCreators.fetchMantenimientoConsecuencia(
            accion,
            idMtrConsecuencia,
            codMtrConsecuencia,
            dscMtrConsecuencia,
            codMtrRamo
          )
        );
        const mensaje = response.code === 'CRG-000';
        if (mensaje) {
          Modal.success({
            title: 'Modificar consecuencia',
            content: (
              <div>
                <p>
                  {response.message}{' '}
                  <strong>
                    {codMtrConsecuencia.toUpperCase()}
                    <strong> - </strong>
                    {dscMtrConsecuencia.toUpperCase()}
                  </strong>
                </p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Modificar consecuencia',
            content: (
              <div>
                <p>
                  Error al modificar causa{' '}
                  <strong>
                    {codMtrConsecuencia.toUpperCase()}
                    <strong> - </strong>
                    {dscMtrConsecuencia.toUpperCase()}
                  </strong>
                </p>
              </div>
            )
          });
        }
      } catch (e) {
        showErrorMessage(e);
      }
    } else if (yaExisteRamoConsBool) {
      Modal.warning({
        title: 'Mantenedor consecuencia',
        content: (
          <div>
            <p>
              No modificó o ya existe la consecuencia <strong>{dscMtrConsecuencia}</strong> -{' '}
              <strong>{codMtrRamo}</strong>
            </p>
          </div>
        )
      });
    }
  };

  render() {
    const {
      form,
      mostrarModalCrearConsecuencia,
      modalVisible,
      handleCancelar,
      titleModalAgregar,
      ramosItems,
      datosModal,
      loadingListarRamo,
      loadingGuardarConsecuencia
    } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError } = form;
    const codigoError = isFieldTouched('codigo') && getFieldError('codigo');
    const consecuenciaError = isFieldTouched('consecuencia') && getFieldError('consecuencia');
    const ramoError = isFieldTouched('ramo') && getFieldError('ramo');

    return (
      <React.Fragment>
        <Modal
          visible={modalVisible}
          cancelText="Cancelar"
          onCancel={handleCancelar}
          okText="Agregar"
          onOk={titleModalAgregar === 'Agregar' ? this.handleAgregarOk : this.handleModificarOk}
          width="900px"
          okButtonProps={{ disabled: hasErrors(getFieldsError()) || loadingGuardarConsecuencia }}
          destroyOnClose
          maskClosable={false}
        >
          <Form>
            <h2>{titleModalAgregar === 'Agregar' ? 'Datos generales consecuencias' : 'Modificar consecuencia'}</h2>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={4} lg={4} xl={4}>
                <Form.Item label="Código" validateStatus={codigoError ? 'error' : ''} help={codigoError || ''}>
                  {getFieldDecorator('codigo', {
                    initialValue: datosModal ? datosModal.codigo : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[0-9]*$/
                        // pattern: /^[A-Za-z]*$/
                      },
                      {
                        required: !datosModal,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input disabled={!!datosModal} placeholder="Ingrese código" maxLength={3} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={10} xl={10}>
                <Form.Item
                  label="Consecuencia"
                  validateStatus={consecuenciaError ? 'error' : ''}
                  help={consecuenciaError || ''}
                >
                  {getFieldDecorator('consecuencia', {
                    initialValue: datosModal ? datosModal.consecuencia : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[0-9a-zA-Z,ÑñáéíóúÁÉÍÓÚ/() ]*$/
                      },
                      {
                        required: true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input placeholder="Ingrese consecuencia" maxLength={50} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={10} xl={10}>
                <Form.Item label="Ramo" validateStatus={ramoError ? 'error' : ''} help={ramoError || ''}>
                  {getFieldDecorator('ramo', {
                    initialValue: datosModal ? datosModal.ramo : null,
                    rules: [
                      {
                        required: true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Select
                      showSearch
                      loading={loadingListarRamo}
                      placeholder="Ingrese c&oacute;digo - ramo"
                      optionFilterProp="children"
                      filterOption={(inputValue, option) =>
                        option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                    >
                      {ramosItems}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const guardarConsecuencia = getMantenimientoConsecuencia(state);
  return {
    guardarConsecuencia,
    loadingGuardarConsecuencia: guardarConsecuencia.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims
  };
};

export default connect(mapStateToProps)(Form.create()(ConsecuenciasAgregar));
