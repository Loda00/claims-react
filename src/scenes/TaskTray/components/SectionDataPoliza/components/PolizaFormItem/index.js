import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Modal, Button, Col, Checkbox, Card, Icon, Form, Spin } from 'antd';
import CorredorFormItem from 'scenes/TaskTray/components/SectionDataPoliza/components/PolizaFormItem/components/CorredorFormItem';
import ReaseguroTable from 'scenes/TaskTray/components/SectionDataPoliza/components/PolizaFormItem/components/ReaseguroTable';
import CoaseguroTable from 'scenes/TaskTray/components/SectionDataPoliza/components/PolizaFormItem/components/CoaseguroTable';
import * as EnviarEmailsActionCreator from 'scenes/TaskTray/components/SectionDataPoliza/data/enviarEmails/actions';
import { showErrorMessage, modalConfirmacionReintentar } from 'util/index';
import { ValidationMessage } from 'util/validation';
import { TAREAS } from 'constants/index';

import '../../style.css';

const initialState = {
  nomContratante: '',
  numPoliza: '',
  polizaLider: '',
  canal: '',
  indNotifCorredor: '',
  licitaciones: '',
  cambioCorredor: null,
  desabilitadoEnviarEmail: [],
  coaseguros: [],
  reaseguros: [],
  validateInicial: false,
  indNotifReaCoa: '',
  envioCorreoIsLoading: false,
  corredor: {},
  validarEmailSeguros: false
};

class PolizaFormItem extends Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    const { ErrorCorreosSegurosHandler } = this.props;
    if (ErrorCorreosSegurosHandler) {
      ErrorCorreosSegurosHandler(this.mostrarErrorEmailSeguros.bind(this));
    }
  }

  ocultarErrorEmailSeguros = () => {
    this.setState({ validarEmailSeguros: false });
    this.triggerChange({ validarEmailSeguros: false });
  };

  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  cambioIndNotifReaCoa = () => {
    this.setState({
      ...this.state,
      indNotifReaCoa: 'S'
    });
    this.triggerChange({
      ...this.state,
      indNotifReaCoa: 'S'
    });
  };

  cambioCorredor = object => {
    this.setState({
      ...this.state,
      corredor: object
    });
    this.triggerChange({
      corredor: object
    });
  };

  cambioCoaseguros = array => {
    this.setState({
      ...this.state,
      coaseguros: array
    });
    this.triggerChange({
      coaseguros: array
    });
  };

  cambioEstadoEnvioCorreo = booleano => {
    this.setState({
      ...this.state,
      envioCorreoIsLoading: booleano
    });
    this.triggerChange({
      envioCorreoIsLoading: booleano
    });
  };

  NotificationSendEmail = async () => {
    try {
      this.cambioEstadoEnvioCorreo(true);
      const {
        dispatch,
        numSiniestro,
        userClaims: { idProceso },
        currentTask: { nomTarea, idCaso }
      } = this.props;
      const { coaseguros, reaseguros } = this.state;
      const {
        form: { getFieldValue }
      } = this.props;
      const emailsCoaseguros = [];
      coaseguros.forEach((item, index) => {
        const obj = {};
        Object.assign(
          obj,
          { idCoasegurador: coaseguros[index].idCoaseguro },
          { email: getFieldValue(String(`coaseguro${item.idCoaseguro}`)) },
          { nombres: coaseguros[index].nomCoaseguro }
        );
        emailsCoaseguros.push(obj);
      });
      const emailsReaseguros = [];
      reaseguros.forEach((item, index) => {
        const obj = {};
        Object.assign(obj, {
          idReasegurador: reaseguros[index].idReasegurador,
          email: getFieldValue(`reaseguro${item.idReasegurador}`),
          nombres: reaseguros[index].reasegurador
        });
        emailsReaseguros.push(obj);
      });

      const request = {
        numSiniestro,
        UsuarioAsignacion: Number(idProceso),
        idCase: Number(idCaso),
        nomTarea,
        coaseguros: emailsCoaseguros,
        reaseguros: emailsReaseguros
      };

      const response = await dispatch(EnviarEmailsActionCreator.enviarEmails(request));
      if (response.code === 'CRG-000') {
        this.onOkWarningHandler(emailsCoaseguros, emailsReaseguros);
      } else {
        showErrorMessage(String('Ocurrió un error al enviar emails'));
      }
    } catch (e) {
      const { response: { status } = {} } = e;
      if (status === 504) {
        modalConfirmacionReintentar();
        return;
      }
      showErrorMessage(String(e));
    } finally {
      this.cambioEstadoEnvioCorreo(false);
    }
  };

  onOkWarningHandler = async (emailsCoaseguros, emailsReaseguros) => {
    const { redirectToPath } = this.props;
    const { coaseguros } = this.state;
    if (emailsReaseguros.length > 0) {
      Modal.warning({
        title: 'Notificación Reaseguro',
        content:
          'Ud. Tiene dos días para adjuntar el correo sustento de asignación del ajustador y completar la tarea.',
        keyboard: false,
        onOk: () => redirectToPath('/tareas')
      });
    } else if (emailsCoaseguros.length > 0) {
      let newCoaseguros = [...coaseguros];
      newCoaseguros = newCoaseguros.map((item, index) => {
        return { ...item, dscEmail: emailsCoaseguros[index] };
      });

      await this.cambioCoaseguros(newCoaseguros);
      this.cambioIndNotifReaCoa();
    }
  };

  obtenerErroresEmail = () => {
    const { coaseguros, reaseguros } = this.state;
    const {
      form: { getFieldsError }
    } = this.props;
    const validacionEmailCoaseguro = coaseguros.some(item => {
      const flag = getFieldsError([`coaseguro${item.idCoaseguro}`])[`coaseguro${item.idCoaseguro}`] !== undefined;
      return flag;
    });
    const validacionEmailReaseguro = reaseguros.some(item => {
      const flag = getFieldsError([`reaseguro${item.idReasegurador}`])[`reaseguro${item.idReasegurador}`] !== undefined;
      return flag;
    });
    return validacionEmailCoaseguro || validacionEmailReaseguro;
  };

  validarCorreo = (rule, values, callback) => {
    const {
      indCargaMasiva,
      esSiniestroPreventivo,
      currentTask: { idTarea },
      form: { getFieldValue }
    } = this.props;
    const cerrarSiniestroValue = getFieldValue('indCerrarSiniestro');
    const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO, TAREAS.REVISAR_INFORME_BASICO, TAREAS.REVISAR_INFORME];
    const esCMCoaseguros = indCargaMasiva === 'COA';
    const correos = values.split(',');
    const validacionEmail = correos.some(
      correo =>
        !correo.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    );

    if (tareasPermitidas.includes(idTarea) && !cerrarSiniestroValue && !esSiniestroPreventivo) {
      if (correos.length > 3) {
        callback('Se superó el límite de tres correos permitidos');
        return;
      }

      if (validacionEmail) {
        if (!values) {
          if (esCMCoaseguros) {
            return;
          }
          callback(ValidationMessage.REQUIRED);
          return;
        }
        callback('El campo no es válido, ingresar correos separados por coma sin espacios en blanco');
        return;
      }
    }

    this.ocultarErrorEmailSeguros();
    callback();
  };

  mostrarErrorEmailSeguros() {
    this.setState({ validarEmailSeguros: true });
    this.triggerChange({ validarEmailSeguros: true });
  }

  render() {
    const {
      canal,
      corredor,
      numPoliza,
      coaseguros,
      reaseguros,
      polizaLider,
      licitaciones,
      indNotifReaCoa,
      nomContratante,
      indNotifCorredor,
      validarEmailSeguros,
      envioCorreoIsLoading
    } = this.state;

    const {
      indCargaMasiva,
      disabledGeneral,
      userClaims,
      esEjecutivo,
      esAjustador,
      tienePoliza,
      currentTask: { idTarea },
      getCoasegurosYReaseguros,
      showScroll,
      form,
      form: { getFieldValue },
      currentTask,
      esSiniestroPreventivo,
      flagModificar,
      // Validaciones
      validacionBotonReemplazarCorredor,
      validacionInputEjecutivoCorredor,
      validacionInputEmailCorredor,
      validacionGrillaSeguros: { mostrarGrillaSeguros },
      validacionInputEmailSeguros,
      validacionBotonEnviarEmails: { mostrarEnviarEmails },
      validacionPolizaLider: { mostrarPolizaLider }
    } = this.props;

    const reasegurosFiltrados = [];
    const ramosSiniestro = [];
    const { ramosCoberturas = [] } = getFieldValue('dataRamosCoberturas') || {};
    ramosCoberturas.forEach(ramo => {
      ramosSiniestro.push(ramo.codRamo);
    });
    reaseguros.forEach(rea => {
      if (ramosSiniestro.includes(rea.codRamo)) {
        reasegurosFiltrados.push(rea);
      }
    });

    // Validaciones
    const cerrarSiniestroValue = getFieldValue('indCerrarSiniestro');
    const botonEnviarEmailHabilitado = this.obtenerErroresEmail() || cerrarSiniestroValue;
    const boolMostrarEnviarEmails = mostrarEnviarEmails({
      idTarea,
      indNotifReaCoa,
      cerrarSiniestroValue,
      indCargaMasiva
    });
    const boolMostrarGrillaSeguros = mostrarGrillaSeguros({
      idTarea,
      coaseguros,
      reaseguros,
      esAjustador,
      flagModificar
    });

    const boolMostrarPolizaLider = mostrarPolizaLider({
      indCargaMasiva
    });

    // Fin Validaciones
    return (
      <Fragment>
        <Row gutter={24}>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="claims-rrgg-description-list-index-term">Nombre contratante</div>
            <div className="claims-rrgg-description-list-index-detail">
              <span>{nomContratante}</span>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="claims-rrgg-description-list-index-term">N° P&oacute;liza</div>
            <div className="claims-rrgg-description-list-index-detail">
              <span>{numPoliza}</span>
            </div>
          </Col>
          {boolMostrarPolizaLider && (
            <Col xs={24} sm={12} md={12} lg={12} xl={6}>
              <div className="claims-rrgg-description-list-index-term">N° P&oacute;liza L&iacute;der</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{polizaLider}</span>
              </div>
            </Col>
          )}
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="claims-rrgg-description-list-index-term">Canal emisor</div>
            <div className="claims-rrgg-description-list-index-detail">
              <span>{canal}</span>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="claims-rrgg-description-list-index-term">Estado licitaciones</div>
            <div className="claims-rrgg-description-list-index-detail">
              <Checkbox checked={licitaciones === 'S'} disabled />
            </div>
          </Col>
        </Row>
        <Form.Item>
          <CorredorFormItem
            indCargaMasiva={indCargaMasiva}
            corredor={corredor}
            tienePoliza={tienePoliza}
            cambioCorredor={this.cambioCorredor}
            currentTask={currentTask}
            userClaims={userClaims}
            esEjecutivo={esEjecutivo}
            esAjustador={esAjustador}
            disabledGeneral={disabledGeneral}
            form={form}
            indNotifCorredor={indNotifCorredor}
            esSiniestroPreventivo={esSiniestroPreventivo}
            cerrarSiniestroValue={cerrarSiniestroValue}
            flagModificar={flagModificar}
            // Validaciones
            validacionBotonReemplazarCorredor={validacionBotonReemplazarCorredor}
            validacionInputEjecutivoCorredor={validacionInputEjecutivoCorredor}
            validacionInputEmailCorredor={validacionInputEmailCorredor}
          />
        </Form.Item>
        {boolMostrarGrillaSeguros && (
          <Fragment>
            {(coaseguros.length || 0) > 0 && (reaseguros.length || 0) === 0 && <h3>Coaseguros</h3>}
            {(reaseguros.length || 0) > 0 && (coaseguros.length || 0) === 0 && <h3>Reaseguros</h3>}
            {(coaseguros.length || 0) > 0 && (reaseguros.length || 0) > 0 && <h3>Coaseguros y Reaseguros</h3>}
            <Spin spinning={envioCorreoIsLoading}>
              <Card
                title={
                  boolMostrarEnviarEmails && (
                    <Button
                      onClick={this.NotificationSendEmail}
                      disabled={
                        botonEnviarEmailHabilitado || disabledGeneral
                        // || cerrarSiniestroValue
                      }
                    >
                      Enviar email
                      <Icon type="mail" />
                    </Button>
                  )
                }
              >
                <Row gutter={24}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    {(coaseguros.length || 0) > 0 && (
                      <CoaseguroTable
                        getCoasegurosYReaseguros={getCoasegurosYReaseguros}
                        indNotifReaCoa={indNotifReaCoa}
                        idTarea={idTarea}
                        currentTask={currentTask}
                        esEjecutivo={esEjecutivo}
                        userClaims={userClaims}
                        showScroll={showScroll}
                        disabledGeneral={disabledGeneral}
                        form={form}
                        validarEmailSeguros={validarEmailSeguros}
                        coaseguros={coaseguros}
                        cerrarSiniestroValue={cerrarSiniestroValue}
                        esSiniestroPreventivo={esSiniestroPreventivo}
                        validarCorreo={this.validarCorreo}
                        validacionInputEmailSeguros={validacionInputEmailSeguros}
                      />
                    )}
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    {(reaseguros.length || 0) > 0 && (
                      <ReaseguroTable
                        getCoasegurosYReaseguros={getCoasegurosYReaseguros}
                        indNotifReaCoa={indNotifReaCoa}
                        idTarea={idTarea}
                        indCargaMasiva={indCargaMasiva}
                        esEjecutivo={esEjecutivo}
                        currentTask={currentTask}
                        userClaims={userClaims}
                        showScroll={showScroll}
                        disabledGeneral={disabledGeneral}
                        form={form}
                        validarEmailSeguros={validarEmailSeguros}
                        reaseguros={reasegurosFiltrados}
                        cerrarSiniestroValue={cerrarSiniestroValue}
                        esSiniestroPreventivo={esSiniestroPreventivo}
                        validarCorreo={this.validarCorreo}
                        validacionInputEmailSeguros={validacionInputEmailSeguros}
                      />
                    )}
                  </Col>
                </Row>
              </Card>
            </Spin>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default connect()(PolizaFormItem);
