import React from 'react';
import { connect } from 'react-redux';
import { CONSTANTS_APP } from 'constants/index';
import { ValidationMessage } from 'util/validation';
import { showErrorMessage, hasErrors } from 'util/index';
import { Form, Row, Col, Button, DatePicker, Input } from 'antd';
import * as polizaLiderActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/bscPolizaLider/actions';

class FormSearchByPolizaLider extends React.Component {
  componentDidMount() {
    const {
      form: { validateFields }
    } = this.props;
    validateFields();
  }

  componentWillUnmount() {
    const { reset } = this.props;

    reset();
  }

  // Fn aún se va a modificar ya que falta validar en caso de error y servicio configurado
  handleSearch = () => {
    const {
      errorPoliza,
      buscarPolizaLider,
      actualizarPaginacion,
      form: { validateFields },
      setCurrentValidFormFields
    } = this.props;

    validateFields(async (err, values) => {
      if (!err) {
        setCurrentValidFormFields(values);
        actualizarPaginacion(1);
        buscarPolizaLider(values).finally(resp => {
          if (errorPoliza) {
            showErrorMessage(errorPoliza.message);
          }
        });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched }
    } = this.props;
    const polizaLiderError = isFieldTouched('polizaLider') && getFieldError('polizaLider');
    const fechaOcurrenciaError = isFieldTouched('fechaOcurrenciaPoLider') && getFieldError('fechaOcurrenciaPoLider');

    return (
      <Col span={24}>
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="N&uacute;mero de p&oacute;liza l&iacute;der"
                validateStatus={polizaLiderError ? 'error' : ''}
                help={polizaLiderError || ''}
              >
                {getFieldDecorator('polizaLider', {
                  rules: [
                    { required: true, message: ValidationMessage.REQUIRED },
                    { type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^\d{4,}$/ }
                  ]
                })(<Input placeholder="Ingrese número" maxLength={30} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Fecha de ocurrencia"
                validateStatus={fechaOcurrenciaError ? 'error' : ''}
                help={fechaOcurrenciaError || ''}
              >
                {getFieldDecorator('fechaOcurrenciaPoLider')(
                  <DatePicker.RangePicker format={CONSTANTS_APP.FORMAT_DATE} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={this.handleSearch}
                disabled={hasErrors(getFieldsError())}
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

const mapDispatchToProps = dispatch => ({
  buscarPolizaLider: json => dispatch(polizaLiderActionCreators.fetchPoliza(json)),
  actualizarPaginacion: json => dispatch(polizaLiderActionCreators.updatePage(json)),
  reset: () => dispatch(polizaLiderActionCreators.fetchPolizaLiderReset())
});

export default connect(
  null,
  mapDispatchToProps
)(Form.create()(FormSearchByPolizaLider));
