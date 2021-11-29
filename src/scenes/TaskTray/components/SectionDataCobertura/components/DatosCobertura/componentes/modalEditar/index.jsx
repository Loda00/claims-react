import React, { Component, Fragment } from 'react';
import { Modal, Form, Col, Select, Input, Row, Checkbox } from 'antd';
import { connect } from 'react-redux';
import currency from 'currency.js';
import { isEmpty } from 'lodash';
import { ValidationMessage } from 'util/validation';
import { ROLES_USUARIOS, TAREAS } from 'constants/index';
import { fetchCauses } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/actions';
import { fetchConsequences } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/actions';
import { getMotivosRechazoSbs } from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazoSBS/reducer';
import { getMotivosRechazo } from 'scenes/TaskTray/components/SectionDataCobertura/data/motivosRechazo/reducer';
import { getCauses } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/reducer';
import { getConsequences } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/reducer';
import { getBranches } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/reducer';
import { loading as getLoadingEditar } from 'scenes/TaskTray/components/SectionDataCobertura/data/editarCobertura/reducer';
import PriceInputNoSymbol from 'components/PriceInputNoSymbol/index';
import { hasErrors, modalInformacion } from 'util/index';

class EditarCobertura extends Component {
  state = {
    causas: [],
    consecuencias: []
  };

  componentDidMount() {
    const { selectedCobertura, obtenerCausas, obtenerConsecuencias } = this.props;
    obtenerCausas(selectedCobertura.ramo);
    obtenerConsecuencias(selectedCobertura.ramo);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEmpty(nextProps.consecuencias) && nextProps.consecuencias !== prevState.consecuencias) {
      return {
        consecuencias: nextProps.consecuencias
      };
    }

    if (!isEmpty(nextProps.causas) && nextProps.causas !== prevState.causas) {
      return {
        causas: nextProps.causas
      };
    }

    return null;
  }

  infoModal = msg => {
    const opciones = {
      title: 'Rechazar cobertura',
      content: (
        <div>
          <p>{`Ud. No puede rechazar la cobertura porque ${msg}.`}</p>
        </div>
      ),
      cb: () => {}
    };

    modalInformacion(opciones);
  };

  validarSinCobertura = () => {
    const {
      analizarForm: { getFieldValue },
      selectedCobertura: { codCobert, ramo }
    } = this.props;

    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    let esValido = false;

    const pagos = [...reposiciones, ...indemnizaciones];

    pagos.forEach(({ codCobertura, codRamo }) => {
      if (codCobertura === codCobert && codRamo === ramo) {
        esValido = true;
      }
    });

    if (esValido) {
      this.infoModal('tiene pagos');
      return esValido;
    }
    return esValido;
  };

  validarInformeFinal = () => {
    const {
      analizarForm: { getFieldValue },
      tarea: { idTarea }
    } = this.props;

    const { REVISAR_INFORME, REVISAR_INFORME_BASICO, ANALIZAR_SINIESTRO } = TAREAS;

    const informeFinal = getFieldValue('informeFinal');
    const requiereAjustador = getFieldValue('ajustadorRequerido');

    let esInformeFinal = false;

    if (informeFinal === 'N' && (idTarea === REVISAR_INFORME || idTarea === REVISAR_INFORME_BASICO)) {
      esInformeFinal = true;
      this.infoModal('no es Informe Final');
    }

    if (requiereAjustador === 'S' && idTarea === ANALIZAR_SINIESTRO) {
      esInformeFinal = true;
      this.infoModal('no se va a liquidar el siniestro');
    }

    return esInformeFinal;
  };

  manejarCambioCheck = e => {
    e.preventDefault();
    const { checked } = e.target;
    const {
      form: { setFieldsValue, validateFields }
    } = this.props;

    const resultado = this.validarSinCobertura() || this.validarInformeFinal() ? false : checked;

    setTimeout(() => {
      setFieldsValue(
        {
          siniestroSinCobertura: resultado
        },
        () => {
          validateFields(() => {});
        }
      );
    }, 1);
  };

  verificarReserva = (rule, value, callback) => {
    const {
      selectedCobertura: { codCobert, ramo, sumaAsegurada },
      analizarForm: { getFieldValue },
      selectedCobertura
    } = this.props;

    if (value && value.number <= 0) {
      callback('El monto debe ser mayor que cero');
      return;
    }

    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    const pagos = [...reposiciones, ...indemnizaciones];

    let totalPagos = 0;
    pagos.forEach(item => {
      if (item.codCobertura === codCobert && item.codRamo === ramo) {
        totalPagos = Number(selectedCobertura.totalPagosAprobadosCobertura.replace(/,/g, ''));
      }
    });

    if (totalPagos > Number(value.number)) {
      callback('El monto reserva no puede ser menor al total de pagos');
    }

    if (Number(value.number) >= 0) {
      if (Number(value.number) > Number(sumaAsegurada.replace(/,/g, ''))) {
        callback(`El monto no puede ser mayor a la suma asegurada ${sumaAsegurada}`);
      }
    }

    callback();
  };

  validarMonto = (rule, value, callback) => {
    const {
      branches,
      selectedCobertura: { idCobertura }
    } = this.props;

    if (value && Number(value.number) <= 0) {
      callback('El monto debe ser mayor que cero');
      return;
    }

    if (Number(value.number) >= 0) {
      branches.forEach(branch => {
        branch.listCoberturas.forEach(item => {
          if (Number(item.ideCobert) === Number(idCobertura)) {
            if (Number(item.sumAseg) < Number(value.number)) {
              callback(`El monto no puede ser mayor a ${currency(item.sumAseg).format()}`);
            }
          }
        });
      });
    }

    if (
      value &&
      Number(value.number) > 0 &&
      String(value.number).split('.').length === 2 &&
      String(value.number).split('.')[1].length > 2
    ) {
      callback('Solo se pueden poner 2 decimales');
      return;
    }

    callback();
  };

  validarCoberturaSinPago = esPago => {
    const {
      analizarForm: { getFieldValue },
      selectedCobertura: { codCobert, ramo }
    } = this.props;

    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    const pagos = [...indemnizaciones, ...reposiciones];

    let noTienePagos = true;
    pagos.forEach(item => {
      if (item.codCobertura === codCobert && item.codRamo === ramo && esPago) {
        noTienePagos = false;
      }
    });

    return noTienePagos;
  };

  manejarCambioSeleccionar = (e, target) => {
    const { name, value } = target.props;
    this.setState({
      [name]: value
    });
  };

  permisosEjecutivoOajustador = (tarea, flagModificar) => {
    const { verificarUsuario } = this.props;

    const resultado = !(
      (verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) &&
        (tarea === TAREAS.ANALIZAR_SINIESTRO ||
          tarea === TAREAS.REVISAR_INFORME_BASICO ||
          tarea === TAREAS.REVISAR_INFORME ||
          tarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
          flagModificar)) ||
      (verificarUsuario(ROLES_USUARIOS.AJUSTADOR) &&
        (tarea === TAREAS.GENERAR_INFORME_BASICO ||
          tarea === TAREAS.GENERAR_INFORME ||
          tarea === TAREAS.REVISAR_PAGO_AJUSTADOR))
    );
    return resultado;
  };

  permisosAprobador = tarea => {
    const { verificarUsuario } = this.props;

    const resultado =
      verificarUsuario(ROLES_USUARIOS.APROBADOR) &&
      (tarea === TAREAS.COMPLETAR_DATOS ||
        tarea === TAREAS.CONFIRMAR_GESTION ||
        tarea === TAREAS.ADJUNTAR_CARGO_DE_RECHAZO ||
        tarea === TAREAS.GENERACION_DE_OB ||
        tarea === TAREAS.GENERAR_INFORME ||
        tarea === TAREAS.GENERAR_INFORME_BASICO ||
        tarea === TAREAS.REVISAR_PAGO_EJECUTIVO);
    return resultado;
  };

  validarCoberturaEditable = ({ codCobert, ramo }) => {
    const {
      analizarForm: { getFieldValue }
    } = this.props;

    const { indemnizaciones = [], reposiciones = [] } = getFieldValue('pagos') || {};

    const pagos = [...reposiciones, ...indemnizaciones];

    let editable = false;

    pagos.forEach(({ codCobertura, codRamo, flagRevisarPago }) => {
      if (codCobertura === codCobert && codRamo === ramo && flagRevisarPago === 'S') {
        editable = true;
      }
    });

    return !editable;
  };

  calcularReservaNetaDeducible = () => {
    const {
      analizarForm: { getFieldValue },
      selectedCobertura: { reservaAntesDeducible, codCobert }
    } = this.props;

    const { indemnizaciones = [] } = getFieldValue('pagos') || {};

    const pagos = [...indemnizaciones];

    let montoDeducible = 0;

    if (isEmpty(pagos)) {
      montoDeducible = currency(reservaAntesDeducible).format();
      return montoDeducible;
    }

    let calculoDeducible = 0;

    pagos.forEach(({ mtoDeducible, codCobertura }) => {
      if (codCobertura === codCobert) {
        calculoDeducible += Number(mtoDeducible);
      }
    });

    montoDeducible =
      calculoDeducible === 0
        ? currency(reservaAntesDeducible).format()
        : currency(reservaAntesDeducible)
            .subtract(calculoDeducible)
            .format();

    return montoDeducible;
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue, getFieldsError, validateFields },
      tarea,
      cerrar,
      modal,
      motivosRechazoSbs,
      motivosRechazo,
      selectedCobertura,
      selectedCobertura: {
        reservaAntesDeducible,
        montoReclamado,
        totalPagosAprobadosCobertura,
        monedaIndemnizacion,
        dscCobertura,
        codMotivoRechazoSBS,
        codMotivoRechazo,
        detOtrosCasos,
        siniestroSinCobertura,
        saldoPendienteCobertura
      },
      onOkEditar,
      loadingEditar,
      confirmarSiniestroSinCobertura,
      disabledGeneral,
      rechazoPago,
      flagModificar,
      verificarUsuario,
      siniestro: { indCargaMasiva },
      reCargaRamosCoberturas
    } = this.props;

    const { causas, consecuencias } = this.state;

    const esRechazo = rechazoPago === 'R';
    const esPago = rechazoPago === 'A';
    const validarSiEsRechazo =
      rechazoPago === 'R' ? !(rechazoPago === 'R' && tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO) : false;
    const validarBotonEditar = siniestroSinCobertura === 'SI' && getFieldsValue().siniestroSinCobertura;
    const validarCoberturaSinPago = esPago
      ? this.validarCoberturaSinPago(esPago)
      : !this.validarCoberturaSinPago(esPago);
    const validarBotonEditarGIB = getFieldsValue().siniestroSinCobertura;
    const coberturaTienePagos =
      this.validarCoberturaEditable(selectedCobertura) && tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO && esPago;

    let opcionesMotivosRechazo = [];
    let opcionesMotivosRechazoSbs = [];
    let opcionesCausas = [];
    let opcionesConsecuencias = [];

    if (!isEmpty(motivosRechazo)) {
      opcionesMotivosRechazo = motivosRechazo.map(motivo => (
        <Select.Option key={motivo.valor} value={motivo.valor}>
          {motivo.descripcion}
        </Select.Option>
      ));
    }

    if (!isEmpty(motivosRechazoSbs)) {
      opcionesMotivosRechazoSbs = motivosRechazoSbs.map(motivo => (
        <Select.Option key={motivo.valor} value={motivo.valor}>
          {motivo.descripcion}
        </Select.Option>
      ));
    }

    if (!isEmpty(causas)) {
      opcionesCausas = causas.map(causa => (
        <Select.Option key={causa.codCausa} value={causa.codCausa}>
          {causa.dscCausa}
        </Select.Option>
      ));
    }

    if (!isEmpty(consecuencias)) {
      opcionesConsecuencias = consecuencias.map(consecuencia => (
        <Select.Option key={consecuencia.codConsecuencia} value={consecuencia.codConsecuencia}>
          {consecuencia.dscConsecuencia}
        </Select.Option>
      ));
    }

    let habilitarSiniestroSinCobertura;
    if (siniestroSinCobertura === 'SI') {
      habilitarSiniestroSinCobertura = true;
      if (tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO || tarea.idTarea === TAREAS.REVISAR_INFORME) {
        habilitarSiniestroSinCobertura = false;
      }
      if (esRechazo && tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO) {
        habilitarSiniestroSinCobertura = false;
      }
    }

    let habilitarEditarCobertura;
    if (siniestroSinCobertura === 'SI') {
      habilitarEditarCobertura = true;
      // if (getFieldsValue().siniestroSinCobertura && (tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO
      //   || tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO)) {
      //   habilitarEditarCobertura = true
      // }
      if (
        !getFieldsValue().siniestroSinCobertura &&
        (tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
          tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
          tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO ||
          tarea.idTarea === TAREAS.REVISAR_INFORME)
      ) {
        habilitarEditarCobertura = false;
      }
    }

    return (
      <Fragment>
        <Modal
          centered
          visible={modal}
          onOk={() => {
            validateFields(err => {
              if (!err) {
                if (getFieldsValue().siniestroSinCobertura) {
                  confirmarSiniestroSinCobertura();
                } else {
                  onOkEditar();
                }
              }
            });
          }}
          onCancel={() => cerrar()}
          okButtonProps={{
            'data-cy': 'boton_aceptar_editar_cobertura',
            disabled:
              (habilitarEditarCobertura &&
                (tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                  tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO ||
                  tarea.idTarea === TAREAS.REVISAR_INFORME)) ||
              loadingEditar ||
              disabledGeneral ||
              tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
              !(
                (verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) &&
                  (tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                    tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ||
                    tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO ||
                    tarea.idTarea === TAREAS.REVISAR_INFORME ||
                    (flagModificar && !getFieldsValue().siniestroSinCobertura))) ||
                (verificarUsuario(ROLES_USUARIOS.AJUSTADOR) &&
                  (tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO ||
                    tarea.idTarea === TAREAS.GENERAR_INFORME ||
                    tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR))
              ) ||
              (tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO &&
                (validarSiEsRechazo || validarCoberturaSinPago || validarBotonEditar)) ||
              (tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR && validarCoberturaSinPago) ||
              ((tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO || tarea.idTarea === TAREAS.GENERAR_INFORME) &&
                validarBotonEditarGIB) ||
              hasErrors(getFieldsError()) ||
              (getFieldsValue().siniestroSinCobertura &&
                tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO &&
                siniestroSinCobertura === 'SI') ||
              coberturaTienePagos ||
              reCargaRamosCoberturas,
            loading: loadingEditar
          }}
          cancelButtonProps={{
            disabled: loadingEditar || reCargaRamosCoberturas
          }}
        >
          <Form>
            <h2>Cálculo reserva de la cobertura</h2>
            <Row gutter={24}>
              {tarea.idTarea !== TAREAS.REVISAR_PAGO_AJUSTADOR && (
                <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginBottom: '10px' }}>
                  {getFieldDecorator('siniestroSinCobertura', {
                    initialValue: siniestroSinCobertura === 'SI' || getFieldsValue().siniestroSinCobertura,
                    valuePropName: 'checked'
                  })(
                    <Checkbox
                      onChange={this.manejarCambioCheck}
                      disabled={
                        !(
                          (verificarUsuario(ROLES_USUARIOS.EJECUTIVO_DE_SINIESTRO) &&
                            (tarea.idTarea === TAREAS.ANALIZAR_SINIESTRO ||
                              tarea.idTarea === TAREAS.REVISAR_INFORME_BASICO ||
                              tarea.idTarea === TAREAS.REVISAR_INFORME)) ||
                          esRechazo
                        ) ||
                        (habilitarSiniestroSinCobertura && tarea.idTarea !== TAREAS.ANALIZAR_SINIESTRO) ||
                        loadingEditar ||
                        (verificarUsuario(ROLES_USUARIOS.AJUSTADOR) &&
                          tarea.idTarea === TAREAS.GENERAR_INFORME_BASICO) ||
                        tarea.idTarea === TAREAS.CONFIRMAR_GESTION ||
                        disabledGeneral ||
                        indCargaMasiva === 'COA' ||
                        reCargaRamosCoberturas
                      }
                    >
                      Siniestro sin cobertura
                    </Checkbox>
                  )}
                </Col>
              )}

              {getFieldsValue().siniestroSinCobertura && (
                <Fragment>
                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item label="Motivo rechazo SBS">
                      {getFieldDecorator('motivoRechazoSbs', {
                        initialValue: codMotivoRechazoSBS || '',
                        rules: [
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select
                          onChange={this.manejarCambioSeleccionar}
                          placeholder="Seleccione motivo"
                          disabled={siniestroSinCobertura === 'SI' || loadingEditar || reCargaRamosCoberturas}
                        >
                          {opcionesMotivosRechazoSbs}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item label="Motivo rechazo">
                      {getFieldDecorator('motivoRechazo', {
                        initialValue: codMotivoRechazo || '',
                        rules: [
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Select
                          placeholder="Seleccione motivo"
                          onChange={this.manejarCambioSeleccionar}
                          disabled={siniestroSinCobertura === 'SI' || loadingEditar || reCargaRamosCoberturas}
                        >
                          {opcionesMotivosRechazo}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>

                  {(getFieldsValue().motivoRechazoSbs === '99' || codMotivoRechazoSBS === '99') && (
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item label="Detalle">
                        {getFieldDecorator('detalleMotivoRechazo', {
                          initialValue: detOtrosCasos || '',
                          rules: [
                            {
                              type: 'string',
                              message: ValidationMessage.NOT_VALID
                            },
                            {
                              required: true,
                              message: ValidationMessage.REQUIRED,
                              validator: (rules, value, cb) => {
                                if (value === '' || !value) {
                                  cb('Campo requerido');
                                }
                                cb();
                              }
                            }
                          ]
                        })(
                          <Input.TextArea
                            placeholder="Detalle"
                            autosize={{ minRows: 3, maxRows: 3 }}
                            maxLength={500}
                            disabled={
                              siniestroSinCobertura === 'SI' ||
                              loadingEditar ||
                              disabledGeneral ||
                              reCargaRamosCoberturas
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                </Fragment>
              )}
            </Row>
            {!getFieldsValue().siniestroSinCobertura && (
              <Fragment>
                <div className="subseccion">
                  <Row gutter={24}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <h3>Reserva cobertura</h3>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item
                        label="Monto reclamado"
                        required
                        className="without-margin"
                        style={{
                          height: '75px'
                        }}
                      >
                        {getFieldDecorator('montoReclamado', {
                          initialValue: {
                            number: currency(montoReclamado)
                          },
                          rules: [
                            {
                              validator: this.validarMonto
                            }
                          ]
                        })(
                          <PriceInputNoSymbol
                            placeholder="Monto Reclamado"
                            disabled={
                              this.permisosEjecutivoOajustador(tarea.idTarea, flagModificar) ||
                              this.permisosAprobador(tarea.idTarea) ||
                              loadingEditar ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO &&
                                (validarSiEsRechazo || validarCoberturaSinPago)) ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR && validarCoberturaSinPago) ||
                              coberturaTienePagos ||
                              reCargaRamosCoberturas
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item
                        label="Reserva antes de deducible"
                        required
                        className="without-margin"
                        style={{
                          height: '95px'
                        }}
                      >
                        {getFieldDecorator('montoReserva', {
                          initialValue: {
                            number: currency(reservaAntesDeducible)
                          },
                          rules: [{ validator: this.verificarReserva }]
                        })(
                          <PriceInputNoSymbol
                            placeholder="Reserva antes de deducible"
                            disabled={
                              this.permisosEjecutivoOajustador(tarea.idTarea, flagModificar) ||
                              this.permisosAprobador(tarea.idTarea) ||
                              loadingEditar ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO &&
                                (validarSiEsRechazo || validarCoberturaSinPago)) ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR && validarCoberturaSinPago) ||
                              coberturaTienePagos ||
                              reCargaRamosCoberturas
                            }
                          />
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item label="Total pagos">
                        <span>{currency(totalPagosAprobadosCobertura).format()}</span>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item label="Reserva neta deducible">
                        <span>{this.calcularReservaNetaDeducible()}</span>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item label="Saldo pendiente cobertura">
                        <span>{saldoPendienteCobertura}</span>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item label="Moneda póliza">
                        <span>{monedaIndemnizacion}</span>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item label="Cobertura">
                        <span>{dscCobertura}</span>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item label="causa">
                        {getFieldDecorator('causa', {
                          initialValue: selectedCobertura.codCausa,
                          rules: [
                            {
                              required: true,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Select
                            placeholder="Seleccione causa"
                            onChange={this.manejarCambioSeleccionar}
                            disabled={
                              this.permisosEjecutivoOajustador(tarea.idTarea, flagModificar) ||
                              this.permisosAprobador(tarea.idTarea) ||
                              loadingEditar ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO &&
                                (validarSiEsRechazo || validarCoberturaSinPago)) ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR && validarCoberturaSinPago) ||
                              coberturaTienePagos ||
                              reCargaRamosCoberturas
                            }
                          >
                            {opcionesCausas}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                      <Form.Item label="Consecuencia">
                        {getFieldDecorator('consecuencia', {
                          initialValue: selectedCobertura.codConsecuencia,
                          rules: [
                            {
                              required: true,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Select
                            placeholder="Seleccione consecuencia"
                            onChange={this.manejarCambioSeleccionar}
                            disabled={
                              this.permisosEjecutivoOajustador(tarea.idTarea, flagModificar) ||
                              this.permisosAprobador(tarea.idTarea) ||
                              loadingEditar ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO &&
                                (validarSiEsRechazo || validarCoberturaSinPago)) ||
                              (tarea.idTarea === TAREAS.REVISAR_PAGO_AJUSTADOR && validarCoberturaSinPago) ||
                              coberturaTienePagos ||
                              reCargaRamosCoberturas
                            }
                          >
                            {opcionesConsecuencias}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </Fragment>
            )}
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: state.services.user.userClaims,
  motivosRechazo: getMotivosRechazo(state),
  motivosRechazoSbs: getMotivosRechazoSbs(state),
  causas: getCauses(state).causes,
  consecuencias: getConsequences(state).consequences,
  ramo: getBranches(state).branches,
  loadingEditar: getLoadingEditar(state)
});

const mapDispatchToProps = dispatch => ({
  obtenerCausas: api => dispatch(fetchCauses(api)),
  obtenerConsecuencias: api => dispatch(fetchConsequences(api))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create({ name: 'modalEditarCobertura' })(EditarCobertura));
