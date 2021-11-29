import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Input, Button } from 'antd';
import { TIPO_TERCERO } from 'constants/index';
import { showErrorMessage, hasErrors } from 'util/index';

import * as thirdPartyActionCreators from 'components/SearchInsured/data/thirdparty/actions';
import { ValidationMessage } from 'util/validation';

class FormPersonaNatural extends React.Component {
  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSearch = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props
          .dispatch(thirdPartyActionCreators.fetchThirdParty(values, this.props.roleType, TIPO_TERCERO.PRIVADO))
          .finally(resp => {
            if (this.props.errorThirdparty) {
              showErrorMessage(this.props.errorThirdparty.message);
            }
          });
      }
    });
  };

  render() {
    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
    const nombresError = isFieldTouched('nombres') && getFieldError('nombres');
    const apellidoPaternoError = isFieldTouched('apellidoPaterno') && getFieldError('apellidoPaterno');
    const apellidoMaternoError = isFieldTouched('apellidoMaterno') && getFieldError('apellidoMaterno');

    return (
      <Form>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="Nombres" validateStatus={nombresError ? 'error' : ''} help={nombresError || ''}>
              {getFieldDecorator('nombres', {
                rules: [
                  {
                    required: true,
                    message: ValidationMessage.REQUIRED
                  },
                  {
                    type: 'string',
                    message: ValidationMessage.NOT_VALID,
                    pattern: /^[^0-9]+$/
                  }
                ]
              })(<Input placeholder="Nombres" maxLength={100} />)}
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              label="Apellido Paterno"
              validateStatus={apellidoPaternoError ? 'error' : ''}
              help={apellidoPaternoError || ''}
            >
              {getFieldDecorator('apellidoPaterno', {
                rules: [
                  {
                    required: true,
                    message: ValidationMessage.REQUIRED
                  },
                  {
                    type: 'string',
                    message: ValidationMessage.NOT_VALID,
                    pattern: /^[^0-9]+$/
                  }
                ]
              })(<Input placeholder="Apellido Paterno" maxLength={110} />)}
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <Form.Item
              label="Apellido Materno"
              validateStatus={apellidoMaternoError ? 'error' : ''}
              help={apellidoMaternoError || ''}
            >
              {getFieldDecorator('apellidoMaterno', {
                rules: [
                  {
                    required: true,
                    message: ValidationMessage.REQUIRED
                  },
                  {
                    type: 'string',
                    message: ValidationMessage.NOT_VALID,
                    pattern: /^[^0-9]+$/
                  }
                ]
              })(<Input placeholder="Apellido Materno" maxLength={110} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button
              style={{ marginLeft: 8 }}
              type="primary"
              key="submit"
              htmlType="submit"
              onClick={this.handleSearch}
              disabled={hasErrors(getFieldsError())}
            >
              Buscar
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default connect()(Form.create()(FormPersonaNatural));
