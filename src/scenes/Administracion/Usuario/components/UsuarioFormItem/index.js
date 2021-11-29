import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, Button, Select } from 'antd';

import { ValidationMessage } from 'util/validation';
import { hasErrors, hasValues, showErrorMessage } from 'util/index';

import * as listarPersonaCreators from 'scenes/Administracion/data/listarPersona/action';
import * as obtenerPersonaCreators from 'scenes/Administracion/data/obtenerPersona/action';
import * as obtenerReemplazosCreators from 'scenes/Administracion/data/obtenerReemplazos/action';
import * as listarPosiblesReemplazosCreators from 'scenes/Administracion/data/listarPosiblesReemplazos/action';

class UsuarioForm extends React.Component {
  handleButton = (touched, errors, values) => !values || (touched && errors) || false;

  render() {
    const {
      reset,
      teamsItems,
      cargoItems,
      listarPersona,
      loadingListarCargo,
      loadingListarEquipos,
      setearValoresDeBusqueda,
      seteaSelectedRowKeysEmpty,
      form: {
        resetFields,
        isFieldTouched,
        isFieldsTouched,
        getFieldError,
        getFieldsError,
        validateFields,
        getFieldsValue,
        getFieldDecorator
      }
    } = this.props;

    const validateStatus = nombreDeCampo =>
      isFieldTouched(nombreDeCampo) && getFieldError(nombreDeCampo) ? 'error' : '';

    const help = nombreDeCampo => (isFieldTouched(nombreDeCampo) && getFieldError(nombreDeCampo)) || '';

    const reglasNombresApellidos = [
      {
        message: ValidationMessage.NOT_VALID,
        whitespace: true
      }
    ];

    const buttonBuscar = () => {
      validateFields(async (err, values) => {
        if (!err) {
          try {
            setearValoresDeBusqueda(values);
            await listarPersona(values);
            seteaSelectedRowKeysEmpty();
          } catch (e) {
            showErrorMessage(e.message);
          }
        }
      });
    };

    const handleLimpiar = () => {
      resetFields();
      reset();
      seteaSelectedRowKeysEmpty();
      listarPersona();
    };

    return (
      <div className="seccion_claims">
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Nombre(s)" validateStatus={validateStatus('nombre')} help={help('nombre')}>
                {getFieldDecorator('nombre', {
                  rules: reglasNombresApellidos
                })(<Input placeholder="Ingrese nombre(s)" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item
                label="Apellido paterno"
                validateStatus={validateStatus('apelidoPaterno')}
                help={help('apelidoPaterno')}
              >
                {getFieldDecorator('apelidoPaterno', {
                  rules: reglasNombresApellidos
                })(<Input placeholder="Ingrese apellido paterno" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item
                label="Apellido materno"
                validateStatus={validateStatus('apelidoMaterno')}
                help={help('apelidoMaterno')}
              >
                {getFieldDecorator('apelidoMaterno', {
                  rules: reglasNombresApellidos
                })(<Input placeholder="Ingrese apellido materno" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="E-mail" validateStatus={validateStatus('email')} help={help('email')}>
                {getFieldDecorator('email', {
                  rules: [
                    {
                      type: 'email',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true
                    }
                  ]
                })(<Input placeholder="Ingrese e-mail" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Cargo" validateStatus={validateStatus('cargo')} help={help('cargo')}>
                {getFieldDecorator('cargo')(
                  <Select placeholder="Seleccione cargo" loading={loadingListarCargo}>
                    {cargoItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="Equipo" validateStatus={validateStatus('equipo')} help={help('equipo')}>
                {getFieldDecorator('equipo')(
                  <Select placeholder="Seleccione equipo" loading={loadingListarEquipos}>
                    {teamsItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={buttonBuscar}
                disabled={this.handleButton(
                  isFieldsTouched(),
                  hasErrors(getFieldsError()),
                  hasValues(getFieldsValue())
                )}
              >
                Buscar
              </Button>
              <Button style={{ marginLeft: 10 }} onClick={handleLimpiar}>
                Limpiar
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  listarPersona: values => dispatch(listarPersonaCreators.fetchListPersona(values)),

  reset: () => {
    dispatch(listarPersonaCreators.fetchListPersonaReset());
    dispatch(obtenerPersonaCreators.fetchObtenerPersonaReset());
    dispatch(obtenerReemplazosCreators.fetchObtenerReemplazoReset());
    dispatch(listarPosiblesReemplazosCreators.fetchListReemplazosReset());
  }
});

export default connect(
  null,
  mapDispatchToProps
)(Form.create()(UsuarioForm));
