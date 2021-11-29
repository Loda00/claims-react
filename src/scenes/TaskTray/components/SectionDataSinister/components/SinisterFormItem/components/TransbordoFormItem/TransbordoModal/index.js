import React from 'react';
import { Form, Row, Col, Modal, Input } from 'antd';
import { ValidationMessage } from 'util/validation';
import { showErrorMessage, hasErrors } from 'util/index';
import { isNullOrUndefined } from 'util';

class TransbordoModal extends React.Component {
  state = {
    loadingTransbordo: false
  };

  componentDidMount() {
    const { manejadorFuncionesHijos } = this.props;
    manejadorFuncionesHijos(this.validarCampos.bind(this));
  }

  onOk = async () => {
    this.setState({ loadingTransbordo: true });

    const {
      onOkModalHandler,
      form: { validateFields }
    } = this.props;

    try {
      const value = await validateFields();
      onOkModalHandler(value);
    } catch (e) {
      showErrorMessage(String('Error en la validacion de los datos'));
    } finally {
      this.setState({ loadingTransbordo: false });
    }
  };

  validarCampos() {
    const {
      form: { validateFields }
    } = this.props;
    validateFields();
  }

  render() {
    const {
      visible,
      onCancelModalHandler,
      editTrasbordo,
      afterCloseModalHandler,
      form: { getFieldDecorator, getFieldError, getFieldsError, isFieldTouched }
    } = this.props;

    const { loadingTransbordo } = this.state;

    const nombreTransporteTrasbordoError =
      isFieldTouched('nombreTransporteTrasbordoModal') && getFieldError('nombreTransporteTrasbordoModal');
    const lugarTrasbordoError = isFieldTouched('lugarTrasbordoModal') && getFieldError('lugarTrasbordoModal');

    return (
      <Modal
        centered
        visible={visible}
        onOk={this.onOk}
        okButtonProps={{
          disabled: hasErrors(getFieldsError()) || loadingTransbordo
        }}
        onCancel={onCancelModalHandler}
        afterClose={afterCloseModalHandler}
        cancelText="Cancelar"
        width="600px"
        okText={!isNullOrUndefined(editTrasbordo) ? 'Modificar' : 'Agregar'}
        destroyOnClose
      >
        <Form>
          <h2>Trasbordo</h2>
          <Row gutter={24}>
            {getFieldDecorator('idTrasbordo', {
              initialValue: (editTrasbordo && editTrasbordo.idTrasbordo) || undefined
            })(<Input type="hidden" />)}
            {getFieldDecorator('rowKey', {
              initialValue: !isNullOrUndefined(editTrasbordo) ? editTrasbordo.rowKey : undefined
            })(<Input type="hidden" />)}
            {getFieldDecorator('action', {
              initialValue: (editTrasbordo && 'U') || 'N'
            })(<Input type="hidden" />)}
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Nombre de transporte de transbordo"
                validateStatus={nombreTransporteTrasbordoError ? 'error' : ''}
                help={nombreTransporteTrasbordoError || ''}
              >
                {getFieldDecorator('nombre', {
                  initialValue: (editTrasbordo && editTrasbordo.nombre) || undefined,
                  rules: [
                    {
                      required: true,
                      message: ValidationMessage.REQUIRED
                    },
                    {
                      whitespace: true,
                      message: ValidationMessage.NOT_VALID
                    }
                  ]
                })(<Input maxLength="50" />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12} xl={12}>
              <Form.Item
                label="Lugar de transbordo"
                validateStatus={lugarTrasbordoError ? 'error' : ''}
                help={lugarTrasbordoError || ''}
              >
                {getFieldDecorator('lugar', {
                  initialValue: !isNullOrUndefined(editTrasbordo) ? editTrasbordo.lugar : '',
                  rules: [
                    {
                      required: true,
                      message: ValidationMessage.REQUIRED
                    },
                    {
                      whitespace: true,
                      message: ValidationMessage.NOT_VALID
                    }
                  ]
                })(<Input maxLength="50" />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(TransbordoModal);
