import React from 'react';
import { Form, Row, Col, Modal, Input, Select } from 'antd';
import { ValidationMessage } from 'util/validation';
import { showErrorMessage, hasErrors } from 'util/index';
import PriceInputNoSymbol from 'components/PriceInputNoSymbol';

class EmbarqueModal extends React.Component {
  componentDidMount() {
    const { manejadorFuncionesHijos } = this.props;
    manejadorFuncionesHijos(this.validarCampos.bind(this));
  }

  onOk = async () => {
    const {
      onOkModalHandler,
      form: { validateFields }
    } = this.props;
    try {
      const value = await validateFields();
      Object.assign(value, { valor: value.valor.number });
      onOkModalHandler(value);
    } catch (e) {
      showErrorMessage(String('Error en la validacion de los datos'));
    }
  };

  checkPrice = (rule, value, callback) => {
    if (typeof value === 'undefined') {
      callback(ValidationMessage.REQUIRED);
      return;
    }
    if (typeof value.number === 'undefined') {
      callback('Ingrese monto reserva');
      return;
    }

    if (typeof value !== 'undefined' && value.number <= 0) {
      callback('El monto debe ser mayor que cero');
      return;
    }
    callback();
  };

  validarCampos() {
    const {
      form: { validateFields }
    } = this.props;
    validateFields();
  }

  render() {
    const {
      editEmbarque,
      visible,
      onCancel,
      afterCloseModalHandler,
      constListaIncoterms,
      form: { getFieldDecorator, getFieldError, isFieldTouched, getFieldsError }
    } = this.props;
    const codigoError = isFieldTouched('codigo') && getFieldError('codigo');
    const valorError = isFieldTouched('valor') && getFieldError('valor');

    return (
      <div>
        <Modal
          centered
          visible={visible}
          okText={editEmbarque ? 'Modificar' : 'Agregar'}
          cancelText="Cancelar"
          onOk={this.onOk}
          okButtonProps={{
            disabled: hasErrors(getFieldsError())
          }}
          onCancel={onCancel}
          width="600px"
          afterClose={afterCloseModalHandler}
          destroyOnClose
        >
          <Form>
            <h2>{(editEmbarque && `Modificar`) || `Agregar`} Incoterms</h2>
            <Row gutter={24}>
              {getFieldDecorator('key', {
                initialValue: (editEmbarque && editEmbarque.key) || undefined
              })(<Input type="hidden" />)}
              {getFieldDecorator('action', {
                initialValue: (editEmbarque && 'U') || 'N'
              })(<Input type="hidden" />)}
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item label="C&oacute;digo" validateStatus={codigoError ? 'error' : ''} help={codigoError || ''}>
                  {getFieldDecorator('codigo', {
                    initialValue: (editEmbarque && editEmbarque.codigo) || undefined,
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
                  })(
                    <Select placeholder="Seleccione c&oacute;digo" disabled={!!editEmbarque}>
                      {constListaIncoterms.map(incoterm => {
                        return (
                          <Select.Option key={incoterm.valor} value={incoterm.valor}>
                            {incoterm.descripcion}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                <Form.Item label="Valor" validateStatus={valorError ? 'error' : ''} help={valorError || ''}>
                  {getFieldDecorator('valor', {
                    initialValue: {
                      number: (editEmbarque && editEmbarque.valor) || undefined
                    },
                    rules: [{ validator: this.checkPrice }]
                  })(<PriceInputNoSymbol placeholder="0" />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}
export default Form.create()(EmbarqueModal);
