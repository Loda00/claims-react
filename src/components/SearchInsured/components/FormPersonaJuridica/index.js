import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Input, Button } from 'antd';
import { TIPO_TERCERO } from 'constants/index';
import { showErrorMessage, hasErrors } from 'util/index';
import * as thirdPartyActionCreators from 'components/SearchInsured/data/thirdparty/actions';
import { ValidationMessage } from 'util/validation';

class FormPersonaJuridica extends React.Component {
  componentDidMount() {
    this.props.form.validateFields();
  }

  handleSearch = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props
          .dispatch(thirdPartyActionCreators.fetchThirdParty(values, this.props.roleType, TIPO_TERCERO.EMPRESA))
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

    const razonSocialError = isFieldTouched('razonSocial') && getFieldError('razonSocial');

    return (
      <Form>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label="Raz&oacute;n Social"
              validateStatus={razonSocialError ? 'error' : ''}
              help={razonSocialError || ''}
            >
              {getFieldDecorator('nombres', {
                rules: [
                  {
                    required: true,
                    message: ValidationMessage.REQUIRED
                  }
                ]
              })(<Input placeholder="Raz&oacute;n Social" maxLength={100} />)}
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

export default connect()(Form.create()(FormPersonaJuridica));
