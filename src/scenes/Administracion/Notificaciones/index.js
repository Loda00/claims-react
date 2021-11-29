import React from 'react';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { Col, Select, Form, Row, Input, Button, Tooltip, Icon, Modal } from 'antd';

import { showErrorMessage } from 'util/index';
import { ValidationMessage } from 'util/validation';

import { getBuscarNotificaciones } from 'scenes/Administracion/data/buscarNotificaciones/reducer';

import * as buscarNotificacionesCreators from 'scenes/Administracion/data/buscarNotificaciones/action';
import * as actualizarParametrosNotificacionesCreators from 'scenes/Administracion/data/actualizarParametrosNotificaciones/action';

import './styles.css';

class Notificaciones extends React.Component {
  state = {
    notificacionSeleccionada: [],
    validateDisabledSave: true
  };

  async componentDidMount() {
    const { buscarNotificaciones } = this.props;
    try {
      await buscarNotificaciones(null);
    } catch (e) {
      showErrorMessage(e.message);
    }
  }

  changueSelectNotifications = value => {
    const {
      form: { setFieldsValue },
      busquedaNotificaciones
    } = this.props;

    const filtroNotificaciones = busquedaNotificaciones.buscarNotificaciones.filter(
      notificacion => notificacion.nombreNotif === value
    );

    if (!isEmpty(filtroNotificaciones)) {
      const {
        diasInicio,
        diasTotal,
        diasFrec2,
        copiaCond2,
        copiaCuando2,
        diasFrec3,
        copiaCond3,
        copiaCuando3,
        estActual,
        comentario
      } = filtroNotificaciones[0];

      setFieldsValue({
        notificationsStart: diasInicio !== null ? diasInicio : '',
        notificationDuration: diasTotal !== null ? diasTotal : '',
        ConditionTwoFrequencySending: diasFrec2 !== null ? diasFrec2 : '',
        indicadorcopia2: copiaCond2 !== null ? copiaCond2 : '',
        ConditionTwoNumSending: copiaCuando2 !== null ? copiaCuando2 : '',
        ConditionThreeFrequencySending: diasFrec3 !== null ? diasFrec3 : '',
        indicadorcopia3: copiaCond3 !== null ? copiaCond3 : '',
        ConditionThreeNumSending: copiaCuando3 !== null ? copiaCuando3 : '',
        estado: estActual !== null ? estActual : '',
        comentario: comentario !== null ? comentario : ''
      });

      this.setState({
        notificacionSeleccionada: filtroNotificaciones,
        validateDisabledSave: false
      });
    }
  };

  editarParametrosDeNotificaciones = async () => {
    const {
      form: { validateFields },
      buscarNotificaciones,
      actualizarParamNotificaciones
    } = this.props;

    const values = await validateFields();
    try {
      const response = await actualizarParamNotificaciones(values);
      if (response.code === 'CRG-000') {
        Modal.success({
          title: 'Se actualizó los parámetros de notificaciones',
          content: response.message,
          centered: true,
          okText: 'Aceptar',
          onOk: await buscarNotificaciones(null)
        });
      } else {
        Modal.error({
          title: response.message,
          centered: true,
          okText: 'Cerrar'
        });
      }
    } catch (e) {
      Modal.error({
        title: e.message,
        centered: true,
        okText: 'Cerrar'
      });
    }
  };

  limpiarFormularioNotificaciones = () => {
    const {
      form: { setFieldsValue }
    } = this.props;

    setFieldsValue({
      notification: undefined,
      notificationsStart: '',
      notificationDuration: '',
      ConditionTwoFrequencySending: '',
      indicadorcopia2: '',
      ConditionTwoNumSending: '',
      ConditionThreeFrequencySending: '',
      indicadorcopia3: '',
      ConditionThreeNumSending: '',
      estado: '',
      comentario: ''
    });

    this.setState({
      notificacionSeleccionada: []
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;
    history.push('/');
  };

  render() {
    const { Option } = Select;
    const {
      busquedaNotificaciones,
      form: { getFieldDecorator },
      loadingBuscarNotificaciones
    } = this.props;

    const { validateDisabledSave, notificacionSeleccionada } = this.state;

    const optionsNotificaciones = busquedaNotificaciones.buscarNotificaciones.map(notificacion => (
      <Option key={notificacion.nombreNotif} value={notificacion.nombreNotif}>
        {notificacion.dscnotificacion}
      </Option>
    ));

    const reglas = [
      { required: true, message: ValidationMessage.REQUIRED },
      { pattern: /^[0-9]+$/, message: ValidationMessage.NOT_VALID, whitespace: true }
    ];

    return (
      <React.Fragment>
        <h1>ENVÍO DE NOTIFICACIONES</h1>
        <Form>
          <div className="seccion_claims">
            <Row gutter={24} type="flex" justify="center">
              <Col xs={18} sm={19} md={13} lg={12} xl={11}>
                <Form.Item span="Tipo de notificación">
                  {getFieldDecorator('notification')(
                    <Select
                      placeholder="Seleccione una notificación"
                      onChange={this.changueSelectNotifications}
                      showSearch
                      optionFilterProp="children"
                      loading={loadingBuscarNotificaciones}
                      filterOption={(inputValue, option) =>
                        option.props.children[1].toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                    >
                      {optionsNotificaciones}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="seccion_claims">
            <Row type="flex" justify="center">
              <Col sm={20} md={24} lg={24} xl={20} className="col-subtitles">
                <h3>Condición 1:</h3>
              </Col>
            </Row>
            <Row gutter={30} type="flex" justify="center">
              <Col className="col-conditions" sm={20} md={24} lg={24} xl={20}>
                <Col xs={24} sm={12} md={12} lg={12} xl={8}>
                  <span className="span-titles">Días para inicio de notificación(es):</span>
                  <Form.Item>
                    <Tooltip title="Cantidad de días a los que se recibe la primera notificación">
                      {getFieldDecorator('notificationsStart', {
                        initialValue:
                          notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].diasInicio : undefined,
                        rules: reglas
                      })(<Input disabled={notificacionSeleccionada.length <= 0} maxLength={6} />)}
                    </Tooltip>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={8}>
                  <span className="span-titles">Duración de envío de notificación(es):</span>
                  <Form.Item>
                    <Tooltip title="Cantidad de días totales durante los que se recibe las notificaciones">
                      {getFieldDecorator('notificationDuration', {
                        initialValue:
                          notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].diasTotal : undefined,
                        rules: reglas
                      })(<Input disabled={notificacionSeleccionada.length <= 0} maxLength={6} />)}
                    </Tooltip>
                  </Form.Item>
                </Col>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col sm={20} md={24} lg={24} xl={20} className="col-subtitles">
                <h3>Condición 2:</h3>
              </Col>
            </Row>
            <Row type="flex" justify="center" gutter={30}>
              <Col className="col-conditions" sm={20} md={24} lg={24} xl={20}>
                <div className="notification-center">
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <span className="span-titles">Frecuencia de envío:</span>
                    <Form.Item>
                      <Tooltip title="Frecuencia de envío de notificaciones a partir de la segunda notificación - La cantidad es en DÍAS">
                        {getFieldDecorator('ConditionTwoFrequencySending', {
                          initialValue:
                            notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].diasFrec2 : undefined,
                          rules: reglas
                        })(<Input disabled={notificacionSeleccionada.length <= 0} maxLength={6} />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <span className="span-titles">Copia de notificación(es):</span>
                    <Form.Item>
                      <Tooltip title="Indicador de envío de copia a partir de segunda notificación">
                        {getFieldDecorator('indicadorcopia2', {
                          initialValue:
                            notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].copiaCond2 : undefined
                        })(
                          <Select placeholder="Se envía copia" disabled={notificacionSeleccionada.length <= 0}>
                            <Option value="S">SI</Option>
                            <Option value="N">NO</Option>
                          </Select>
                        )}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <span className="span-titles">Número de envío al que inicia envío de copia:</span>
                    <Form.Item>
                      <Tooltip title="Indicador de número de envío a partir del que se envia copia">
                        {getFieldDecorator('ConditionTwoNumSending', {
                          initialValue:
                            notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].copiaCuando2 : undefined,
                          rules: reglas
                        })(<Input disabled={notificacionSeleccionada.length <= 0} maxLength={6} />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                </div>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col sm={20} md={24} lg={24} xl={20} className="col-subtitles">
                <h3>Condición 3: </h3>
              </Col>
            </Row>
            <Row gutter={30} type="flex" justify="center">
              <Col className="col-conditions" sm={20} md={24} lg={24} xl={20}>
                <div className="notification-center">
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <span className="span-titles">Frecuencia de envío:</span>
                    <Form.Item>
                      <Tooltip title="Frecuencia de envío de notificaciones a partir de la segunda notificación - La cantidad es en DÍAS">
                        {getFieldDecorator('ConditionThreeFrequencySending', {
                          initialValue:
                            notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].diasFrec3 : undefined,
                          rules: reglas
                        })(<Input disabled={notificacionSeleccionada.length <= 0} maxLength={6} />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <span className="span-titles">Copia de notificación(es):</span>
                    <Form.Item>
                      <Tooltip title="Indicador de envío de copia a partir de segunda notificación">
                        {getFieldDecorator('indicadorcopia3', {
                          initialValue:
                            notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].copiaCond3 : undefined
                        })(
                          <Select placeholder="Se envía copia" disabled={notificacionSeleccionada.length <= 0}>
                            <Option value="S">SI</Option>
                            <Option value="N">NO</Option>
                          </Select>
                        )}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <span className="span-titles">Número de envío al que inicia envío de copia:</span>
                    <Form.Item>
                      <Tooltip title="Indicador de número de envío a partir del que se envia copia">
                        {getFieldDecorator('ConditionThreeNumSending', {
                          initialValue:
                            notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].copiaCuando3 : undefined,
                          rules: reglas
                        })(<Input disabled={notificacionSeleccionada.length <= 0} maxLength={6} />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                </div>
              </Col>
            </Row>
            <Row type="flex" justify="center">
              <Col xs={21} sm={20} md={24} lg={24} xl={20} className="col-subtitles">
                <h3>Estado y Comentario de notificaciones: </h3>
              </Col>
            </Row>
            <Row gutter={30} type="flex" justify="center">
              <Col className="estate-comment" xs={24} sm={20} md={24} lg={24} xl={20}>
                <Col xs={24} sm={24} md={10} lg={8} xl={8}>
                  <span className="span-titles">Estado actual:</span>
                  <Form.Item>
                    {getFieldDecorator('estado', {
                      initialValue:
                        notificacionSeleccionada.length > 0 ? notificacionSeleccionada[0].estActual : undefined
                    })(
                      <Select placeholder="ESTADO" disabled={notificacionSeleccionada.length <= 0}>
                        <Option value="ACT">ACTIVO</Option>
                        <Option value="INA">INACTIVO</Option>
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={14} lg={16} xl={15}>
                  <span className="span-titles">Comentario:</span>
                  <Form.Item>
                    {getFieldDecorator('comentario', {})(
                      <Input.TextArea disabled={notificacionSeleccionada.length <= 0} maxLength={250} />
                    )}
                  </Form.Item>
                </Col>
              </Col>
            </Row>
            <Row gutter={24} className="row-buttons">
              <Col>
                <Button
                  className="notifications-button"
                  type="primary"
                  onClick={this.editarParametrosDeNotificaciones}
                  disabled={validateDisabledSave}
                >
                  Guardar
                </Button>
                <Button className="notifications-button" onClick={this.limpiarFormularioNotificaciones}>
                  Limpiar
                </Button>
                <Button className="notifications-button" onClick={this.redirectToTarget}>
                  Cancelar
                  <Icon type="close-circle" />
                </Button>
              </Col>
            </Row>
          </div>
        </Form>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  busquedaNotificaciones: getBuscarNotificaciones(state),
  loadingBuscarNotificaciones: getBuscarNotificaciones(state).isLoading,

  showScroll: state.services.device.scrollActivated,
  userClaims: state.services.user.userClaims
});

const mapDispatchToProps = dispatch => ({
  buscarNotificaciones: value => dispatch(buscarNotificacionesCreators.fetchBuscarNotificaciones(value)),

  actualizarParamNotificaciones: values =>
    dispatch(actualizarParametrosNotificacionesCreators.fetchActualizarParametrosNotificaciones(values))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(Notificaciones));
