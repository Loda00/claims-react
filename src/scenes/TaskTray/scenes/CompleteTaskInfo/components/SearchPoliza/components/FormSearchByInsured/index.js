import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Button, DatePicker } from 'antd';
import { ROLE_TYPE, CONSTANTS_APP } from 'constants/index';
import SearchdAndInput from 'components/InsuredInput/index';
import { showErrorMessage, hasErrors } from 'util/index';
import * as policyActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/actions';
import { ValidationMessage } from 'util/validation';

class FormSearchByProductoPoliza extends React.Component {
  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSearch = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.setCurrentValidFormFields(values);
        this.props.dispatch(policyActionCreators.fetchPolicies(values)).finally(resp => {
          if (this.props.errorPolicies) {
            showErrorMessage(this.props.errorPolicies.message);
          }
        });
      }
    });
  };

  checkAsegurado = (rule, value, callback) => {
    if (value && value.terceroElegido != null) {
      callback();
      return;
    }

    callback(ValidationMessage.NOT_VALID);
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched },
      loadingExistingPolicy
    } = this.props;
    const aseguradoError = isFieldTouched('asegurado') && getFieldError('asegurado');
    const fechaOcurrenciaError = isFieldTouched('fechaOcurrencia') && getFieldError('fechaOcurrencia');

    return (
      <Col span={24}>
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item label="Asegurado" validateStatus={aseguradoError ? 'error' : ''} help={aseguradoError || ''}>
                {getFieldDecorator('asegurado', {
                  rules: [
                    { validator: this.checkAsegurado },
                    {
                      required: true,
                      message: ValidationMessage.REQUIRED
                    }
                  ]
                })(<SearchdAndInput roleType={ROLE_TYPE.ASEGURADO} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Fecha de ocurrencia"
                validateStatus={fechaOcurrenciaError ? 'error' : ''}
                help={fechaOcurrenciaError || ''}
              >
                {getFieldDecorator('fechaOcurrencia')(<DatePicker.RangePicker format={CONSTANTS_APP.FORMAT_DATE} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                onClick={this.handleSearch}
                disabled={hasErrors(getFieldsError()) || loadingExistingPolicy}
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

export default connect()(Form.create()(FormSearchByProductoPoliza));
