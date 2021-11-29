import React from 'react';
import { Form, Col, Row, Input, Button } from 'antd';
import { showErrorMessage, hasErrors, hasValues } from 'util/index';
import * as listarAjustadorCreators from 'scenes/Administracion/data/listarAjustador/action';
import { connect } from 'react-redux';
import { ValidationMessage } from 'util/validation';

class AjustadorForm extends React.Component {
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
      form: { validateFields },
      dispatch
    } = this.props;

    validateFields((err, values) => {
      if (!err) {
        try {
          dispatch(listarAjustadorCreators.fetchListAjustador(values));
        } catch (e) {
          showErrorMessage(e);
        }
      }
    });
  };

  handleLimpiar = () => {
    const {
      form: { resetFields },
      dispatch
    } = this.props;

    resetFields();
    try {
      dispatch(listarAjustadorCreators.fetchListAjustador());
    } catch (e) {
      showErrorMessage(e);
    }
  };

  render() {
    const { form } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError, getFieldsValue, isFieldsTouched } = form;
    const descAjustadorError = isFieldTouched('descAjustador') && getFieldError('descAjustador');
    const codAjustadorError = isFieldTouched('codAjustador') && getFieldError('codAjustador');

    return (
      <div className="seccion_claims">
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Código"
                validateStatus={codAjustadorError ? 'error' : ''}
                help={codAjustadorError || ''}
              >
                {getFieldDecorator('codAjustador', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true,
                      pattern: /^[a-zA-Z0-9]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese código" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Ajustador"
                validateStatus={descAjustadorError ? 'error' : ''}
                help={descAjustadorError || ''}
              >
                {getFieldDecorator('descAjustador', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true,
                      pattern: /^[a-zA-Z0-9.& ]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese ajustador" />)}
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

export default connect()(Form.create()(AjustadorForm));
