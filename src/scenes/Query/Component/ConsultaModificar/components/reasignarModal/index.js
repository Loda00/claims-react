import React from 'react';
import { Modal, Select, Form, Col, Row, Button } from 'antd';
import { ValidationMessage } from 'util/validation';
import { connect } from 'react-redux';
import { showErrorMessage } from 'util/index';
import { getReasignar } from 'scenes/Query/Component/ConsultarSiniestro/data/reasignar/reducer';
import { getListEjecutivo } from 'scenes/Query/Component/ConsultarSiniestro/data/listaEjecutivo/reducer';
import * as reasignarCreators from 'scenes/Query/Component/ConsultarSiniestro/data/reasignar/action';
import * as ejecutivosCreators from 'scenes/Query/Component/ConsultarSiniestro/data/listaEjecutivo/action';
import * as detalleSiniestroCreators from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/actions';

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class ReasignarModal extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;

    try {
      dispatch(ejecutivosCreators.fetchListEjecutivo());
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch(ejecutivosCreators.fetchListEjecutivoReset());
    dispatch(reasignarCreators.fetchListReasignarReset());
    dispatch(detalleSiniestroCreators.fetchSinisterReset());
  }

  cancelarModalReaperturar = () => {
    const { cambiarEstadoModal } = this.props;

    cambiarEstadoModal(false);
  };

  aceptarModalReaperturar = async () => {
    const {
      form: { getFieldValue },
      dataSinister,
      cambiarEstadoModal,
      numSiniestro,
      dispatch,
      redirectToTarget,
      disabledTodoReasignar
    } = this.props;

    const personaActual = parseInt(dataSinister.idEjecutivo, 12);
    const personaNuevo = getFieldValue('ejecutivoReasignar');
    const siniestro = numSiniestro;

    try {
      disabledTodoReasignar(true);

      const response = await dispatch(reasignarCreators.fetchListReasignar(personaActual, personaNuevo, siniestro));

      cambiarEstadoModal(false);

      if (response.code === 'CRG-000') {
        Modal.success({
          title: 'Reasignar siniestro',
          content: (
            <div>
              <p>{response.message}</p>
            </div>
          )
        });

        redirectToTarget();
      } else {
        Modal.error({
          title: 'Reasignar siniestro',
          content: (
            <div>
              <p>{response.message}</p>
            </div>
          )
        });
      }
    } catch (e) {
      showErrorMessage(e);
    }
  };

  render() {
    const {
      mostrarModalReasignar,
      disabledTodoModal,
      form,
      dataSinister,
      listaEjecutivo,
      loadingReasignar,
      loadingListaEjecutivo
    } = this.props;

    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = form;
    const ejecutivoReasignarError = isFieldTouched('ejecutivoReasignar') && getFieldError('ejecutivoReasignar');
    const ejecutivosPosibles = listaEjecutivo.filter(ejecutivo => ejecutivo.IDPERSONA !== dataSinister.idEjecutivo);
    const ejecutivosItems = ejecutivosPosibles.map(item => (
      <Select.Option key={item.IDPERSONA} value={item.IDPERSONA}>
        {`${item.IDPERSONA} - ${item.NOMBRES}`}{' '}
      </Select.Option>
    ));
    const ejecutivoActual = `${dataSinister.nombresEjecutivo}`.toUpperCase();

    // const ejecutivoActual = ejecutivo.toLowerCase();

    return (
      <React.Fragment>
        <Modal
          visible={mostrarModalReasignar}
          onOk={this.aceptarModalReaperturar}
          okButtonProps={{ disabled: hasErrors(getFieldsError()) }}
          onCancel={this.cancelarModalReaperturar}
          maskClosable={false}
          destroyOnClose
          footer={[
            <Button key="back" onClick={this.cancelarModalReaperturar} disabled={disabledTodoModal}>
              Cancelar
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loadingReasignar}
              disabled={hasErrors(getFieldsError())}
              onClick={this.aceptarModalReaperturar}
            >
              Aceptar
            </Button>
          ]}
        >
          <Form>
            <h2>Reasignar siniestro</h2>
            <Row gutter={24}>
              <Col xs={24} sm={42} md={24} lg={24} xl={24}>
                <div className="claims-rrgg-description-list-index-term">Ejecutivo siniestro - actual</div>
                <div className="claims-rrgg-description-list-index-detail">
                  <span>{ejecutivoActual}</span>
                </div>
              </Col>
              <Col xs={24} sm={42} md={24} lg={24} xl={24}>
                <Form.Item
                  label="Ejecutivo siniestro - nuevo"
                  validateStatus={ejecutivoReasignarError ? 'error' : ''}
                  help={ejecutivoReasignarError || ''}
                >
                  {getFieldDecorator('ejecutivoReasignar', {
                    rules: [
                      {
                        required: true,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Select
                      placeholder="Seleccione ejecutivo"
                      disabled={disabledTodoModal}
                      loading={loadingListaEjecutivo}
                    >
                      {ejecutivosItems}
                    </Select>
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
  const reasignar = getReasignar(state);
  const listaEjecutivo = getListEjecutivo(state);
  return {
    reasignar,
    loadingReasignar: reasignar.isLoading,

    listaEjecutivo: listaEjecutivo.listaEjecutivo,
    loadingListaEjecutivo: listaEjecutivo.isLoading,

    userClaims: state.services.user.userClaims,
    showScroll: state.services.device.scrollActivated
  };
}

export default connect(mapStateToProps)(Form.create()(ReasignarModal));
