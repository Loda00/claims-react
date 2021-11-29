import React from 'react';
import { Form, Col, Row, Input, Button } from 'antd';
import { ValidationMessage } from 'util/validation';
import { showErrorMessage, hasErrors, hasValues } from 'util/index';
import * as listarPersonaCreators from 'scenes/Administracion/data/listarRamo/action';
import { connect } from 'react-redux';

class RamoForm extends React.Component {
  componentDidMount() {
    const { limpiarAlMantener } = this.props;

    limpiarAlMantener(this.handleLimpiar.bind(this));
  }

  handleButton = (touched, hasErrors, values) => {
    if (!values || (touched && hasErrors)) {
      return true;
    }
    return false;
  };

  buttonBuscar = () => {
    const {
      form: { getFieldValue },
      dispatch
    } = this.props;

    const codRamo = getFieldValue('codigo');
    const valorRamo = getFieldValue('descRamo');
    const dscRamo = valorRamo ? valorRamo.trim() : null;
    try {
      dispatch(listarPersonaCreators.fetchListRamos(codRamo, dscRamo));
    } catch (e) {
      showErrorMessage(e);
    }
  };

  handleLimpiar = () => {
    const {
      form: { resetFields },
      dispatch
    } = this.props;

    resetFields();
    try {
      dispatch(listarPersonaCreators.fetchListRamos(null, null));
    } catch (e) {
      showErrorMessage(e);
    }
  };

  render() {
    const { form } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError, getFieldsValue, isFieldsTouched } = form;

    const codigoError = isFieldTouched('codigo') && getFieldError('codigo');
    const descRamoError = isFieldTouched('descRamo') && getFieldError('descRamo');

    return (
      <div className="seccion_claims">
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Código" validateStatus={codigoError ? 'error' : ''} help={codigoError || ''}>
                {getFieldDecorator('codigo', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true,
                      pattern: /^[a-zA-Z0-9]*$/
                      // pattern: /^[A-Za-z]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese código" maxLength={10} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Ramo" validateStatus={descRamoError ? 'error' : ''} help={descRamoError || ''}>
                {getFieldDecorator('descRamo', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true,
                      pattern: /^[0-9a-zA-Z,ÑñáéíóúÁÉÍÓÚ/() ]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese ramo" maxLength={100} />)}
              </Form.Item>
            </Col>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                onClick={this.buttonBuscar}
                disabled={this.handleButton(
                  isFieldsTouched(),
                  hasErrors(getFieldsError()),
                  hasValues(getFieldsValue())
                )}
              >
                Buscar
              </Button>
              <Button onClick={this.handleLimpiar} style={{ marginLeft: 10 }}>
                Limpiar
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default connect()(Form.create()(RamoForm));
