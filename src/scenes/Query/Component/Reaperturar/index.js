import React from 'react';
import { connect } from 'react-redux';
import { Modal, Col, Row, Form, Select, Input, Button } from 'antd';
import { showErrorMessage } from 'util/index';
import { ValidationMessage } from 'util/validation';
import { CONSTANTS_APP } from 'constants/index';
import { obtenerMotivosReaperturar } from 'scenes/Query/Component/Reaperturar/data/motivoReaperturar/reducer';
import { getReaperturarSiniestro } from 'scenes/Query/Component/Reaperturar/data/reaperturarSiniestro/reducer';
import * as motivoReaperturarCreator from 'scenes/Query/Component/Reaperturar/data/motivoReaperturar/action';
import * as reaperturarSiniestroCreator from 'scenes/Query/Component/Reaperturar/data/reaperturarSiniestro/action';

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class Reaperturar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deshabilitarModalReaperturar: false
    };
  }

  componentDidMount() {
    const {
      form: { validateFields, resetFields },
      dispatch
    } = this.props;

    try {
      dispatch(motivoReaperturarCreator.fetchMotivo());
    } catch (e) {
      showErrorMessage(e);
    }

    resetFields();
    validateFields();
  }

  showInfoReaperturar = async () => {
    const { datosSiniestroSeleccionado } = this.props;

    const {
      form: { getFieldValue },
      restablecerValores,
      userClaims,
      dispatch,
      limpiarForm
    } = this.props;

    const numSiniestro = datosSiniestroSeleccionado.nrocaso || null;
    const codMotivo = getFieldValue('motivoReaperturar');
    const descMotivo = getFieldValue('observacionReaperturar');
    const numId = userClaims.idCore ? userClaims.idCore.toString() : null;
    const idUsuarioBizagi = userClaims.email;

    try {
      this.setState({
        deshabilitarModalReaperturar: true
      });

      const response = await dispatch(
        reaperturarSiniestroCreator.fecthReaperturarSiniestro(
          numSiniestro,
          codMotivo,
          numId,
          descMotivo,
          idUsuarioBizagi
        )
      );

      if (response.code === 'CRG-000') {
        Modal.success({
          title: 'Reaperturar siniestro',
          content: (
            <div>
              <p>{response.message}</p>
            </div>
          )
        });
        limpiarForm();
        this.setState({
          deshabilitarModalReaperturar: false
        });
      } else {
        Modal.error({
          title: 'Reaperturar siniestro',
          content: (
            <div>
              <p>{response.message}</p>
            </div>
          )
        });
        limpiarForm();
        this.setState({
          deshabilitarModalReaperturar: false
        });
      }
    } catch (error) {
      const { response: { status } = {} } = error;
      if (status === 504) {
        Modal.info({
          title: 'Reaperturar siniestro',
          content: `La reapertura se está procesando, verifique/reintente en un momento - ${numSiniestro}.`
        });
        this.setState({
          deshabilitarModalReaperturar: false
        });
        limpiarForm();
        restablecerValores();
        return;
      }
      showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    }
    restablecerValores();
  };

  render() {
    const {
      modalVisibleReaperturar,
      handleCancel,
      form,
      motivosReaperturar,
      loadingReaperturarSiniestro,
      loadingMotivos
    } = this.props;

    const { deshabilitarModalReaperturar } = this.state;

    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = form;

    const motivoReaperturarError = isFieldTouched('motivoReaperturar') && getFieldError('motivoReaperturar');
    const observacionReaperturarError =
      isFieldTouched('observacionReaperturar') && getFieldError('observacionReaperturar');

    const motivosItems = motivosReaperturar.motivos.map(item => (
      <Select.Option key={item.valor} value={item.valor}>{`${item.valor} - ${item.descripcion}`}</Select.Option>
    ));

    return (
      <React.Fragment>
        <Modal
          visible={modalVisibleReaperturar}
          onOk={this.showInfoReaperturar}
          okButtonProps={{ disabled: hasErrors(getFieldsError()) }}
          onCancel={handleCancel}
          maskClosable={false}
          destroyOnClose
          footer={[
            <Button key="back" onClick={handleCancel} disabled={deshabilitarModalReaperturar}>
              Cancelar
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loadingReaperturarSiniestro}
              disabled={hasErrors(getFieldsError())}
              onClick={this.showInfoReaperturar}
            >
              Aceptar
            </Button>
          ]}
        >
          <Form>
            <h2>Reaperturar siniestro</h2>
            <Row gutter={24}>
              <Col>
                <Form.Item
                  label="Motivo"
                  validateStatus={motivoReaperturarError ? 'error' : ''}
                  help={motivoReaperturarError || ''}
                >
                  {getFieldDecorator('motivoReaperturar', {
                    rules: [
                      {
                        type: 'string',
                        message: ValidationMessage.NOT_VALID
                      },
                      {
                        required: true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Select
                      placeholder="Seleccione motivo"
                      loading={loadingMotivos}
                      disabled={deshabilitarModalReaperturar}
                    >
                      {motivosItems}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label="Observación"
                  validateStatus={observacionReaperturarError ? 'error' : ''}
                  help={observacionReaperturarError || ''}
                >
                  {getFieldDecorator('observacionReaperturar', {
                    rules: [
                      {
                        required: true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Input.TextArea
                      placeholder="Ingrese observación"
                      autosize={{ minRows: 2, maxRows: 5 }}
                      disabled={deshabilitarModalReaperturar}
                      maxLength={5000}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const motivosReaperturar = obtenerMotivosReaperturar(state);
  const reaperturarSiniestro = getReaperturarSiniestro(state);
  return {
    motivosReaperturar,
    loadingMotivos: motivosReaperturar.isLoading,

    reaperturarSiniestro,
    loadingReaperturarSiniestro: reaperturarSiniestro.isLoading,

    userClaims: state.services.user.userClaims,
    showScroll: state.services.device.scrollActivated
  };
}

export default connect(mapStateToProps)(Form.create()(Reaperturar));
