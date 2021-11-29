import React from 'react';
import { connect } from 'react-redux';
import { Form, Col, Row, Input, Button, Select } from 'antd';
import { ValidationMessage } from 'util/validation';
import { hasErrors, hasValues, showErrorMessage } from 'util/index';
import * as listarConsecuenciaCreators from 'scenes/Administracion/data/listarConsecuencia/action';

class ConsecuenciasForm extends React.Component {
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
          dispatch(listarConsecuenciaCreators.fetchListConsecuencia(values));
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
      dispatch(listarConsecuenciaCreators.fetchListConsecuencia());
    } catch (e) {
      showErrorMessage(e);
    }
  };

  render() {
    const { form, ramosItems, loadingListarRamo } = this.props;

    const { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError, getFieldsValue, isFieldsTouched } = form;
    const codigoConsecuenciaError = isFieldTouched('codigoConsecuencia') && getFieldError('codigoConsecuencia');
    const descConsecuenciaError = isFieldTouched('descConsecuencia') && getFieldError('descConsecuencia');
    const ramoConsecuenciaError = isFieldTouched('ramoConsecuencia') && getFieldError('ramoConsecuencia');

    return (
      <div className="seccion_claims">
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Código"
                validateStatus={codigoConsecuenciaError ? 'error' : ''}
                help={codigoConsecuenciaError || ''}
              >
                {getFieldDecorator('codigoConsecuencia', {
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
              <Form.Item
                label="Consecuencia"
                validateStatus={descConsecuenciaError ? 'error' : ''}
                help={descConsecuenciaError || ''}
              >
                {getFieldDecorator('descConsecuencia', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      whitespace: true,
                      pattern: /^[0-9a-zA-Z,ÑñáéíóúÁÉÍÓÚ/() ]*$/
                    }
                  ]
                })(<Input placeholder="Ingrese consecuencia" maxLength={50} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Ramo"
                validateStatus={ramoConsecuenciaError ? 'error' : ''}
                help={ramoConsecuenciaError || ''}
              >
                {getFieldDecorator('ramoConsecuencia')(
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

export default connect()(Form.create()(ConsecuenciasForm));
