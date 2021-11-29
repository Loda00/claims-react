import React, { Component } from 'react';
import { Row, Form, Input, Col, Radio, Select, DatePicker, Checkbox } from 'antd';
import { isEmpty } from 'lodash';
import { CONSTANTS_APP, ROLES_USUARIOS, TAREAS, ESTADO_SINIESTRO } from 'constants/index';
import moment from 'moment';
import { fetchAjustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/actions';
import { getCoveragesAdjusters } from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';
import { getAjustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/reducer';
import { getCertificado } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { datosInformesReset } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/action';
import { connect } from 'react-redux';
import { ValidationMessage } from 'util/validation';

class DataReportSections extends Component {
  state = {
    checkedList: ['Español'],
    listaAjustadores: null,
    existeCodRamo: false,
    datosInformes: [],
    indDocumentosCompletos: false,
    arrayUsers: []
  };

  componentDidMount() {
    const {
      user: { roles }
    } = this.props;

    const arrayUsers = [];

    roles.forEach(({ codTipo }) => {
      arrayUsers.push(codTipo);
    });

    this.setState({
      arrayUsers
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !isEmpty(nextProps.listaCoberturas) &&
      !isEmpty(nextProps.siniestro) &&
      !isEmpty(nextProps.certificado) &&
      !isEmpty(nextProps.listaCoberturas[0].ramos) &&
      nextProps.listaCoberturas !== prevState.listaCoberturas &&
      !prevState.existeCodRamo
    ) {
      const declaracion = nextProps.certificado.idDeclaracion === 0 ? undefined : nextProps.certificado.idDeclaracion;
      nextProps.getAjustadores(
        nextProps.listaCoberturas[0].ramos[0].codRamo,
        declaracion,
        nextProps.siniestro.indCargaMasiva
      );
      return {
        existeCodRamo: true
      };
    }

    if (!isEmpty(nextProps.listaAjustadores) && nextProps.listaAjustadores !== prevState.listaAjustadores) {
      return {
        listaAjustadores: nextProps.listaAjustadores
      };
    }

    if (!isEmpty(nextProps.data) && nextProps.data !== prevState.datosInformes) {
      const nuevosIdiomas = [];
      let documentosCompletos = false;
      if (nextProps.data.indIdiomaEspaniol || nextProps.data.indIdiomaIngles) {
        if (nextProps.data.indIdiomaEspaniol === 'S') {
          nuevosIdiomas.push('Español');
        }
        if (nextProps.data.indIdiomaIngles === 'S') {
          nuevosIdiomas.push('Ingles');
        }
        if (nextProps.data.indDocumentosCompletos === 'S') {
          documentosCompletos = true;
        }
      }
      return {
        datosInformes: nextProps.data,
        checkedList: nuevosIdiomas,
        indDocumentosCompletos: documentosCompletos
      };
    }

    return null;
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  handleChangeInput = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };

  handleCambioRequiereAjustador = () => {
    const {
      form: { setFieldsValue, getFieldValue },
      siniestro: { ajustador, indCargaMasiva }
    } = this.props;

    const nuevoAjustador = getFieldValue('nuevoAjustador');
    const ajustadorRequerido = getFieldValue('ajustadorRequerido');

    if (nuevoAjustador === 'S' && indCargaMasiva !== 'PT') {
      setTimeout(() => {
        setFieldsValue({
          nuevoAjustador: 'N'
        });
      }, 1);
    } else if (ajustadorRequerido === 'N' && !ajustador.codAjustador) {
      setTimeout(() => {
        setFieldsValue({
          nuevoAjustador: 'S'
        });
      }, 1);
    } else if (ajustadorRequerido === 'S' && indCargaMasiva === 'PT') {
      setTimeout(() => {
        setFieldsValue({
          nuevoAjustador: 'N'
        });
      }, 1);
    }
  };

  handleChangeRadio = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };

  handleChangeRadioInfFinal = e => {
    const { name, value } = e.target;

    const {
      form: { validateFields, setFieldsValue, getFieldsValue }
    } = this.props;

    this.setState({
      [name]: value
    });

    if (value === 'S') {
      setTimeout(() => {
        validateFields(['fechaRecepcion'], { force: true });
      }, 1);
    } else {
      setFieldsValue(
        {
          fechaRecepcion: getFieldsValue().fechaRecepcion
        },
        null
      );
    }
  };

  handleChangeSelectNuevoAjustador = (e, target) => {
    const { name, value } = target.props;
    const {
      form: { resetFields }
    } = this.props;

    resetFields('emailNuevoAjustador');

    this.setState({
      [name]: value
    });
  };

  handleChangeSelect = (e, target) => {
    const { name, value } = target.props;
    this.setState({
      [name]: value
    });
  };

  handleChangeCheckedGroup = checkedList => {
    this.setState({
      checkedList
    });
  };

  handleChangeChecked = e => {
    const { name, checked } = e.target;

    const {
      form: { validateFields, setFieldsValue, getFieldsValue }
    } = this.props;

    this.setState({
      [name]: checked
    });

    if (checked) {
      setTimeout(() => {
        validateFields(['fechaRecepcion'], { force: true });
      }, 1);
    } else {
      setFieldsValue(
        {
          fechaRecepcion: getFieldsValue().fechaRecepcion
        },
        null
      );
    }
  };

  handleChangeDatePicker = (date, name) => {
    this.setState({
      [name]: moment(date).format(CONSTANTS_APP.FORMAT_DATE)
    });
  };

  buscarNuevoAjustador = cod => {
    if (cod) {
      const { listaAjustadores } = this.state;
      const nuevoAjustador = listaAjustadores.find(({ codAjustador }) => codAjustador === cod);
      return nuevoAjustador.nomAjustador;
    }
    return false;
  };

  verificarIndioma = (rule, value, cb) => {
    if (value.length === 0) {
      cb('Deber elegir al menos un idioma');
    }

    cb();
  };

  validarFecha = (rule, value, cb) => {
    const {
      tarea: { idTarea }
    } = this.props;

    const { GENERAR_INFORME, GENERAR_INFORME_BASICO } = TAREAS;

    const tareasRequeridas = [GENERAR_INFORME, GENERAR_INFORME_BASICO];

    if (!tareasRequeridas.includes(idTarea)) {
      cb();
      return;
    }

    const fechaSeleccionada = value;

    if (!fechaSeleccionada) {
      cb('Debe ingresar una fecha');
      return;
    }

    const fechaActual = moment();
    const resultado = fechaSeleccionada <= fechaActual;

    if (!resultado) {
      cb('La fecha no puede ser mayor a la actual');
      return;
    }

    cb();
  };

  validarFechaUltimoDoc = (rule, value, cb) => {
    const {
      tarea: { idTarea },
      form: { getFieldsValue }
    } = this.props;

    const { GENERAR_INFORME, GENERAR_INFORME_BASICO } = TAREAS;

    const tareasRequeridas = [GENERAR_INFORME, GENERAR_INFORME_BASICO];

    if (!tareasRequeridas.includes(idTarea)) {
      cb();
      return;
    }

    const fechaSeleccionada = value;
    if (getFieldsValue().informeFinal === 'S') {
      if (!fechaSeleccionada) {
        cb('Debe ingresar una fecha');
        return;
      }
      if (fechaSeleccionada) {
        const fechaActual = moment();
        const resultado = fechaSeleccionada <= fechaActual;

        if (!resultado) {
          cb('La fecha no puede ser mayor a la actual');
          return;
        }
      }
    }

    if (getFieldsValue().informeFinal === 'N') {
      if (fechaSeleccionada) {
        const fechaActual = moment();
        const resultado = fechaSeleccionada <= fechaActual;

        if (!resultado) {
          cb('La fecha no puede ser mayor a la actual');
          return;
        }
      }
    }

    cb();
  };

  verificarUsuario = rol => {
    const { arrayUsers } = this.state;
    const user = arrayUsers.includes(rol);
    return user;
  };

  valorInicialReqAjustCatastrofica = params => {
    const { indCargaMasiva, tipoFlujo, codTipoSiniestro, indReqAjustador, idTarea } = params;
    const {
      form: { getFieldValue }
    } = this.props;

    const esSiniestroPreventivo = getFieldValue('tipoSiniestro') === 'P';

    const tareasPermitidas = [TAREAS.ANALIZAR_SINIESTRO];
    if (
      tareasPermitidas.includes(idTarea) &&
      !esSiniestroPreventivo &&
      indCargaMasiva === 'CAT' &&
      tipoFlujo === 'C' &&
      codTipoSiniestro === 'N'
    ) {
      return 'S';
    }
    return indReqAjustador;
  };

  render() {
    const {
      motivos,
      tarea,
      tarea: { idTarea },
      siniestro,
      siniestro: {
        indReqAjustadorAnt,
        tipoFlujo,
        ajustador,
        fechaOcurrencia,
        indReqAjustador,
        codReqAjustador,
        detReqAjustador,
        codEstadoSiniestro,
        indCargaMasiva,
        codTipoSiniestro,
        indInformeFinalCoa
      },
      data: {
        numReferenciaAjustador,
        ajustadorEncargado,
        fechaInspeccion,
        lugarInspeccion,
        situacionActual,
        nombreEntrevistado,
        notasInforme,
        indInformeFinal,
        fechaEnvioRimac,
        fechaRecepcionUltimoDoc
      },
      form: { getFieldDecorator, getFieldsValue, getFieldValue },
      disabledGeneral,
      flagModificar
    } = this.props;

    const { checkedList, listaAjustadores, indDocumentosCompletos } = this.state;

    const { AJUSTADOR, EJECUTIVO_DE_SINIESTRO } = ROLES_USUARIOS;

    const {
      PENDIENTE_ANALIZAR_SINIESTRO,
      PENDIENTE_REVISAR_INFORME_BASICO,
      PENDIENTE_REVISAR_INFORME
    } = ESTADO_SINIESTRO;

    let opcionesAjustadores;
    let opcionesMotivos;
    if (!isEmpty(listaAjustadores) && !isEmpty(siniestro)) {
      opcionesAjustadores = listaAjustadores
        .filter(ajust => ajust.idAjustador !== siniestro.ajustador.idAjustador)
        .map(item => (
          <Select.Option key={item.codAjustador} value={item.codAjustador}>
            {item.nomAjustador}
          </Select.Option>
        ));
    }

    if (!isEmpty(motivos)) {
      opcionesMotivos = motivos.map(motivo => (
        <Select.Option key={motivo.valor} value={motivo.valor}>
          {motivo.descripcion}
        </Select.Option>
      ));
    }

    const codigoNuevoAjustador = getFieldValue('ajustadorSeleccionado');

    const validarSegundaOpinion = !isEmpty(ajustador) && ajustador.numOpinion > 1;
    let nombreAjustador;
    let emailNuevoAjustador;
    let reqNuevoAjustador = 'N';
    let informeBasico;
    let codNuevoAjustadorElegido;

    if (!isEmpty(listaAjustadores) && !isEmpty(ajustador)) {
      const { nomAjustador, codNuevoAjustador, indSolInformeBasico } = ajustador;

      if (!isEmpty(codNuevoAjustador)) {
        const obj = listaAjustadores.find(item => item.codAjustador === codNuevoAjustador);

        nombreAjustador = nomAjustador;
        emailNuevoAjustador = obj.emailAjustador;
        codNuevoAjustadorElegido = obj.codAjustador;
        informeBasico = indSolInformeBasico;
        reqNuevoAjustador = 'S';
      }

      if (isEmpty(codNuevoAjustador)) {
        nombreAjustador = nomAjustador;
        emailNuevoAjustador = '';
        codNuevoAjustadorElegido = '';
      }

      if (codigoNuevoAjustador) {
        let obj;
        listaAjustadores.forEach(item => {
          if (item.codAjustador === codigoNuevoAjustador) {
            obj = item;
          }
        });
        nombreAjustador = nomAjustador;
        emailNuevoAjustador = obj && obj.emailAjustador;
        codNuevoAjustadorElegido = obj && obj.codAjustador;
      }
    }

    const plainOptions = ['Español', 'Ingles'];

    const informeFinal = (
      <Form.Item label="¿Es informe final?">
        {getFieldDecorator('informeFinal', {
          initialValue: indInformeFinalCoa === 'S' ? 'S' : 'N'
        })(
          <Radio.Group
            // onChange={this.handleChangeRadioInfFinal}
            disabled={disabledGeneral || idTarea !== TAREAS.ANALIZAR_SINIESTRO}
          >
            <Radio value="S">Si</Radio>
            <Radio value="N">No</Radio>
          </Radio.Group>
        )}
      </Form.Item>
    );

    return (
      <React.Fragment>
        {indCargaMasiva !== 'COA' &&
          ((tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO && indCargaMasiva !== 'COA') ||
            tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO ||
            tarea.idTarea === TAREAS.REVISAR_INFORME ||
            tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
            tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
            tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
            tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR ||
            (!tarea.idTarea && indCargaMasiva !== 'COA')) && (
            <React.Fragment>
              <Row gutter={24}>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Form.Item label="¿Requiere ajustador?">
                    {getFieldDecorator('ajustadorRequerido', {
                      initialValue: this.valorInicialReqAjustCatastrofica({
                        indCargaMasiva,
                        tipoFlujo,
                        codTipoSiniestro,
                        indReqAjustador,
                        idTarea
                      })
                      // indReqAjustador,
                      // valor inicial en caso de carga masiva catastrófica
                    })(
                      <Radio.Group
                        onChange={this.handleCambioRequiereAjustador}
                        disabled={
                          !(
                            this.verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) &&
                            (tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO || flagModificar)
                          ) ||
                          flagModificar ||
                          tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                          disabledGeneral ||
                          tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                          tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                          !tarea.idTarea === !flagModificar
                        }
                      >
                        <Radio value="S">Si</Radio>
                        <Radio value="N">No</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </Col>

                {(getFieldValue('ajustadorRequerido') === 'S' ||
                  (indReqAjustadorAnt === 'S' && getFieldValue('ajustadorRequerido') === 'N')) && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item label="Ajustador">
                      <span>{nombreAjustador}</span>
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Row gutter={40}>
                {((getFieldValue('ajustadorRequerido') === 'S' &&
                  (!isEmpty(indReqAjustadorAnt) && indReqAjustadorAnt === 'N')) ||
                  (getFieldValue('ajustadorRequerido') === 'N' &&
                    (!isEmpty(indReqAjustadorAnt) && indReqAjustadorAnt === 'S')) ||
                  (tipoFlujo === 'S' &&
                    isEmpty(indReqAjustadorAnt) &&
                    getFieldValue('ajustadorRequerido') === 'S')) && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item label="Motivo">
                      {getFieldDecorator('motivo', {
                        validateTrigger: 'onBlur',
                        initialValue: codReqAjustador || (getFieldsValue().ajustadorRequerido === 'S' ? 'PC' : 'FS'),
                        rules: [
                          {
                            required:
                              tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                              tarea.idTarea === TAREAS.REVISAR_INFORME ||
                              tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select
                          onChange={this.handleChangeSelect}
                          placeholder="Seleccione un motivo"
                          disabled={
                            disabledGeneral ||
                            tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                            tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                            tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                            !tarea.idTarea === !flagModificar
                          }
                        >
                          {opcionesMotivos}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                )}

                {((getFieldValue('ajustadorRequerido') === 'S' &&
                  (!isEmpty(indReqAjustadorAnt) && indReqAjustadorAnt === 'N')) ||
                  (getFieldValue('ajustadorRequerido') === 'N' &&
                    (!isEmpty(indReqAjustadorAnt) && indReqAjustadorAnt === 'S')) ||
                  (tipoFlujo === 'S' &&
                    isEmpty(indReqAjustadorAnt) &&
                    getFieldValue('ajustadorRequerido') === 'S')) && (
                  <Col xs={24} sm={14} md={11} lg={9} xl={8}>
                    <Form.Item label="Detalle">
                      {getFieldDecorator('detalle', {
                        validateTrigger: 'onBlur',
                        initialValue: detReqAjustador,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required:
                              tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                              tarea.idTarea === TAREAS.REVISAR_INFORME ||
                              tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input.TextArea
                          autosize={{ minRows: 3, maxRows: 3 }}
                          maxLength={500}
                          onChange={this.handleChangeInput}
                          disabled={
                            disabledGeneral ||
                            tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                            tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                            tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                            !tarea.idTarea === !flagModificar
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Row gutter={24}>
                {!isEmpty(ajustador) && (ajustador.numOpinion === 1 || ajustador.numOpinion === '') && (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item label="¿Solicita nuevo ajustador?">
                      {getFieldDecorator('nuevoAjustador', {
                        initialValue: reqNuevoAjustador
                      })(
                        <Radio.Group
                          onChange={this.handleChangeRadio}
                          disabled={
                            getFieldsValue().ajustadorRequerido === 'N' ||
                            tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                            tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR ||
                            tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                            disabledGeneral ||
                            !(getFieldValue('ajustadorRequerido') === 'S') ||
                            tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                            (flagModificar &&
                              (codEstadoSiniestro === PENDIENTE_ANALIZAR_SINIESTRO ||
                                codEstadoSiniestro === PENDIENTE_REVISAR_INFORME_BASICO ||
                                codEstadoSiniestro === PENDIENTE_REVISAR_INFORME ||
                                getFieldsValue().informeFinal !== 'N')) ||
                            (!isEmpty(ajustador) && !ajustador.codAjustador)
                          }
                        >
                          <Radio value="S">Si</Radio>
                          <Radio value="N">No</Radio>
                        </Radio.Group>
                      )}
                    </Form.Item>
                  </Col>
                )}

                {getFieldValue('nuevoAjustador') === 'S' && getFieldValue('ajustadorRequerido') === 'S' && (
                  <React.Fragment>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                      <Form.Item label="Seleccione ajustador">
                        {getFieldDecorator('ajustadorSeleccionado', {
                          validateTrigger: 'onBlur',
                          initialValue: codNuevoAjustadorElegido,
                          rules: [
                            {
                              required:
                                tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                                tarea.idTarea === TAREAS.REVISAR_INFORME ||
                                tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Select
                            onChange={this.handleChangeSelectNuevoAjustador}
                            placeholder="Seleccione un ajustador"
                            disabled={
                              disabledGeneral ||
                              tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                              tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                              !tarea.idTarea === !flagModificar ||
                              tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                            }
                          >
                            {opcionesAjustadores}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                      <Form.Item label="Email">
                        {getFieldDecorator('emailNuevoAjustador', {
                          validateTrigger: 'onBlur',
                          initialValue: emailNuevoAjustador,
                          rules: [
                            {
                              type: 'email',
                              message: ValidationMessage.NOT_VALID
                            },
                            {
                              required:
                                tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                                tarea.idTarea === TAREAS.REVISAR_INFORME ||
                                tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Input
                            onChange={this.handleChangeInput}
                            disabled={
                              disabledGeneral ||
                              tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                              tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                              !tarea.idTarea === !flagModificar ||
                              tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </React.Fragment>
                )}
              </Row>
            </React.Fragment>
          )}

        {indCargaMasiva !== 'COA' &&
          getFieldValue('nuevoAjustador') === 'S' &&
          tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO && (
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <Form.Item label="¿Solicitar informe básico?">
                {getFieldDecorator('solicitarInformeBasico', {
                  validateTrigger: 'onBlur',
                  initialValue: informeBasico || 'S'
                })(
                  <Radio.Group onChange={this.handleChangeRadio}>
                    <Radio value="S">Si</Radio>
                    <Radio value="N">No</Radio>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
          )}
        {indCargaMasiva !== 'COA' && (
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end'
              }}
            >
              <Form.Item label="Idioma del informe">
                {getFieldDecorator('idiomaEspaniol', {
                  initialValue: checkedList,
                  valuePropName: 'checked',
                  rules: [
                    {
                      validator: this.verificarIndioma
                    }
                  ]
                })(
                  <Checkbox.Group
                    onChange={this.handleChangeCheckedGroup}
                    options={plainOptions}
                    value={checkedList}
                    disabled={
                      (this.verificarUsuario(AJUSTADOR) &&
                        (tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO ||
                          tarea.idTarea === TAREAS.GENERAR_INFORME ||
                          tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR)) ||
                      disabledGeneral ||
                      tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                      tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                      !tarea.idTarea === !flagModificar ||
                      tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                      getFieldValue('ajustadorRequerido') === 'N' ||
                      (flagModificar &&
                        (codEstadoSiniestro === PENDIENTE_ANALIZAR_SINIESTRO ||
                          codEstadoSiniestro === PENDIENTE_REVISAR_INFORME_BASICO ||
                          codEstadoSiniestro === PENDIENTE_REVISAR_INFORME ||
                          getFieldsValue().informeFinal !== 'N')) ||
                      (getFieldValue('nuevoAjustador') === 'N' && tarea.idTarea === '')
                    }
                  />
                )}
              </Form.Item>
            </div>
          </Col>
        )}

        {((this.verificarUsuario(AJUSTADOR) &&
          (tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO ||
            tarea.idTarea === TAREAS.GENERAR_INFORME ||
            tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR)) ||
          (this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) &&
            indCargaMasiva !== 'COA' &&
            (tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO ||
              tarea.idTarea === TAREAS.REVISAR_INFORME ||
              tarea.idTarea === TAREAS.CONFIRMAR_GESTION)) ||
          (disabledGeneral && indCargaMasiva !== 'COA' && tarea.idTarea !== TAREAS.ANALIZAR_SINIESTRO) ||
          ([TAREAS.ADJUNTAR_CARGO_DE_RECHAZO, TAREAS.REVISAR_PAGO_EJECUTIVO, TAREAS.CONFIRMAR_GESTION].includes(
            tarea.idTarea
          ) &&
            indCargaMasiva !== 'COA') ||
          (!tarea.idTarea && indCargaMasiva !== 'COA')) && (
          <React.Fragment>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Nro. referencia ajustador">
                  {getFieldDecorator('nroPreferenciaAjustador', {
                    validateTrigger: 'onBlur',
                    initialValue: numReferenciaAjustador,
                    rules: [
                      {
                        type: 'string',
                        whitespace: true,
                        message: ValidationMessage.NOT_VALID,
                        pattern: /^[0-9A-Za-z nÑ]+$/
                      },
                      {
                        required:
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO),
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Input
                      maxLength={50}
                      onChange={this.handleChangeInput}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Ajustador encargado">
                  {getFieldDecorator('ajustadorEncargado', {
                    validateTrigger: 'onBlur',
                    initialValue: ajustadorEncargado,
                    rules: [
                      {
                        type: 'string',
                        whitespace: true,
                        message: ValidationMessage.NOT_VALID
                      },
                      {
                        whitespace: true,
                        message: 'No Espacios!'
                      },
                      {
                        required:
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO),
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Input
                      maxLength={100}
                      onChange={this.handleChangeInput}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Fecha env&iacute;o a Rimac">
                  {getFieldDecorator('fechaEnvio', {
                    initialValue: fechaEnvioRimac ? moment.utc(fechaEnvioRimac) : moment().utc()
                  })(
                    <DatePicker
                      format={CONSTANTS_APP.FORMAT_DATE}
                      onChange={e => this.handleChangeDatePicker(e, 'fechaEnvio')}
                      disabled={
                        this.verificarUsuario(AJUSTADOR) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <h3>Detalle informe</h3>
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Fecha ocurrencia">
                  {getFieldDecorator('fechaOcurrencia', {
                    initialValue: fechaOcurrencia ? moment(fechaOcurrencia).utc() : undefined
                  })(
                    <DatePicker
                      format={CONSTANTS_APP.FORMAT_DATE}
                      onChange={e => this.handleChangeDatePicker(e, 'fechaOcurrencia')}
                      disabled={
                        this.verificarUsuario(AJUSTADOR) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Fecha inspecci&oacute;n">
                  {getFieldDecorator('fechaInspeccionInforme', {
                    initialValue: fechaInspeccion ? moment(fechaInspeccion).utc() : undefined,
                    rules: [
                      {
                        required:
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO),
                        message: ValidationMessage.REQUIRED
                      },
                      {
                        validator: this.validarFecha
                      }
                    ]
                  })(
                    <DatePicker
                      format={CONSTANTS_APP.FORMAT_DATE}
                      onChange={e => this.handleChangeDatePicker(e, 'dateInspection')}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Lugar inspecci&oacute;n">
                  {getFieldDecorator('lugarInspeccion', {
                    validateTrigger: 'onBlur',
                    initialValue: lugarInspeccion,
                    rules: [
                      {
                        type: 'string',
                        whitespace: true,
                        message: ValidationMessage.NOT_VALID
                      },
                      {
                        required:
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO),
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Input
                      maxLength={100}
                      onChange={this.handleChangeInput}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Nombre de persona entrevistada">
                  {getFieldDecorator('personaEntrevistada', {
                    validateTrigger: 'onBlur',
                    initialValue: nombreEntrevistado || undefined,
                    rules: [
                      {
                        type: 'string',
                        whitespace: true,
                        message: ValidationMessage.NOT_VALID
                      },
                      {
                        required:
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO),
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Input
                      maxLength={150}
                      onChange={this.handleChangeInput}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Detalle ocurrencia">
                  {getFieldDecorator('situacionActual', {
                    initialValue: situacionActual,
                    rules: [
                      {
                        type: 'string',
                        whitespace: true,
                        message: ValidationMessage.NOT_VALID
                      },
                      {
                        required:
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO),
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Input.TextArea
                      onChange={this.handleChangeInput}
                      autosize={{ minRows: 3, maxRows: 3 }}
                      maxLength={500}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Nota informe">
                  {getFieldDecorator('notaInforme', {
                    validateTrigger: 'onBlur',
                    initialValue: notasInforme,
                    rules: [
                      {
                        type: 'string',
                        whitespace: true,
                        message: ValidationMessage.NOT_VALID
                      },
                      {
                        required:
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO),
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Input.TextArea
                      autosize={{ minRows: 3, maxRows: 3 }}
                      maxLength={1000}
                      onChange={this.handleChangeInput}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="¿Es informe final?">
                  {getFieldDecorator('informeFinal', {
                    initialValue: indInformeFinal === 'S' ? 'S' : 'N'
                  })(
                    <Radio.Group
                      onChange={this.handleChangeRadioInfFinal}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                        validarSegundaOpinion
                      }
                    >
                      <Radio value="S">Si</Radio>
                      <Radio value="N">No</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="¿Documentos completos?">
                  {getFieldDecorator('documentosCompletos', {
                    initialValue: indDocumentosCompletos,
                    valuePropName: 'checked',
                    rules: [
                      {
                        required: getFieldsValue().informeFinal === 'S',
                        message: ValidationMessage.REQUIRED
                      },
                      {
                        validator: (r, v, cb) => {
                          if (getFieldsValue().informeFinal === 'S' && !getFieldsValue().documentosCompletos) {
                            cb('Este campo necesita estar con check');
                          }
                          cb();
                        }
                      }
                    ]
                  })(
                    <Checkbox
                      onChange={this.handleChangeChecked}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    >
                      Documentos completos
                    </Checkbox>
                  )}
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Form.Item label="Fecha recepci&oacute;n &uacute;ltimo documento del asegurado">
                  {getFieldDecorator('fechaRecepcion', {
                    initialValue: fechaRecepcionUltimoDoc ? moment(fechaRecepcionUltimoDoc).utc() : undefined,
                    rules: [
                      {
                        required: getFieldsValue().documentosCompletos || getFieldsValue().informeFinal === 'S',
                        message: ValidationMessage.REQUIRED
                      },
                      {
                        validator: this.validarFechaUltimoDoc
                      }
                    ]
                  })(
                    <DatePicker
                      format={CONSTANTS_APP.FORMAT_DATE}
                      onChange={e => this.handleChangeDatePicker(e, 'fechaRecepcion')}
                      disabled={
                        !(
                          this.verificarUsuario(AJUSTADOR) &&
                          (tarea.idTarea === TAREAS.GENERAR_INFORME || tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO)
                        ) ||
                        this.verificarUsuario(EJECUTIVO_DE_SINIESTRO) ||
                        disabledGeneral ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        tarea.idTarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
                        !tarea.idTarea ||
                        tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </React.Fragment>
        )}
        {indCargaMasiva === 'COA' && informeFinal}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: state.services.user.userClaims,
  listaCoberturas: getCoveragesAdjusters(state).coveragesAdjusters,
  listaAjustadores: getAjustadores(state),
  certificado: getCertificado(state)
});

const mapDispatchToProps = dispatch => ({
  getAjustadores: (id, idDec, indCargaMasiva) => dispatch(fetchAjustadores(id, idDec, indCargaMasiva)),
  reset: () => {
    dispatch(datosInformesReset());
  }
});

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(DataReportSections);

export default Main;
