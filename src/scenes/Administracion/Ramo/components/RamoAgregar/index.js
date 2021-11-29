import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, notification, Modal } from 'antd';
import { ValidationMessage } from 'util/validation';
import { hasErrors, showErrorMessage } from 'util/index';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
import { getMantenimientoRamo } from 'scenes/Administracion/Ramo/data/mantenerRamo/reducer';
import * as mantenimientoRamoCreators from 'scenes/Administracion/Ramo/data/mantenerRamo/action';
import * as listarRamoCreators from 'scenes/Administracion/data/listarRamo/action';

class RamoAgregar extends React.Component {
  async componentDidMount() {
    const {
      dispatch,
      form: { validateFields }
    } = this.props;
    validateFields();

    try {
      await dispatch(listarRamoCreators.fetchListRamos(null, null));
    } catch (e) {
      showErrorMessage(e);
    }
  }

  handleLimpiar = () => {
    const {
      form: { resetFields }
    } = this.props;

    resetFields();
  };

  handleModificarOK = async () => {
    const {
      dispatch,
      form: { getFieldValue },
      limpiarForm,
      handleCancelar,
      dataRamos
    } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.MODIFICAR;
    const codMtrRamo = getFieldValue('codigoRamo');
    const valorMtrRamo = getFieldValue('ramo');
    const dscMtrRamo = valorMtrRamo.trim();

    const yaExistelRamo = dataRamos.filter(
      item => item.ramo.replace(/ /g, '') === dscMtrRamo.toUpperCase().replace(/ /g, '')
    );

    const yaExistelRamoBool = yaExistelRamo.length > 0;

    if (!yaExistelRamoBool) {
      try {
        const response = await dispatch(
          mantenimientoRamoCreators.fetchMantenimientoRamo(accion, codMtrRamo, dscMtrRamo)
        );
        const mensaje = response.code === 'CRG-000';
        if (mensaje) {
          Modal.success({
            title: 'Modificar ramo',
            content: (
              <div>
                <p>
                  {response.message}{' '}
                  <strong>
                    {codMtrRamo}
                    <strong> - </strong>
                    {dscMtrRamo}
                  </strong>{' '}
                </p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Modificar ramo',
            content: (
              <div>
                <p>
                  Error al modificar ramo{' '}
                  <strong>
                    {codMtrRamo}
                    <strong> - </strong>
                    {dscMtrRamo}
                  </strong>
                </p>
              </div>
            )
          });
        }
      } catch (e) {
        showErrorMessage(e);
      }
    } else {
      Modal.warning({
        title: 'Mantenedor ramo',
        content: (
          <div>
            <p>
              No modificó o ya está registrado ramo <strong>{dscMtrRamo}</strong>.
            </p>
          </div>
        )
      });
    }
  };

  handleAgregarOK = async () => {
    const {
      dispatch,
      form: { getFieldValue },
      limpiarForm,
      handleCancelar,
      dataRamos
    } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.NUEVO;
    const codMtrRamo = getFieldValue('codigoRamo');
    const valorMtrRamo = getFieldValue('ramo');
    const dscMtrRamo = valorMtrRamo.trim();

    const yaExisteCodRamo = dataRamos.filter(item => item.codigo === codMtrRamo.toUpperCase());
    const yaExistelRamo = dataRamos.filter(
      item => item.ramo.replace(/ /g, '') === dscMtrRamo.toUpperCase().replace(/ /g, '')
    );
    const yaExisteCodRamoBool = yaExisteCodRamo.length > 0;
    const yaExistelRamoBool = yaExistelRamo.length > 0;

    if (!yaExisteCodRamoBool && !yaExistelRamoBool) {
      try {
        const response = await dispatch(
          mantenimientoRamoCreators.fetchMantenimientoRamo(accion, codMtrRamo, dscMtrRamo)
        );
        const mensaje = response.code === 'CRG-000';
        if (mensaje) {
          Modal.success({
            title: 'Crear ramo',
            content: (
              <div>
                <p>
                  {response.message}{' '}
                  <strong>
                    {codMtrRamo}
                    <strong> - </strong>
                    {dscMtrRamo}
                  </strong>{' '}
                </p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Crear ramo',
            content: (
              <div>
                <p>
                  Error al crear ramo{' '}
                  <strong>
                    {codMtrRamo}
                    <strong> - </strong>
                    {dscMtrRamo}
                  </strong>
                </p>
              </div>
            )
          });
        }
      } catch (e) {
        showErrorMessage(e);
      }
    } else if (yaExisteCodRamoBool && yaExistelRamoBool) {
      Modal.warning({
        title: 'Mantenedor ramo',
        content: (
          <div>
            <p>
              El código <strong>{codMtrRamo}</strong> y ramo <strong>{dscMtrRamo}</strong> están registrados.
            </p>
          </div>
        )
      });
    } else if (yaExisteCodRamoBool) {
      Modal.warning({
        title: 'Mantenedor ramo',
        content: (
          <div>
            <p>
              El código <strong>{codMtrRamo}</strong> está vinculado al ramo <strong>{yaExisteCodRamo[0].ramo}</strong>.
            </p>
          </div>
        )
      });
    } else if (yaExistelRamoBool) {
      Modal.warning({
        title: 'Mantenedor ramo',
        content: (
          <div>
            <p>
              El ramo <strong>{dscMtrRamo}</strong> está registrado con el código{' '}
              <strong>{yaExistelRamo[0].codigo}</strong>.
            </p>
          </div>
        )
      });
    }
  };

  render() {
    const {
      datosModal,
      // mostrarModalCrearRamo,
      modalVisible,
      handleCancelar,
      titleModalAgregar,
      form,
      loadingGuardarRamo
    } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError } = form;
    const codigoError = isFieldTouched('codigoRamo') && getFieldError('codigoRamo');
    const ramoError = isFieldTouched('ramo') && getFieldError('ramo');

    return (
      <React.Fragment>
        <Modal
          visible={modalVisible}
          cancelText="Cancelar"
          onCancel={handleCancelar}
          okText="Agregar"
          onOk={titleModalAgregar === 'Agregar' ? this.handleAgregarOK : this.handleModificarOK}
          width="600px"
          okButtonProps={{ disabled: hasErrors(getFieldsError()) || loadingGuardarRamo }}
          // destroyOnClose
          maskClosable={false}
        >
          <Form>
            <h2>{titleModalAgregar === 'Agregar' ? 'Datos generales ramo' : 'Modificar ramo'}</h2>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                <Form.Item label="Código" validateStatus={codigoError ? 'error' : ''} help={codigoError || ''}>
                  {getFieldDecorator('codigoRamo', {
                    initialValue: datosModal ? datosModal.codigo : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        pattern: /^[A-Za-z0-9]*$/,
                        whitespace: true
                      },
                      {
                        required: !datosModal,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input disabled={!!datosModal} placeholder="Ingrese código" maxLength={10} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={18} xl={18}>
                <Form.Item label="Ramo" validateStatus={ramoError ? 'error' : ''} help={ramoError || ''}>
                  {getFieldDecorator('ramo', {
                    initialValue: datosModal ? datosModal.ramo : null,
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
                  })(<Input placeholder="Ingrese ramo" maxLength={100} />)}
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
  const guardarRamo = getMantenimientoRamo(state);
  return {
    guardarRamo,
    loadingGuardarRamo: guardarRamo.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims
  };
};

export default connect(mapStateToProps)(Form.create()(RamoAgregar));
