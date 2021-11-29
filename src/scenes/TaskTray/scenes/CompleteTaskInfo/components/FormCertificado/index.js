import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Input, Button } from 'antd';
import * as certificatesActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/data/certificates/actions';
import { showErrorMessage, hasErrors } from 'util/index';
import { ValidationMessage } from 'util/validation';

export function hasValues(fields) {
  return Object.keys(fields).some(field => {
    return typeof fields[field] !== 'undefined' && fields[field].length > 0;
  });
}

class FormCertificado extends React.Component {
  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSearch = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.setFormValues(values);
        this.props.dispatch(certificatesActionCreators.updatePage(1));
        const { idePol, codProd, numPol } = this.props.poliza || {};
        this.props
          .dispatch(certificatesActionCreators.fetchCertificates(idePol, codProd, numPol, values))
          .finally(resp => {
            if (this.props.errorCertificates) {
              showErrorMessage(this.props.errorCertificates.message);
            }
          });
      }
    });
  };

  handleButton = (touched, hasErrors, values) => {
    if (!values || (touched && hasErrors)) {
      return true;
    }

    return false;
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      isFieldTouched,
      getFieldError,
      isFieldsTouched,
      getFieldsValue
    } = this.props.form;
    const { codProd } = this.props.poliza || {};
    const certificadoError = isFieldTouched('certificado') && getFieldError('certificado');
    const planillaError = isFieldTouched('planilla') && getFieldError('planilla');
    const aplicacionError = isFieldTouched('aplicacion') && getFieldError('aplicacion');

    return (
      <Col span={24}>
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={8}>
              <Form.Item
                label="Certificado"
                validateStatus={certificadoError ? 'error' : ''}
                help={certificadoError || ''}
              >
                {getFieldDecorator('certificado', {
                  rules: [
                    {
                      type: 'string',
                      message: ValidationMessage.NOT_VALID,
                      pattern: /^\d+$/
                    }
                  ]
                })(<Input placeholder="Certificado" maxLength={10} />)}
              </Form.Item>
            </Col>
            {codProd && codProd === '3001' && (
              <React.Fragment>
                <Col xs={24} sm={24} md={8}>
                  <Form.Item label="Planilla" validateStatus={planillaError ? 'error' : ''} help={planillaError || ''}>
                    {getFieldDecorator('planilla')(<Input placeholder="Planilla" maxLength={20} />)}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Form.Item
                    label="Aplicación"
                    validateStatus={aplicacionError ? 'error' : ''}
                    help={aplicacionError || ''}
                  >
                    {getFieldDecorator('aplicacion')(<Input placeholder="Aplicación" maxLength={20} />)}
                  </Form.Item>
                </Col>
              </React.Fragment>
            )}
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                onClick={this.handleSearch}
                disabled={this.handleButton(
                  isFieldsTouched(),
                  hasErrors(getFieldsError()),
                  hasValues(getFieldsValue())
                )}
              >
                Buscar
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>
    );
  }
}

export default connect()(Form.create()(FormCertificado));
