import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, Modal, notification } from 'antd';
import { ValidationMessage } from 'util/validation';
import { hasErrors, showErrorMessage } from 'util/index';
import { getListAjustador } from 'scenes/Administracion/data/listarAjustador/reducer';
import AgregarRamo from 'scenes/Administracion/Ajustadores/components/AjustadorAgregar/components/agregarRamos';
import { isNullOrUndefined } from 'util';
import { MANTENIMIENTO_ADMINISTRACION } from 'constants/index';
// import { isEmpty } from 'lodash';
// import NumeroInput from 'components/numeroInput';
// import currency from 'currency.js';
import * as mantenimientoAjustadorCreator from 'scenes/Administracion/Ajustadores/data/mantenerAjustador/action';
import * as listarAjustadorCreators from 'scenes/Administracion/data/listarAjustador/action';
// import * as tipoDocumentoCreator from 'scenes/Administracion/Ajustadores/data/tipoDocumento/action';

class AjustadorAgregar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emailInicial: null
    };
  }

  async componentDidMount() {
    const {
      form: { validateFields, resetFields, getFieldValue },
      dispatch
    } = this.props;

    await this.setState({
      emailInicial: getFieldValue('emailAjustador')
    });

    try {
      await dispatch(listarAjustadorCreators.fetchListAjustador());
    } catch (e) {
      showErrorMessage(e);
    }

    resetFields();
    validateFields();
  }

  handleLimpiar = () => {
    const {
      form: { resetFields }
    } = this.props;

    resetFields();
  };

  validandoValoresDeCampos = error => {
    const errors = Object.keys(error).some(field => error[field]);
    const { selected } = this.props;

    if (!errors && selected.length) {
      // emailAjustador
      return false;
    }
    return true;
    // }
    // return disabled;
  };

  handleAgregarOK = async () => {
    const {
      dispatch,
      form: { getFieldValue },
      limpiarForm,
      handleCancelar,
      listarAjustador,
      selected
    } = this.props;

    const operacion = MANTENIMIENTO_ADMINISTRACION.NUEVO;
    const codAjustador = getFieldValue('codigoAjustador');
    const dscAjustador = getFieldValue('ajustadorMantenedor');
    const emailAjustador = getFieldValue('emailAjustador');
    const idCoreAjustador = getFieldValue('idCoreAjustador');
    // const listaRamo = getFieldValue("agregarRamoAjustador");
    const nomAjustador = dscAjustador.trim();
    // const ramos = listaRamo.map((item, index) => {
    const ramos = selected.map((item, index) => {
      return {
        key: index,
        codRamo: item.codRamo
      };
    });

    const dataAjus = listarAjustador.listarAjustador.map((item, index) => {
      return {
        key: index,
        codigo: item.codAjustador.toUpperCase(),
        ajustador: item.nombreAjustador.toUpperCase(),
        email: item.email ? item.email.toUpperCase() : null
      };
    });

    const yaExisteEmailAjus = dataAjus.filter(item => item.email === emailAjustador.toUpperCase());
    const yaExisteCodAjus = dataAjus.filter(item => item.codigo === codAjustador.toUpperCase());
    const existeAjustadorEmpresa = dataAjus.filter(item => item.ajustador === nomAjustador.toUpperCase());

    const yaExisteEmailAjusBool = yaExisteEmailAjus.length > 0;
    const yaExisteCodAjusBool = yaExisteCodAjus.length > 0;
    const yaExisteAjustadorEmpresa = existeAjustadorEmpresa.length > 0;

    if (!yaExisteEmailAjusBool && !yaExisteCodAjusBool && !yaExisteAjustadorEmpresa) {
      try {
        const response = await dispatch(
          mantenimientoAjustadorCreator.fetchMantenimientoAjustador(
            operacion,
            codAjustador,
            nomAjustador,
            emailAjustador,
            null,
            null,
            ramos,
            null,
            idCoreAjustador
          )
        );

        const mensaje = response && response.code === 'CRG-000';
        const emailDuplicado = response && response.code === 'CRG-200';

        if (mensaje) {
          Modal.success({
            title: 'Crear ajustador',
            content: (
              <div>
                <p>{response.message}</p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Crear ajustador',
            content: (
              <div>
                <p> {emailDuplicado ? response.message : 'Error al crear ajustador'}</p>
              </div>
            )
          });
        }
      } catch (error) {
        showErrorMessage(error);
      }
    } else if (yaExisteEmailAjusBool && yaExisteCodAjusBool && yaExisteAjustadorEmpresa) {
      Modal.warning({
        title: 'Mantenedor ajustador',
        content: (
          <div>
            <p>
              El código <strong>{codAjustador}</strong>, ajustador <strong>{nomAjustador}</strong>, correo{' '}
              <strong>{emailAjustador}</strong> están registrados
            </p>
          </div>
        )
      });
    } else if (yaExisteCodAjusBool) {
      Modal.warning({
        title: 'Mantenedor ajustador',
        content: (
          <div>
            <p>
              El código <strong>{codAjustador}</strong> está vinculado a <strong>{yaExisteCodAjus[0].ajustador}</strong>
            </p>
          </div>
        )
      });
    } else if (yaExisteAjustadorEmpresa) {
      Modal.warning({
        title: 'Mantenedor ajustador',
        content: (
          <div>
            <p>
              El ajustador <strong>{nomAjustador}</strong> está registrado.
            </p>
          </div>
        )
      });
    } else if (yaExisteEmailAjusBool) {
      Modal.warning({
        title: 'Mantenedor ajustador',
        content: (
          <div>
            <p>
              El correo <strong>{emailAjustador}</strong> está vinculado a{' '}
              <strong>{yaExisteEmailAjus[0].ajustador}</strong>
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
      datosModal: { idAjustador, idPersona },
      limpiarForm,
      handleCancelar,
      listarAjustador,
      selected
    } = this.props;

    const { emailInicial } = this.state;

    const dataAjus = listarAjustador.listarAjustador.map((item, index) => {
      return {
        key: index,
        codigo: item.codAjustador.toUpperCase(),
        ajustador: item.nombreAjustador.toUpperCase(),
        email: item.email ? item.email.toUpperCase() : null
      };
    });

    const operacion = MANTENIMIENTO_ADMINISTRACION.MODIFICAR;
    const codAjustador = getFieldValue('codigoAjustador');
    const dscAjustador = getFieldValue('ajustadorMantenedor');
    const emailAjustador = getFieldValue('emailAjustador');
    const listaRamo = getFieldValue('agregarRamoAjustador');
    const idCoreAjustador = getFieldValue('idCoreAjustador');
    const nomAjustador = dscAjustador.trim();
    // const { selected } = getFieldValue('agregarRamoAjustador');
    const ramos = selected.map((item, index) => {
      return {
        key: index,
        codRamo: item.codRamo
      };
    });

    const actualAjustador = await dataAjus.filter(item => item.email !== emailInicial.toUpperCase());
    const posibleAjustador = await actualAjustador.filter(item => item.email === emailAjustador.toUpperCase());
    const existeAjustador = posibleAjustador.length > 0;

    if (!existeAjustador) {
      try {
        const response = await dispatch(
          mantenimientoAjustadorCreator.fetchMantenimientoAjustador(
            operacion,
            codAjustador,
            nomAjustador,
            emailAjustador,
            idAjustador,
            idPersona,
            ramos,
            null,
            idCoreAjustador
          )
        );
        const mensaje = response.code === 'CRG-000';
        if (mensaje) {
          Modal.success({
            title: 'Modificar ajustador',
            content: (
              <div>
                <p>{response.message}</p>
              </div>
            )
          });
          handleCancelar();
          limpiarForm();
        } else {
          Modal.error({
            title: 'Modificar ajustador',
            content: (
              <div>
                <p>Error al modificar ajustador</p>
              </div>
            )
          });
        }
      } catch (error) {
        showErrorMessage(error);
      }
    } else {
      Modal.warning({
        title: 'Mantenedor ajustador',
        content: (
          <div>
            <p>El correo ya está registrado </p>
          </div>
        )
      });
    }
  };

  emailValidacion = (rule, value, callback) => {
    const { form } = this.props;
    const fieldEmail = form.getFieldValue('emailAjustador');
    const exp = /^[-\w.%+]{1,64}(?:[A-Z0-9-@]{1,63}){1,125}$/gim;
    const expEmail = /^[-\w.%+]{1,64}[A-Z0-9-]@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
    // if(fieldEmail.length >= 1) {
    if (exp.test(fieldEmail) === false && expEmail.test(fieldEmail) === false) {
      if (fieldEmail.length >= 1) {
        callback('El campo no es v\u00e1lido');
        return;
      }
    }
    // }

    if (!expEmail.test(fieldEmail)) {
      callback(ValidationMessage.NOT_VALID);
      return;
    }
    callback();
  };

  render() {
    const {
      listarRamo,
      form: { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError, getFieldsValue },
      modalVisibleAgregar,
      handleCancelar,
      titleModalAgregar,
      datosModal,
      selected,
      actualizarMargenes,
      editarUsuario,
      items,
      onDragEnter,
      onDrop,
      despuesDeCerrar,
      handleDeleteDragDrop,
      onDragOver,
      onDragStart,
      checkboxRoles,
      setearSeleccionadosCheckbox,
      rolesCheckbox,
      loadingMntAjustador
    } = this.props;

    const codigoError = isFieldTouched('codigoAjustador') && getFieldError('codigoAjustador');
    const ajustadorError = isFieldTouched('ajustadorMantenedor') && getFieldError('ajustadorMantenedor');
    const emailError = isFieldTouched('emailAjustador') && getFieldError('emailAjustador');
    const agregarRamoError = isFieldTouched('agregarRamoAjustador') && getFieldError('agregarRamoAjustador');
    const idCoreAjustadorError = isFieldTouched('idCoreAjustador') && getFieldError('idCoreAjustador');

    return (
      <React.Fragment>
        <Modal
          visible={modalVisibleAgregar}
          cancelText="Cancelar"
          onCancel={handleCancelar}
          okText="Agregar"
          onOk={titleModalAgregar === 'Agregar' ? this.handleAgregarOK : this.handleModificarOK}
          width="900px"
          okButtonProps={{ disabled: this.validandoValoresDeCampos(getFieldsError()) }}
          afterClose={despuesDeCerrar}
          maskClosable={false}
          confirmLoading={loadingMntAjustador}
          destroyOnClose
        >
          <Form>
            <h2>{titleModalAgregar === 'Agregar' ? 'Datos generales ajustador' : 'Modificar Ajustador'}</h2>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                <Form.Item label="Código" validateStatus={codigoError ? 'error' : ''} help={codigoError || ''}>
                  {getFieldDecorator('codigoAjustador', {
                    initialValue: datosModal ? datosModal.codigo : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[a-zA-Z0-9]*$/
                      },
                      {
                        required: !datosModal, // true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input placeholder="Ingrese código" disabled={!!datosModal} maxLength={10} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={4} xl={4}>
                <Form.Item
                  label="Id core"
                  validateStatus={idCoreAjustadorError ? 'error' : ''}
                  help={idCoreAjustadorError || ''}
                >
                  {getFieldDecorator('idCoreAjustador', {
                    initialValue: datosModal ? datosModal.idCore && datosModal.idCore.toString() : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[0-9]*$/
                      },
                      {
                        required: !datosModal, // true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input placeholder="Ingrese id core" disabled={!!datosModal} maxLength={9} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Item label="Ajustador" validateStatus={ajustadorError ? 'error' : ''} help={ajustadorError || ''}>
                  {getFieldDecorator('ajustadorMantenedor', {
                    initialValue: datosModal ? datosModal.ajustador : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        whitespace: true,
                        pattern: /^[a-zA-Z\s\.&]*$/
                      },
                      {
                        required: !datosModal,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input placeholder="Ingrese ajustador" disabled={!!datosModal} maxLength={100} />)}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Item label="E-mail" validateStatus={emailError ? 'error' : ''} help={emailError || ''}>
                  {getFieldDecorator('emailAjustador', {
                    initialValue: datosModal ? datosModal.email : null,
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID,
                        pattern: /^[[-\w.%+]{1,64}[A-Z0-9-]@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}]*$/i
                        // message: ValidationMessage.NOT_VALID, whitespace: true
                      },
                      {
                        required: !datosModal,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(<Input placeholder="Ingrese e-mail" disabled={!!datosModal} maxLength={50} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <Form.Item validateStatus={agregarRamoError ? 'error' : ''} help={agregarRamoError || ''}>
                  {getFieldDecorator('agregarRamoAjustador', {
                    initialValue: selected,
                    value: selected,
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: false,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <AgregarRamo
                      listarRamo={listarRamo}
                      actualizarMargenes={actualizarMargenes}
                      editarUsuario={editarUsuario}
                      items={items}
                      selected={selected}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDragEnter={onDragEnter}
                      onDrop={onDrop}
                      handleDeleteDragDrop={handleDeleteDragDrop}
                      checkboxRoles={checkboxRoles}
                      setearSeleccionadosCheckbox={setearSeleccionadosCheckbox}
                      rolesCheckbox={rolesCheckbox}
                    />
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

function mapStateToProps(state) {
  // const listarAjustador = getListAjustador(state);

  return {
    // listarAjustador,
    // loadingListarAjustador: listarAjustador.isLoading,

    userClaims: state.services.user.userClaims,
    showScroll: state.services.device.scrollActivated
  };
}

export default connect(mapStateToProps)(Form.create()(AjustadorAgregar));
