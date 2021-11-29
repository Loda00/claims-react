import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { Form, Col, Row, Input, Button, Icon, Modal, Select, Spin, Checkbox } from 'antd';

import { showErrorMessage } from 'util/index';
import { CONSTANTS_APP } from 'constants/index';
import { ValidationMessage } from 'util/validation';

import { getListCargo } from 'scenes/Administracion/data/listarCargo/reducer';
import { getObtenerJefes } from 'scenes/Administracion/data/obtenerJefes/reducer';
import { crearPersonaLoading } from 'scenes/Administracion/data/crearPersona/reducer';
import { actualizarPersonaLoading } from 'scenes/Administracion/data/actualizarPersona/reducer';

import * as crearPersonaCreators from 'scenes/Administracion/data/crearPersona/action';
import * as obtenerJefesCreators from 'scenes/Administracion/data/obtenerJefes/action';
import * as listarPersonaCreators from 'scenes/Administracion/data/listarPersona/action';
import * as listarAjustadorCreators from 'scenes/Administracion/data/listarAjustador/action';
import * as actualizarPersonaCreators from 'scenes/Administracion/data/actualizarPersona/action';

import DragDropRoles from 'scenes/Administracion/Usuario/components/UsuarioAgregar/components/dragDrop/dragDropRoles';

class UsuarioAgregar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jefe: ''
    };
  }

  onOKAgregarOEditar = async (modalSuccess, modalError) => {
    const {
      selected,
      crearPersona,
      editarUsuario,
      handleAgregarOK,
      listaAjustadores,
      actualizarPersona,
      validateBeforeUpdate,
      setearLoadingToFalse,
      form: { validateFields }
    } = this.props;

    const { jefe } = this.state;

    try {
      await validateFields(async (errors, values) => {
        if (!errors) {
          if (values.action === 'N') {
            const response = await crearPersona(values, listaAjustadores, selected, jefe);
            if (response.code === 'CRG-000') {
              Modal.success({
                title: response.message,
                centered: true,
                okText: 'Aceptar',
                onOk: handleAgregarOK()
              });
            } else {
              Modal.error({
                title: response.message,
                centered: true,
                okText: 'Cerrar'
              });
            }
          } else if (values.action === 'U') {
            const validacion = validateBeforeUpdate(values);

            if (validacion === null) {
              const response = await actualizarPersona(editarUsuario, 'U', selected, listaAjustadores, values, jefe);
              if (response.code === 'CRG-000') {
                Modal.success({
                  title: 'Se actualizó la información del usuario',
                  content: response.message,
                  centered: true,
                  okText: 'Aceptar',
                  onOk: handleAgregarOK()
                });
              } else {
                Modal.error({
                  title: 'Error al actualizar el usuario',
                  content: response.message,
                  centered: true,
                  okText: 'Cerrar'
                });
              }
            } else showErrorMessage('Ocurrió un error');
          } else {
            Modal.error({
              title: 'Acción desconocida',
              content: 'Ha ejecutado una acción desconocida',
              centered: true,
              okText: 'Cerrar',
              onOk: handleAgregarOK()
            });
          }
        } else {
          const errores = Object.entries(errors);
          const content = errores.map(error => <p>El campo {error[0]} no es válido</p>);
          Modal.error({
            title: 'Error',
            content,
            centered: true,
            okText: 'Cerrar'
          });
        }
        return true;
      });
    } catch (err) {
      Modal.error({
        title: CONSTANTS_APP.GENERIC_ERROR_MESSAGE,
        content: err.message,
        centered: true,
        okText: 'Cerrar'
      });
    } finally {
      setearLoadingToFalse();
    }
  };

  // Fn usada en la fn obtenerJefeOnChangeCargo y en fn obtenerJefeOnChangeEquipo
  setearCampoJefe = jefe => {
    const { data } = jefe;
    const {
      form: { setFieldsValue }
    } = this.props;

    if (jefe && data.length > 0) {
      this.setState({ jefe: data[0].pkPersona });
      setFieldsValue({ jefeAgregar: data[0].nombreCompleto });
    } else {
      setFieldsValue({ jefeAgregar: 'No hay jefe de equipo' });
    }
  };

  obtenerJefeOnChangeCargo = async value => {
    const {
      resetItems,
      obtenerJefe,
      listarRoles,
      itemsConCampo,
      editarUsuario,
      setearItemsRoles,
      resetRolesCheckbox,
      setearRolPracticante,
      form: { getFieldValue, setFieldsValue },
      tituloModal
    } = this.props;

    const valorEquipo = getFieldValue('equipoAgregar');
    const valorPerfil = getFieldValue('tipoPerfilAgregar');
    const valordelEquipo = typeof valorEquipo === 'string' ? parseInt(valorEquipo.slice(-1), 10) : valorEquipo;

    await resetItems();
    this.setState({ jefe: '' });

    try {
      // si viene de editar
      if (tituloModal === 'E') {
        editarUsuario.nombreJefe = undefined;
        if (value === 1) {
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          resetRolesCheckbox();
          setearItemsRoles(itemsASetear);
        } else if (value === 2 || value === 3 || value === 4) {
          const jefe = await obtenerJefe(value);

          if (jefe && jefe.data && jefe.data.length > 0) {
            await this.setState({ jefe: jefe.data[0].pkPersona });
          }
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          resetRolesCheckbox();
          setearItemsRoles(itemsASetear);
        } else if (value === 7 && valorEquipo) {
          // si es prac
          const jefe = await obtenerJefe(value, valordelEquipo);
          this.setearCampoJefe(jefe);
          setearRolPracticante(value);
          resetRolesCheckbox();
        } else if ((value === 5 || value === 6) && valorEquipo) {
          // si es ejecutivo , ES SR
          const jefe = await obtenerJefe(value, valordelEquipo);
          this.setearCampoJefe(jefe);
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          resetRolesCheckbox();
          setearItemsRoles(itemsASetear);
        } else {
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          setearItemsRoles(itemsASetear);
          resetRolesCheckbox();
        }
      } else {
        // si viene de crear
        setFieldsValue({ jefeAgregar: undefined });
        if (value === 1) {
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          resetRolesCheckbox();
          setearItemsRoles(itemsASetear);
        } else if (value === 2 || value === 3 || value === 4) {
          const jefe = await obtenerJefe(value);
          if (jefe && jefe.data && jefe.data.length > 0) {
            await this.setState({ jefe: jefe.data[0].pkPersona });
          }
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          resetRolesCheckbox();
          setearItemsRoles(itemsASetear);
        } else if (value === 7) {
          // si es prac
          if (valorEquipo) {
            const jefe = await obtenerJefe(value, valordelEquipo);
            this.setearCampoJefe(jefe);
          }
          setearRolPracticante(value);
          resetRolesCheckbox();
        } else if (value === 5 || value === 6) {
          // si es ejecutivo , ES SR
          if (valorEquipo) {
            const jefe = await obtenerJefe(value, valordelEquipo);
            this.setearCampoJefe(jefe);
          }
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          resetRolesCheckbox();
          setearItemsRoles(itemsASetear);
        } else {
          const itemsASetear = itemsConCampo(listarRoles, valorPerfil);
          setearItemsRoles(itemsASetear);
          resetRolesCheckbox();
        }
      }
    } catch (e) {
      //
    }
  };

  obtenerJefeOnChangeEquipo = async value => {
    const {
      obtenerJefe,
      listarCargo,
      editarUsuario,
      editarUsuario: { nombreJefe },
      form: { getFieldValue, setFieldsValue }
    } = this.props;

    const valorCargo = getFieldValue('cargoAgregar');
    const filtrarCargo = listarCargo.filter(cargo => cargo.dscCargo === valorCargo);
    const valordelCargo = typeof valorCargo === 'string' ? filtrarCargo[0].pkCrgCargo : valorCargo;

    try {
      if (nombreJefe) {
        editarUsuario.nombreJefe = undefined;
      } else setFieldsValue({ jefeAgregar: undefined });
      const jefe = await obtenerJefe(valordelCargo, value);
      this.setearCampoJefe(jefe);
    } catch (e) {
      showErrorMessage(e);
    }
  };

  validateStatus = nombreDeCampo => {
    const {
      form: { getFieldError, isFieldTouched },
      editarUsuario
    } = this.props;
    if (!isEmpty(editarUsuario)) {
      return getFieldError(nombreDeCampo) ? 'error' : '';
    }
    return isFieldTouched(nombreDeCampo) && getFieldError(nombreDeCampo) ? 'error' : '';
  };

  help = nombreDeCampo => {
    const {
      form: { isFieldTouched, getFieldError },
      editarUsuario
    } = this.props;

    if (!isEmpty(editarUsuario)) {
      return getFieldError(nombreDeCampo) || '';
    }
    return (isFieldTouched(nombreDeCampo) && getFieldError(nombreDeCampo)) || '';
  };

  ocultarModal = () => {
    const { alCancelarAgregarOEditar } = this.props;
    alCancelarAgregarOEditar();
  };

  render() {
    const {
      items,
      selected,
      cargoItems,
      teamsItems,
      selectedRow,
      tituloModal,
      ajustadores,
      loadingRoles,
      modalVisible,
      checkboxRoles,
      rolesCheckbox,
      editarUsuario,
      loadingEditar,
      despuesDeCerrar,
      listaAjustadores,
      habilitarCheckbox,
      actualizarMargenes,
      loadingAjustadores,
      modalAgregarUsuario,
      handleDeleteDragDrop,
      filtrarRolesInternoExterno,
      setearSeleccionadosCheckbox,
      crearUsuarioLoading,
      actualizarUsuarioLoading,
      form: { getFieldDecorator, getFieldValue, getFieldsError, isFieldsTouched }
    } = this.props;

    const rulesNombreApellidos = [
      { whitespace: true, message: ValidationMessage.NOT_VALID },
      { min: 3, message: 'Debe tener un mínimo de 03 caracteres' },
      { required: true, message: ValidationMessage.REQUIRED }
    ];

    const valorCargo = getFieldValue('cargoAgregar');
    const perfil = getFieldValue('tipoPerfilAgregar');
    const tipoPerfil = getFieldValue('tipoPerfilAgregar') === '1';

    const requiredCargo = selected.some(
      rol => rol.idTipoUsuario === 'APROB' || rol.idTipoUsuario === 'ES' || rol.idTipoUsuario === 'PRAC'
    );

    const cargosConEquipoYjefe =
      valorCargo === 4 ||
      valorCargo === 5 ||
      valorCargo === 6 ||
      valorCargo === 7 ||
      valorCargo === 'Jefe de equipo' ||
      valorCargo === 'Ejecutivo Senior' ||
      valorCargo === 'Ejecutivo' ||
      valorCargo === 'Practicante';

    const mostrarJefe =
      valorCargo === 5 ||
      valorCargo === 6 ||
      valorCargo === 7 ||
      valorCargo === 'Ejecutivo Senior' ||
      valorCargo === 'Ejecutivo' ||
      valorCargo === 'Practicante';

    const selectedTieneAjustador = selected && selected.find(item => item.idTipoUsuario === 'AJUST');

    const usuarioCodAjustador =
      editarUsuario &&
      editarUsuario.tipoUsuario &&
      editarUsuario.tipoUsuario.length > 0 &&
      editarUsuario.tipoUsuario[0].codAjustador;

    const valorInicialAjustadores = listaAjustadores.filter(
      ajustador => ajustador.codAjustador === usuarioCodAjustador
    );

    const editarUsuarioAjustador =
      editarUsuario &&
      editarUsuario.tipoUsuario &&
      editarUsuario.tipoUsuario.length > 0 &&
      editarUsuario.tipoUsuario[0].idTipo === 'AJUST';

    const validateButtonAdd = (fieldsError, fieldsTouched) => {
      const errors = Object.keys(fieldsError).some(field => fieldsError[field]);
      let inputsNamesEmpty = true;
      let validateEmail = true;
      let validateFieldsProfile = true;
      const emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
      const INTERNO = 1;

      if (getFieldValue('emailAgregar') && emailRegex.test(getFieldValue('emailAgregar'))) validateEmail = false;

      if (getFieldValue('nombre') && getFieldValue('apellidoPaterno') && getFieldValue('apellidoMaterno'))
        inputsNamesEmpty = false;

      if (getFieldValue('tipoPerfilAgregar') == INTERNO) {
        if (requiredCargo) {
          if (getFieldValue('cargoAgregar')) {
            if (cargosConEquipoYjefe && requiredCargo) {
              if (getFieldValue('equipoAgregar')) validateFieldsProfile = false;
            } else validateFieldsProfile = false;
          }
        } else {
          validateFieldsProfile = false;
        }
      } else if (selectedTieneAjustador) {
        if (getFieldValue('ajustadorAgregar')) validateFieldsProfile = false;
      } else {
        validateFieldsProfile = false;
      }

      const idTiposUsuario =
        editarUsuario &&
        editarUsuario.tipoUsuario &&
        editarUsuario.tipoUsuario.length > 0 &&
        editarUsuario.tipoUsuario.map(rol => rol.idTipo);

      const idTipoSelected = selected && selected.length > 0 && selected.map(rol => rol.idTipoUsuario);

      if (
        (fieldsTouched ||
          (editarUsuario &&
            editarUsuario.tipoUsuario &&
            editarUsuario.tipoUsuario.length > 0 &&
            idTiposUsuario &&
            idTiposUsuario.length > 0 &&
            idTipoSelected &&
            idTipoSelected.length > 0 &&
            (selected.some(rol => !idTiposUsuario.includes(rol.idTipoUsuario)) ||
              editarUsuario.tipoUsuario.some(rol => !idTipoSelected.includes(rol.idTipo))))) &&
        !errors &&
        !inputsNamesEmpty &&
        !validateEmail &&
        !validateFieldsProfile &&
        selected.length
      )
        return false;
      return true;
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
          onClick={modalAgregarUsuario}
          disabled={selectedRow.length > 0}
          style={{ textAlign: 'right', marginRight: '10px', marginTop: '10px' }}
        >
          Crear
          <Icon type="user-add" />
        </Button>
        <Modal
          width="900px"
          visible={modalVisible}
          cancelText="Cancelar"
          onCancel={this.ocultarModal}
          okText={tituloModal === 'A' ? 'Agregar' : 'Guardar'}
          onOk={() => this.onOKAgregarOEditar(modalSuccess, modalError)}
          okButtonProps={{
            disabled:
              validateButtonAdd(getFieldsError(), isFieldsTouched()) || crearUsuarioLoading || actualizarUsuarioLoading
          }}
          afterClose={() => {
            despuesDeCerrar(perfil);
            this.setState({ jefe: '' });
          }}
          destroyOnClose
        >
          <Form>
            <h2>{tituloModal === 'A' ? 'Datos Generales' : 'Modificar Usuario'}</h2>
            <Spin spinning={loadingEditar}>
              <Row gutter={24}>
                {getFieldDecorator('action', {
                  initialValue: (editarUsuario && editarUsuario.nombres && 'U') || 'N'
                })(<Input type="hidden" />)}
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Tipo de perfil"
                    validateStatus={this.validateStatus('tipoPerfilAgregar')}
                    help={this.help('tipoPerfilAgregar')}
                  >
                    {getFieldDecorator('tipoPerfilAgregar', {
                      initialValue:
                        editarUsuario &&
                        editarUsuario.tipoUsuario &&
                        editarUsuario.tipoUsuario.length > 0 &&
                        (editarUsuario.tipoUsuario[0].idTipo === 'AJUST' ||
                          editarUsuario.tipoUsuario[0].idTipo === 'CEMER' ||
                          editarUsuario.tipoUsuario[0].idTipo === 'P')
                          ? '2'
                          : '1',
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Select placeholder="Seleccione un tipo de perfil" onChange={filtrarRolesInternoExterno}>
                        <Select.Option value="1">Interno</Select.Option>
                        <Select.Option value="2">Externo</Select.Option>
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Nombre(s)"
                    validateStatus={this.validateStatus('nombre', editarUsuario)}
                    help={this.help('nombre')}
                  >
                    {getFieldDecorator('nombre', {
                      initialValue: editarUsuario && editarUsuario.nombres ? editarUsuario.nombres : undefined,
                      validateTrigger: 'onBlur',
                      validateFirst: true,
                      rules: rulesNombreApellidos
                    })(
                      <Input
                        placeholder="Ingrese nombre(s)"
                        maxLength={100}
                        onChange={this.validar}
                        disabled={editarUsuario && editarUsuario.nombres && editarUsuario.nombres.length > 0}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Apellido paterno"
                    validateStatus={this.validateStatus('apellidoPaterno')}
                    help={this.help('apellidoPaterno')}
                  >
                    {getFieldDecorator('apellidoPaterno', {
                      initialValue: editarUsuario ? editarUsuario.apePaterno : undefined,
                      validateTrigger: 'onBlur',
                      validateFirst: true,
                      rules: rulesNombreApellidos
                    })(
                      <Input
                        placeholder="Ingrese apellido paterno"
                        maxLength={100}
                        disabled={editarUsuario && editarUsuario.apePaterno && editarUsuario.apePaterno.length > 0}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="Apellido materno"
                    validateStatus={this.validateStatus('apellidoMaterno')}
                    help={this.help('apellidoMaterno')}
                  >
                    {getFieldDecorator('apellidoMaterno', {
                      initialValue: editarUsuario ? editarUsuario.apeMaterno : undefined,
                      validateTrigger: 'onBlur',
                      validateFirst: true,
                      rules: rulesNombreApellidos
                    })(
                      <Input
                        placeholder="Ingrese apellido materno"
                        maxLength={100}
                        disabled={editarUsuario && editarUsuario.apeMaterno && editarUsuario.apeMaterno.length > 0}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Form.Item
                    label="E-mail"
                    validateStatus={this.validateStatus('emailAgregar')}
                    help={this.help('emailAgregar')}
                  >
                    {getFieldDecorator('emailAgregar', {
                      initialValue: editarUsuario ? editarUsuario.email : undefined,
                      validateFirst: true,
                      validateTrigger: 'onBlur',
                      rules: [
                        { required: true, message: ValidationMessage.REQUIRED },
                        { whitespace: true, message: ValidationMessage.NOT_VALID },
                        {
                          type: 'string',
                          message: ValidationMessage.NOT_VALID,
                          pattern: /^[[-\w.%+]{1,64}[A-Z0-9-]@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}]*$/i
                        }
                      ]
                    })(
                      <Input
                        placeholder="Ingrese e-mail"
                        maxLength={50}
                        disabled={editarUsuario && editarUsuario.email && editarUsuario.email.length > 0}
                      />
                    )}
                  </Form.Item>
                </Col>
                {tipoPerfil && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                      label="Cargo"
                      validateStatus={this.validateStatus('cargoAgregar')}
                      help={this.help('cargoAgregar')}
                    >
                      {getFieldDecorator('cargoAgregar', {
                        initialValue: editarUsuario ? editarUsuario.desCargo : undefined,
                        validateTrigger: 'onBlur',
                        rules: [
                          {
                            required: requiredCargo,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select placeholder="Seleccione cargo" onChange={this.obtenerJefeOnChangeCargo}>
                          {cargoItems}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                )}
                {tipoPerfil && cargosConEquipoYjefe && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                      label="Equipo"
                      validateStatus={this.validateStatus('equipoAgregar')}
                      help={this.help('equipoAgregar')}
                    >
                      {getFieldDecorator('equipoAgregar', {
                        initialValue: editarUsuario ? editarUsuario.desEquipo : undefined,
                        validateTrigger: 'onBlur',
                        rules: [
                          {
                            required: cargosConEquipoYjefe && requiredCargo,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select placeholder="Seleccione equipo" onChange={this.obtenerJefeOnChangeEquipo}>
                          {teamsItems}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                )}
                {tipoPerfil && mostrarJefe && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                      label="Jefe/a Encargado/a"
                      validateStatus={this.validateStatus('jefeAgregar')}
                      help={this.help('jefeAgregar')}
                    >
                      {getFieldDecorator('jefeAgregar', {
                        initialValue: editarUsuario.nombreJefe ? editarUsuario.nombreJefe : undefined,
                        validateTrigger: 'onBlur'
                      })(<Input placeholder="Jefe/a Encargado/a" disabled />)}
                    </Form.Item>
                  </Col>
                )}
                {tipoPerfil && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                      label="IdCore"
                      validateStatus={this.validateStatus('idCoreAgregar')}
                      help={this.help('idCoreAgregar')}
                    >
                      {getFieldDecorator('idCoreAgregar', {
                        initialValue: editarUsuario ? editarUsuario.idCore : undefined,
                        validateTrigger: 'onBlur',
                        rules: [
                          {
                            pattern: new RegExp('^[1-9][0-9]*$'),
                            message: ValidationMessage.NOT_VALID
                          }
                        ]
                      })(<Input maxLength={9} placeholder="Ingrese IdCore" />)}
                    </Form.Item>
                  </Col>
                )}
                {tipoPerfil && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item label=" " colon={false}>
                      {getFieldDecorator('accesoReportes', {
                        initialValue: editarUsuario ? editarUsuario.accesoReportes : false,
                        valuePropName: 'checked'
                      })(<Checkbox>Acceso a reportes</Checkbox>)}
                    </Form.Item>
                  </Col>
                )}
                {!tipoPerfil && selectedTieneAjustador && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item
                      label="Ajustador"
                      validateStatus={this.validateStatus('ajustadorAgregar')}
                      help={this.help('ajustadorAgregar')}
                    >
                      {getFieldDecorator('ajustadorAgregar', {
                        initialValue:
                          (editarUsuarioAjustador &&
                            editarUsuario.tipoUsuario[0].codAjustador &&
                            valorInicialAjustadores &&
                            valorInicialAjustadores.length > 0 &&
                            valorInicialAjustadores[0].nombreAjustador) ||
                          undefined,
                        validateTrigger: 'onBlur',
                        rules: [{ required: selectedTieneAjustador, message: ValidationMessage.REQUIRED }]
                      })(
                        <Select
                          placeholder="Seleccione ajustador"
                          disabled={editarUsuarioAjustador}
                          loading={loadingAjustadores}
                        >
                          {ajustadores}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <Form.Item
                    validateStatus={this.validateStatus('tipoUsuarioRolesAgregar')}
                    help={this.help('tipoUsuarioRolesAgregar')}
                  >
                    {getFieldDecorator('tipoUsuarioRolesAgregar', {
                      initialValue: selected,
                      value: selected,
                      validateTrigger: 'onBlur'
                    })(
                      <DragDropRoles
                        items={items}
                        perfil={perfil}
                        selected={selected}
                        valorCargo={valorCargo}
                        loadingRoles={loadingRoles}
                        checkboxRoles={checkboxRoles}
                        rolesCheckbox={rolesCheckbox}
                        habilitarCheckbox={habilitarCheckbox}
                        actualizarMargenes={actualizarMargenes}
                        handleDeleteDragDrop={handleDeleteDragDrop}
                        setearSeleccionadosCheckbox={setearSeleccionadosCheckbox}
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
  const listarCargo = getListCargo(state);
  const obtenerJefes = getObtenerJefes(state);

  return {
    obtenerJefe: obtenerJefes.obtenerJefes,
    loadingObtenerJefes: obtenerJefes.isLoading,

    listarCargo: listarCargo.listarCargo,
    loadingListarCargo: listarCargo.isLoading,

    crearUsuarioLoading: crearPersonaLoading(state),

    actualizarUsuarioLoading: actualizarPersonaLoading(state)
  };
};

const mapDispatchToProps = dispatch => ({
  listarPersonas: valores => dispatch(listarPersonaCreators.fetchListPersona(valores)),

  obtenerJefe: (cargo, equipo) => dispatch(obtenerJefesCreators.fetchObtenerJefe(cargo, equipo)),

  listarAjustador: (obj, indicador) => dispatch(listarAjustadorCreators.fetchListAjustador(obj, indicador)),

  obtenerJefes: (valorCargo, valorEquipo) => dispatch(obtenerJefesCreators.fetchObtenerJefe(valorCargo, valorEquipo)),

  crearPersona: (valores, ajustadores, seleccionados, jefe) =>
    dispatch(crearPersonaCreators.fetchCrearPersona(valores, ajustadores, seleccionados, jefe)),

  actualizarPersona: (usuario, action, seleccionados, ajustadores, valores, jefe) =>
    dispatch(
      actualizarPersonaCreators.fetchActualizarPersona(usuario, action, seleccionados, ajustadores, valores, jefe)
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(UsuarioAgregar));
