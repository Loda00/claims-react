import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Col, Row, Select, Input, Button } from 'antd';
import { ValidationMessage } from 'util/validation';
import { showErrorMessage } from 'util';
import { obtenerMotivosAnular } from 'scenes/components/Anular/data/motivoAnular/reducer';
import { getAnularSiniestro } from 'scenes/components/Anular/data/anularSiniestro/reducer';
import { MOTIVOS_ANULAR, CONSTANTS_APP } from 'constants/index';
import * as motivoAnularCreator from 'scenes/components/Anular/data/motivoAnular/action';
import * as anularSiniestroCreator from 'scenes/components/Anular/data/anularSiniestro/action';

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class Anular extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deshabilitarModalAnular: false
    };
  }

  componentDidMount() {
    const {
      form: { validateFields, resetFields },
      dispatch
    } = this.props;

    try {
      dispatch(motivoAnularCreator.fetchMotivoAnular());
    } catch (e) {
      showErrorMessage(e);
    }

    resetFields();
    validateFields();
  }

  showInfoAnular = async () => {
    const {
      history,
      dispatch,
      userClaims,
      redirectToHome,
      limpiarForm = () => {},
      restablecerValores = () => {},
      datosSiniestroSeleccionado = {},
      form: { getFieldValue, resetFields }
    } = this.props;

    const numSiniestro = datosSiniestroSeleccionado.nrocaso || null;
    let codMotivo = getFieldValue('motivoAnular');
    let dscMotivo = 'ninguno';
    const observacion = getFieldValue('observacionAnular');
    const numId = userClaims.idCore ? userClaims.idCore.toString() : null;
    const idUsuarioBizagi = userClaims.email;

    const {
      MOTIVO1: { ID1, DSCMOTIVO1: ERROR_DE_DECLARACION },
      MOTIVO2: { ID2, DSCMOTIVO2: DESESTIMIENTO_DEL_CLIENTE },
      MOTIVO4: { ID4, DSCMOTIVO4: CUBIERTO_POR_EL_DEDUCIBLE },
      MOTIVO5: { ID5, DSCMOTIVO5: PROBLEMA_CON_POLIZA_MIGRADA },
      MOTIVO6: { ID6, DSCMOTIVO6: CLIENTE_DEJA_SIN_EFECTO_SU_RECLAMO },
      MOTIVO7: { ID7, DSCMOTIVO7: CLIENTE_NO_LLEVÓ_SU_PRODUCTO_AL_SERVICIO_TÉCNICO }
    } = MOTIVOS_ANULAR;

    const motivoRecortado = codMotivo.substr(0, 4);

    if (motivoRecortado === ID1) {
      dscMotivo = ERROR_DE_DECLARACION;
    } else if (motivoRecortado === ID2) {
      dscMotivo = DESESTIMIENTO_DEL_CLIENTE;
    } else if (motivoRecortado === ID4) {
      dscMotivo = CUBIERTO_POR_EL_DEDUCIBLE;
    } else if (motivoRecortado === ID5) {
      dscMotivo = PROBLEMA_CON_POLIZA_MIGRADA;
    } else if (motivoRecortado === ID6) {
      dscMotivo = CLIENTE_DEJA_SIN_EFECTO_SU_RECLAMO;
    } else if (motivoRecortado === ID7) {
      dscMotivo = CLIENTE_NO_LLEVÓ_SU_PRODUCTO_AL_SERVICIO_TÉCNICO;
    }

    codMotivo = motivoRecortado;

    const txtMotivo = `${dscMotivo} - ${observacion.toUpperCase()}`;

    try {
      this.setState({
        deshabilitarModalAnular: true
      });
      const response = await dispatch(
        anularSiniestroCreator.fecthAnularSiniestro(numSiniestro, codMotivo, numId, txtMotivo, idUsuarioBizagi)
      );

      if (response.code === 'CRG-000') {
        if (redirectToHome) redirectToHome();
        Modal.success({
          title: 'Anular siniestro',
          onOk: () => {
            if (history) history.push('/tareas');
          },
          content: (
            <div>
              <p>{response.message}</p>
            </div>
          )
        });
        resetFields('motivoAnular');
        resetFields('observacionAnular');
        this.setState({
          deshabilitarModalAnular: false
        });
        limpiarForm();
      } else {
        Modal.error({
          title: 'Anular siniestro',
          content: (
            <div>
              <p>{response.message}</p>
            </div>
          )
        });
        this.setState({
          deshabilitarModalAnular: false
        });
        limpiarForm();
        return;
      }
    } catch (error) {
      const { response: { status } = {} } = error;
      if (status === 504) {
        Modal.info({
          title: 'Anular siniestro',
          content: `La anulación se está procesando, verifique/reintente en un momento - ${numSiniestro}.`
        });
        this.setState({
          deshabilitarModalAnular: false
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
    const { modalVisibleAnular, handleCancel, form, motivos, loadingMotivos, loadingAnularSiuniestro } = this.props;

    const { deshabilitarModalAnular } = this.state;

    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = form;
    const motivoAnularError = isFieldTouched('motivoAnular') && getFieldError('motivoAnular');
    const observacionAnularError = isFieldTouched('observacionAnular') && getFieldError('observacionAnular');

    const motivosItems = motivos.motivos.map(item => (
      <Select.Option key={item.valor} value={item.valor}>{`${item.valor} - ${item.descripcion}`}</Select.Option>
    ));

    return (
      <React.Fragment>
        <Modal
          visible={modalVisibleAnular}
          onOk={this.showInfoAnular}
          okButtonProps={{ disabled: hasErrors(getFieldsError()) }}
          onCancel={handleCancel}
          maskClosable={false}
          destroyOnClose
          footer={[
            <Button key="back" onClick={handleCancel} disabled={deshabilitarModalAnular}>
              Cancelar
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loadingAnularSiuniestro}
              disabled={hasErrors(getFieldsError())}
              onClick={this.showInfoAnular}
            >
              Aceptar
            </Button>
          ]}
        >
          <Form>
            <h2>Anular siniestro</h2>
            <Row gutter={24}>
              <Col>
                <Form.Item
                  label="Motivo"
                  validateStatus={motivoAnularError ? 'error' : ''}
                  help={motivoAnularError || ''}
                >
                  {getFieldDecorator('motivoAnular', {
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
                    <Select placeholder="Seleccione motivo" loading={loadingMotivos} disabled={deshabilitarModalAnular}>
                      {motivosItems}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label="Observación"
                  validateStatus={observacionAnularError ? 'error' : ''}
                  help={observacionAnularError || ''}
                >
                  {getFieldDecorator('observacionAnular', {
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
                      disabled={deshabilitarModalAnular}
                      maxLength="5000"
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
  const motivos = obtenerMotivosAnular(state);
  const anularSiniestro = getAnularSiniestro(state);
  return {
    motivos,
    loadingMotivos: motivos.isLoading,

    anularSiniestro,
    loadingAnularSiuniestro: anularSiniestro.isLoading,

    userClaims: state.services.user.userClaims,
    showScroll: state.services.device.scrollActivated
  };
}

export default connect(mapStateToProps)(Form.create()(Anular));
