/* eslint-disable react/no-unused-state */
import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, Modal, Select, notification } from 'antd';
import { ValidationMessage } from 'util/validation';
import { hasErrors, showErrorMessage } from 'util/index';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
import { getMantenimientoCausa } from 'scenes/Administracion/Causas/data/mantenerCausa/reducer';
import * as mantenimientoCausaCreators from 'scenes/Administracion/Causas/data/mantenerCausa/action';
import * as listarCausasCreators from 'scenes/Administracion/data/listarCausa/action';

class CausasAgregar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      causaInicial: null,
      ramoInicial: null
    };
  }

  async componentDidMount() {
    const {
      dispatch,
      form: { validateFields, getFieldValue }
    } = this.props;
    validateFields();

    await this.setState({
      causaInicial: getFieldValue('desCausa'),
      ramoInicial: getFieldValue('ramo')
    });

    try {
      await dispatch(listarCausasCreators.fetchListCausa());
    } catch (e) {
      showErrorMessage(e);
    }
  }

  handleButton = (touched, hasErrors, values) => {
    if (!values || (touched && hasErrors)) {
      return true;
    }
    return false;
  };

  handleAgregarOK = async () => {
    const {
      dispatch,
      form: { getFieldValue },
      limpiarForm,
      handleCancelar,
      dataCausas
    } = this.props;

    const accion = MANTENIMIENTO_ADMINISTRACION.NUEVO;
    const codCausa = getFieldValue('codigoCausa');
    const valorCausa = getFieldValue('desCausa');
    const codRamo = getFieldValue('ramo');
    const desCausa = valorCausa.trim();

    const ramoCausa = dataCausas.filter(
      item =>
        item.causa.replace(/ /g, '') === desCausa.toUpperCase().replace(/ /g, '') &&
        item.codRamo === codRamo.toUpperCase()
    );

    const existeRamoCausa = ramoCausa.length > 0;

    if (!existeRamoCausa) {
      try {
        const response = await dispatch(
          mantenimientoCausaCreators.fetchMantenimientoCausa(accion, null, codCausa, desCausa, codRamo)
        );
        const mensaje = response.code === 'CRG-000';

        if (mensaje) {
          Modal.success({
            title: 'Crear causa',
            content: (
              <div>
                <p>
                  {response.message}{' '}
                  <strong>
                    {codCausa.toUpperCase()}
                    <strong> - </strong>
                    {desCausa.toUpperCase()}
                  </strong>{' '}
                  - <strong>{codRamo.toUpperCase()}</strong>
                </p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Crear causa',
            content: (
              <div>
                <p>
                  Error al crear causa{' '}
                  <strong>
                    {codCausa.toUpperCase()}
                    <strong> - </strong>
                    {desCausa.toUpperCase()}
                  </strong>{' '}
                  - <strong>{codRamo.toUpperCase()}</strong>
                </p>
              </div>
            )
          });
        }
      } catch (e) {
        showErrorMessage(e);
      }
    } else if (existeRamoCausa) {
      Modal.warning({
        title: 'Mantenedor causa',
        content: (
          <div>
            <p>
              Ya existe la causa <strong>{desCausa}</strong> con ramo <strong>{codRamo}</strong>.
            </p>
          </div>
        )
      });
    }
  };

  handleModificarOK = async () => {
    const {
      dispatch,
      form: { getFieldValue },
      limpiarForm,
      datosModal,
      handleCancelar,
      dataCausas
    } = this.props;

    const { causaInicial, ramoInicial } = this.state;

    const accion = MANTENIMIENTO_ADMINISTRACION.MODIFICAR;
    const idMtrCausa = datosModal.idCausa || {};
    const codCausa = datosModal.codigo || {};
    const valorCausa = getFieldValue('desCausa');
    const codDscRamo = getFieldValue('ramo');
    const codRamo = codDscRamo.substring(0, 4);
    const desCausa = valorCausa.trim();

    const posibleRamoCausa = dataCausas.filter(
      item =>
        item.causa.replace(/ /g, '') === desCausa.toUpperCase().replace(/ /g, '') &&
        item.codRamo === codRamo.toUpperCase()
    );
    const existeRamoCausa = posibleRamoCausa.length > 0;

    if (!existeRamoCausa) {
      try {
        const response = await dispatch(
          mantenimientoCausaCreators.fetchMantenimientoCausa(accion, idMtrCausa, codCausa, desCausa, codRamo)
        );
        const mensaje = response.code === 'CRG-000';
        if (mensaje) {
          Modal.success({
            title: 'Modificar causa',
            content: (
              <div>
                <p>
                  {response.message}{' '}
                  <strong>
                    {codCausa.toUpperCase()}
                    <strong> - </strong>
                    {desCausa.toUpperCase()}
                  </strong>
                </p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Modificar causa',
            content: (
              <div>
                <p>
                  Error al modificar causa{' '}
                  <strong>
                    {codCausa.toUpperCase()}
                    <strong> - </strong>
                    {desCausa.toUpperCase()}
                  </strong>
                </p>
              </div>
            )
          });
        }
      } catch (e) {
        showErrorMessage(e);
      }
    } else if (existeRamoCausa) {
      Modal.warning({
        title: 'Mantenedor causa',
        content: (
          <div>
            <p>
              No modificó o ya existe la causa <strong>{desCausa}</strong> con ramo <strong>{codRamo}</strong>.
            </p>
          </div>
        )
      });
    }
  };

  render() {
    const {
      ramosItems,
      form,
      mostrarModalCrearCausa,
      modalVisible,
      handleCancelar,
      titleModalAgregar,
      datosModal,
      loadingListarRamo,
      loadingGuardarCausa
    } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError } = form;

    const codigoError = isFieldTouched('codigoCausa') && getFieldError('codigoCausa');
    const desCausaError = isFieldTouched('desCausa') && getFieldError('desCausa');
    const ramoError = isFieldTouched('ramo') && getFieldError('ramo');

    return (
      <React.Fragment>
        <Modal
          visible={modalVisible}
          cancelText="Cancelar"
          onCancel={handleCancelar}
          okText="Agregar"
          onOk={titleModalAgregar === 'Agregar' ? this.handleAgregarOK : this.handleModificarOK}
          width="900px"
          okButtonProps={{ disabled: hasErrors(getFieldsError()) || loadingGuardarCausa }}
          destroyOnClose
          maskClosable={false}
        >
          <Form>
            <h2>{titleModalAgregar === 'Agregar' ? 'Datos generales causa' : 'Modificar causa'}</h2>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={4} lg={4} xl={4}>
                <Form.Item label="Código" validateStatus={codigoError ? 'error' : ''} help={codigoError || ''}>
                  {getFieldDecorator('codigoCausa', {
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
                <Form.Item label="Causa" validateStatus={desCausaError ? 'error' : ''} help={desCausaError || ''}>
                  {getFieldDecorator('desCausa', {
                    initialValue: datosModal ? datosModal.causa : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[0-9a-zA-Z,ÑñáéíóúÁÉÍÓÚ/() ]*$/
                        // pattern: /^[A-Za-z]*$/
                      },
                      {
                        required: true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input placeholder="Ingrese causa" maxLength={300} />)}
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
  const guardarCausa = getMantenimientoCausa(state);
  return {
    guardarCausa,
    loadingGuardarCausa: guardarCausa.isLoading,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims
  };
};

export default connect(mapStateToProps)(Form.create()(CausasAgregar));
