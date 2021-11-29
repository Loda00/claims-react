import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, Button, Select } from 'antd';
import { ValidationMessage } from 'util/validation';
import { showErrorMessage, hasErrors, hasValues } from 'util/index';
import * as listarCausasCreators from 'scenes/Administracion/data/listarCausa/action';

class CausasForm extends React.Component {
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
      setFormValues,
      dispatch
    } = this.props;

    validateFields((err, values) => {
      setFormValues(values);
      if (!err) {
        try {
          dispatch(listarCausasCreators.fetchListCausa(values));
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
      dispatch(listarCausasCreators.fetchListCausa());
    } catch (e) {
      showErrorMessage(e);
    }
  };

  render() {
    const { form, loadingListarRamo, ramosItems } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError, getFieldsValue, isFieldsTouched } = form;

    const codigoCausasError = isFieldTouched('codigoCausas') && getFieldError('codigoCausas');
    const dscCausasError = isFieldTouched('dscCausas') && getFieldError('dscCausas');
    const ramoCausasError = isFieldTouched('ramoCausas') && getFieldError('ramoCausas');
    return (
      <div className="seccion_claims">
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Código"
                validateStatus={codigoCausasError ? 'error' : ''}
                help={codigoCausasError || ''}
              >
                {getFieldDecorator('codigoCausas', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true,
                      pattern: /^[0-9]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese código" maxLength={3} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Causa" validateStatus={dscCausasError ? 'error' : ''} help={dscCausasError || ''}>
                {getFieldDecorator('dscCausas', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true,
                      pattern: /^[0-9a-zA-Z,ÑñáéíóúÁÉÍÓÚ/() ]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese causa" maxLength={300} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Ramo" validateStatus={ramoCausasError ? 'error' : ''} help={ramoCausasError || ''}>
                {getFieldDecorator('ramoCausas')(
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

export default connect()(Form.create()(CausasForm));
