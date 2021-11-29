import React, { Component, Fragment } from 'react';
import { Row, Form, Input, Col, Select, DatePicker, Checkbox, Divider, Radio, Modal } from 'antd';
import EmbarqueFormItem from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/EmbarqueFormItem';
import { ValidationMessage } from 'util/validation';
import OtherConceptsTableFormItem from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem';
import DireccionFormItem from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionFormItem';
import moment from 'moment';
import TrasbordoFormItem from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/TransbordoFormItem';

import { CONSTANTS_APP } from 'constants/index';

const initialState = {
  tipoFlujo: '',
  canal: '',
  dscCanal: '',
  descripcionTipoSiniestro: '',
  idSiniestro: '',
  estadoSiniestro: '',
  nombresEjecutivo: '',
  codProducto: '',
  descripcionProducto: '',
  numPoliza: '',
  idePoliza: '',
  numCertificado: '',
  fechaOcurrencia: '',
  fechaAviso: '',
  indTercerAfectado: '',
  codReclamoBanco: '',
  indPrevencionFraude: '',
  ubicacion: {},
  indCerrarSiniestro: false,
  aviacion: null,
  cascoMaritimo: null,
  transporte: null,
  otrosConceptos: [],
  datosDireccionSeleccionada: null,
  modalTablaVisible: false,
  modalFormVisible: false,
  saveButtonDisabled: true,
  cerrarSiniestro: false,
  codMotivoCierre: '',
  bienAfectado: '',
  indBurningCost: '',
  indRecupero: '',
  indRecuperoAnt: '',
  indSalvamento: '',
  indSalvamentoAnt: '',
  indCargaMasiva: '',
  codTipoSiniestro: '',
  codEstadoSiniestro: '',
  ubicacionModificada: false,
  siniestroLider: '',
  numPlanillaCoaseguro: '',
  codCoaseguroLider: 0,
  coaseguroLider: ''
};

class SinisterFormItem extends Component {
  state = initialState;

  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  cambioFlagUbicacionModificada = bool => {
    this.setState(prevState => {
      return {
        ...prevState,
        ubicacionModificada: bool
      };
    });

    this.triggerChange({
      ...this.state,
      ubicacionModificada: bool
    });
  };

  asignarOtrosConceptos = array => {
    this.setState(prevState => {
      return {
        ...prevState,
        otrosConceptos: array
      };
    });

    this.triggerChange({
      ...this.state,
      otrosConceptos: array
    });
  };

  cambioCierreSiniestro = e => {
    // Validar que no haya pagos Registrados!
    const {
      form: { getFieldValue, setFieldsValue }
    } = this.props;

    const { indemnizaciones, reposiciones } = getFieldValue('pagos');

    if (indemnizaciones.length > 0 || reposiciones.length > 0) {
      Modal.error({
        content: 'Ud. No puede cerrar el siniestro porque tiene pagos'
      });
      setTimeout(() => {
        setFieldsValue({
          indCerrarSiniestro: false
        });
      }, 1);
    } else {
      this.setState(prevState => {
        return {
          ...prevState,
          indCerrarSiniestro: e.target.checked
        };
      });
      this.triggerChange({
        ...this.state,
        indCerrarSiniestro: e.target.checked
      });
    }
  };

  validarIncoterms = (rule, value, callback) => {
    const { indCargaMasiva } = this.state;

    if (indCargaMasiva === 'COA') {
      callback();
      return;
    }

    const {
      validacionesDataSiniester: {
        validacionSelectNaturalezaEmbarque: { requerirSelectNaturalezaEmbarque }
      },
      currentTask: { idTarea },
      form: { getFieldValue }
    } = this.props;
    const listaOpcionesIncoterms = ['IMP', 'EXP', 'NAC'];
    const { incoterms, codigoNaturalezaEmbarque } = getFieldValue('incoterms');
    const cerrarSiniestroValue = getFieldValue('indCerrarSiniestro');
    const incotermsFiltrado = incoterms.filter(incoter => incoter.action !== 'D');

    const boolRequerirSelectNaturalezaEmbarque = requerirSelectNaturalezaEmbarque({
      idTarea,
      cerrarSiniestroValue
    });

    if (boolRequerirSelectNaturalezaEmbarque) {
      if (!listaOpcionesIncoterms.includes(codigoNaturalezaEmbarque)) {
        callback('Debe seleccionar Naturaleza Embarque');
      }

      if (incotermsFiltrado.length === 0 && codigoNaturalezaEmbarque === 'IMP') {
        callback('Para importación debe de haber por lo menos un registro de Incoterms');
      }
    }

    callback();
  };

  checkFechaEmbarque = (rules, value, callback) => {
    const {
      form: { getFieldValue }
    } = this.props;

    const seCierraSiniestroValue = getFieldValue('indCerrarSiniestro');
    if (!seCierraSiniestroValue) {
      if (value) {
        const fechaInspeccion =
          getFieldValue('fechaInspeccion') && getFieldValue('fechaInspeccion').format('YYYY-MM-DD');
        const fechaLlegada = getFieldValue('fechaLlegada') && getFieldValue('fechaLlegada').format('YYYY-MM-DD');
        const fechaEmbarque = value.format('YYYY-MM-DD');

        const diffLlegada = moment(fechaEmbarque).isAfter(fechaLlegada);
        const diffInspeccion = moment(fechaEmbarque).isAfter(fechaInspeccion);

        if (fechaLlegada && diffLlegada) {
          callback('La fecha de embarque no debe de ser mayor a la fecha de llegada');
        }

        if (fechaInspeccion && diffInspeccion) {
          callback('La fecha de embarque no debe de ser mayor a la fecha de inspeccion');
        }
      }
    }
    callback();
  };

  checkFechaLlegada = (rules, value, callback) => {
    const {
      form: { getFieldValue }
    } = this.props;
    const seCierraSiniestroValue = getFieldValue('indCerrarSiniestro');
    if (!seCierraSiniestroValue) {
      if (value) {
        const fechaEmbarque = getFieldValue('fechaEmbarque') && getFieldValue('fechaEmbarque').format('YYYY-MM-DD');
        const fechaLlegada = value.format('YYYY-MM-DD');
        const fechaInspeccion =
          getFieldValue('fechaInspeccion') && getFieldValue('fechaInspeccion').format('YYYY-MM-DD');

        const diffEmbarque = moment(fechaLlegada).isBefore(fechaEmbarque);
        const diffInspeccion = fechaInspeccion ? moment(fechaLlegada).isAfter(fechaInspeccion) : false;

        if (fechaEmbarque && diffEmbarque) {
          callback('La fecha de llegada debe de ser mayor a la fecha de embarque');
        }

        if (fechaInspeccion && diffInspeccion) {
          callback('La fecha de llegada debe de ser menor a la fecha de inspección');
        }
      }
    }
    callback();
  };

  checkFechaInspeccion = (rules, value, callback) => {
    const {
      form: { getFieldValue }
    } = this.props;
    const seCierraSiniestroValue = getFieldValue('indCerrarSiniestro');
    if (!seCierraSiniestroValue) {
      if (value) {
        const fechaLlegada = getFieldValue('fechaLlegada') && getFieldValue('fechaLlegada').format('YYYY-MM-DD');
        const fechaEmbarque = getFieldValue('fechaEmbarque') && getFieldValue('fechaEmbarque').format('YYYY-MM-DD');
        const fechaInspeccion = value.format('YYYY-MM-DD');

        const diffLlegada = moment(fechaInspeccion).isBefore(fechaLlegada);
        const diffEmbarque = moment(fechaInspeccion).isBefore(fechaEmbarque);

        if (fechaLlegada && diffLlegada) {
          callback('La fecha de inspección debe de ser mayor a la fecha de llegada');
          return;
        }

        if (fechaEmbarque && diffEmbarque) {
          callback('La fecha de inspección debe de ser mayor a la fecha de embarque');
          return;
        }
      }
    }
    callback();
  };

  checkTrasbordo = (rule, value, callback) => {
    const { indTrasbordo, trasbordos } = value;
    const trasbordosActivos = trasbordos.filter(trasbordo => trasbordo.action !== 'D');
    if (indTrasbordo && trasbordosActivos.length === 0) {
      callback('Debe Agregar, por lo menos, un trasbordo');
    }

    callback();
  };

  render() {
    const {
      tipoFlujo,
      dscCanal,
      codTipoSiniestro,
      descripcionTipoSiniestro,
      idSiniestro,
      estadoSiniestro,
      nombresEjecutivo,
      codProducto,
      descripcionProducto,
      numPoliza,
      numCertificado,
      fechaOcurrencia,
      fechaAviso,
      indTercerAfectado,
      indCargaMasiva,
      codReclamoBanco,
      indPrevencionFraude,
      ubicacion,
      bienAfectado,
      indBurningCost,
      indRecupero,
      indRecuperoAnt,
      indSalvamento,
      indSalvamentoAnt,
      transporte,
      cascoMaritimo,
      aviacion,
      otrosConceptos,
      indCerrarSiniestro,
      codMotivoCierre,
      codEstadoSiniestro,
      siniestroLider
    } = this.state;
    const {
      incoterms,
      shipmentNatures,
      disabledGeneral,
      userClaims,
      currentTask,
      currentTask: { idTarea },
      tamanioTablaPagina,
      showScroll,
      numSiniestro,
      form,
      flagModificar,
      esEjecutivo,
      esAjustador,
      validacionesDataSiniester,
      esSiniestroPreventivo,
      sinisterTypes: { isLoading, sinisterTypes },
      closingReasons: { closingReasons },
      form: { getFieldDecorator, getFieldValue }
    } = this.props;

    const cerrarSiniestroValue = getFieldValue('indCerrarSiniestro');
    const requiereAjustador = getFieldValue('ajustadorRequerido') === 'S';
    const esPrimerRamoTransporte =
      (((getFieldValue('dataRamosCoberturas') || {}).ramosCoberturas || [])[0] || {}).codRamo === 'TRAN';
    const esPrimerRamoAviacion =
      (((getFieldValue('dataRamosCoberturas') || {}).ramosCoberturas || [])[0] || {}).codRamo === 'AVIA';
    const esPrimerRamoCascoMaritimo =
      (((getFieldValue('dataRamosCoberturas') || {}).ramosCoberturas || [])[0] || {}).codRamo === 'CAMA';

    // Validaciones

    const {
      validacionSelectTipoSiniestro: { mostrarSelectTipoSiniestro },
      validacionBotonEditarLugarSiniestro: { habilitarBotonEditarLugarSiniestro },
      validacionDatosCargaMasiva: { mostrarDatosCargaMasiva },
      validacionInputDescripcionSiniestro: { habilitarInputDescripcionSiniestro },
      validacionCheckboxBurningCost: { habilitarCheckboxBurningCost, mostrarCheckboxBurningCost },
      validacionCheckboxSalvamento: { habilitarCheckboxSalvamento, mostrarCheckboxSalvamento },
      validacionCheckboxRecupero: { habilitarCheckboxRecupero, mostrarCheckboxRecupero },
      validacionRadioTercerosAfectados: { habilitarRadioTercerosAfectados },
      validacionSeccionTransporte: { mostrarSeccionTransporte },
      validacionTextoMedioTransporte: { mostrarTextoMedioTransporte },
      validacionInputDatosTransporte: { requerirInputDatosTransporte, habilitarInputDatosTransporte },
      validacionCheckboxTrasbordos,
      validacionBotonAgregarTrasbordo,
      validacionGrillaTrasbordo,
      validacionSelectNaturalezaEmbarque,
      validacionBotonAgregarIncoterms,
      validacionGrillaIncoterms,
      validacionOpcionGrillaTrasbordoIncoterms,
      validacionInputDatosTransporte3001: {
        requerirInputDatosTransporte3001,
        habilitarInputDatosTransporte3001,
        mostrarInputDatosTransporte3001
      },
      validacionSeccionCascoMaritimo: {
        requerirSeccionCascoMaritimo,
        habilitarSeccionCascoMaritimo,
        mostrarSeccionCascoMaritimo
      },
      validacionSeccionAviacion: { requerirSeccionAviacion, habilitarSeccionAviacion, mostrarSeccionAviacion },
      validacionBotonAgregarConcepto,
      validacionRadioOtrosConceptos,
      validacionBotonAnularConcepto,
      validacionEnlaceModificarConcepto,
      validacionCheckboxCerrarSiniestro: { mostrarCheckboxCerrarSiniestro, habilitarCheckboxCerrarSiniestro },
      validacionSelectMotivoCierre: {
        requerirSelectMotivoCierre,
        mostrarSelectMotivoCierre,
        habilitarSelectMotivoCierre
      }
    } = validacionesDataSiniester;

    const boolMostrarSelectTipoSiniestro = mostrarSelectTipoSiniestro({
      idTarea,
      esSiniestroPreventivo: codTipoSiniestro === 'P'
    });
    const boolMostrarDatosCargaMasiva = mostrarDatosCargaMasiva({
      idTarea,
      indCargaMasiva,
      esSiniestroPreventivo
    });
    const boolHabilitarBotonEditarLugarSiniestro = habilitarBotonEditarLugarSiniestro({
      idTarea,
      esSiniestroPreventivo
    });
    const boolHabilitarInputDescripcionSiniestro = habilitarInputDescripcionSiniestro({
      idTarea,
      esSiniestroPreventivo
    });

    const boolHabilitarCheckboxBurningCost = habilitarCheckboxBurningCost({
      idTarea,
      esSiniestroPreventivo
    });

    const boolMostrarCheckboxBurningCost = mostrarCheckboxBurningCost({
      tipoFlujo,
      idTarea,
      indCargaMasiva,
      esSiniestroPreventivo,
      codTipoSiniestro,
      requiereAjustador
    });

    const boolHabilitarCheckboxSalvamento = habilitarCheckboxSalvamento({
      idTarea,
      esAjustador,
      indSalvamentoAnt,
      esSiniestroPreventivo
    });
    const boolMostrarCheckboxSalvamento = mostrarCheckboxSalvamento({
      tipoFlujo,
      requiereAjustador
    });

    const boolHabilitarCheckboxRecupero = habilitarCheckboxRecupero({
      idTarea,
      esAjustador,
      indRecuperoAnt,
      esSiniestroPreventivo
    });

    const boolMostrarCheckboxRecupero = mostrarCheckboxRecupero({
      tipoFlujo,
      requiereAjustador
    });

    const boolHabilitarRadioTercerosAfectados = habilitarRadioTercerosAfectados({
      idTarea,
      esSiniestroPreventivo,
      tipoFlujo,
      indCargaMasiva,
      codTipoSiniestro
    });

    const boolMostrarSeccionTransporte = mostrarSeccionTransporte({
      transporte,
      esPrimerRamoTransporte,
      idTarea,
      esSiniestroPreventivo,
      tipoFlujo,
      indCargaMasiva,
      codTipoSiniestro
    });

    const boolMostrarTextoMedioTransporte = mostrarTextoMedioTransporte({
      codProducto
    });

    const boolRequerirInputDatosTransporte = requerirInputDatosTransporte({
      idTarea,
      cerrarSiniestroValue,
      indCargaMasiva
    });

    const boolHabilitarInputDatosTransporte = habilitarInputDatosTransporte({
      idTarea,
      esSiniestroPreventivo
    });

    const boolRequerirInputDatosTransporte3001 = requerirInputDatosTransporte3001({
      idTarea,
      cerrarSiniestroValue,
      indCargaMasiva
    });

    const boolHabilitarInputDatosTransporte3001 = habilitarInputDatosTransporte3001({
      idTarea,
      esSiniestroPreventivo
    });
    const boolMostrarInputDatosTransporte3001 = mostrarInputDatosTransporte3001({
      idTarea,
      flagModificar,
      codProducto
    });

    const boolRequerirSeccionCascoMaritimo = requerirSeccionCascoMaritimo({
      idTarea,
      cerrarSiniestroValue,
      indCargaMasiva
    });

    const boolHabilitarSeccionCascoMaritimo = habilitarSeccionCascoMaritimo({
      idTarea,
      esSiniestroPreventivo
    });

    const boolMostrarSeccionCascoMaritimo = mostrarSeccionCascoMaritimo({
      cascoMaritimo,
      esPrimerRamoCascoMaritimo,
      idTarea,
      esSiniestroPreventivo,
      tipoFlujo,
      indCargaMasiva,
      codTipoSiniestro
    });

    const boolRequerirSeccionAviacion = requerirSeccionAviacion({
      idTarea,
      cerrarSiniestroValue,
      indCargaMasiva
    });

    const boolHabilitarSeccionAviacion = habilitarSeccionAviacion({
      idTarea,
      esSiniestroPreventivo
    });

    const boolMostrarSeccionAviacion = mostrarSeccionAviacion({
      aviacion,
      esPrimerRamoAviacion,
      idTarea,
      esSiniestroPreventivo,
      tipoFlujo,
      indCargaMasiva,
      codTipoSiniestro
    });

    const boolMostrarCheckboxCerrarSiniestro = mostrarCheckboxCerrarSiniestro({
      idTarea
    });

    const boolHabilitarCheckboxCerrarSiniestro = habilitarCheckboxCerrarSiniestro({
      idTarea
    });

    const boolRequerirSelectMotivoCierre = requerirSelectMotivoCierre({
      cerrarSiniestroValue
    });
    const boolMostrarSelectMotivoCierre = mostrarSelectMotivoCierre({
      idTarea,
      cerrarSiniestroValue
    });

    const boolHabilitarSelectMotivoCierre = habilitarSelectMotivoCierre({
      idTarea
    });

    return (
      <Fragment>
        <Fragment>
          <Row gutter={24} type="flex" justify="start" pull={2}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <div className="claims-rrgg-description-list-index-term">Producto-P&oacute;liza-Certificado</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{`${codProducto} - ${descripcionProducto} - ${numPoliza} - ${numCertificado}`}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={24} type="flex" justify="start">
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Tipo flujo</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>
                  {tipoFlujo === 'S' && 'Simple'}
                  {tipoFlujo === 'C' && 'Complejo'}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Canal origen</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{dscCanal}</span>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Tipo siniestro</div>
              <div className="claims-rrgg-description-list-index-detail">
                {boolMostrarSelectTipoSiniestro ? (
                  getFieldDecorator('tipoSiniestro', {
                    initialValue: codTipoSiniestro
                  })(
                    <Select
                      loading={isLoading}
                      disabled={!currentTask.tomado}
                      style={{
                        width: 110,
                        marginLeft: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      {sinisterTypes.map(sinisterType => {
                        return (
                          <Select.Option key={sinisterType.valor} value={sinisterType.valor}>
                            {sinisterType.descripcion}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )
                ) : (
                  <span>{descripcionTipoSiniestro}</span>
                )}
              </div>
            </Col>
          </Row>
          <Row gutter={24} type="flex" justify="start">
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Nro. Siniestro</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{idSiniestro}</span>
              </div>
            </Col>
            {indCargaMasiva === 'COA' && (
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <div className="claims-rrgg-description-list-index-term">Nro. Siniestro Líder</div>
                <div className="claims-rrgg-description-list-index-detail">
                  <span>{siniestroLider}</span>
                </div>
              </Col>
            )}
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Estado siniestro</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>{estadoSiniestro}</span>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Ejecutivo</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>
                  {nombresEjecutivo ||
                    ((!disabledGeneral &&
                      esEjecutivo &&
                      `${userClaims.nombres} ${userClaims.apePaterno} ${userClaims.apeMaterno}`) ||
                      '')}
                </span>
              </div>
            </Col>
          </Row>
          <Row gutter={24} type="flex" align="middle" justify="start">
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Fecha ocurrencia</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>
                  {fechaOcurrencia !== ''
                    ? moment(fechaOcurrencia)
                        .utc()
                        .format('L')
                    : '--/--/----'}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8} xl={8}>
              <div className="claims-rrgg-description-list-index-term">Fecha aviso</div>
              <div className="claims-rrgg-description-list-index-detail">
                <span>
                  {fechaAviso !== ''
                    ? moment(fechaAviso)
                        .utc()
                        .format('L')
                    : '--/--/----'}
                </span>
              </div>
            </Col>
            {indCargaMasiva !== 'COA' && (
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <div className="claims-rrgg-description-list-index-term">Terceros afectados</div>
                <div className="claims-rrgg-description-list-index-detail">
                  {getFieldDecorator('indTercerAfectados', {
                    initialValue: indTercerAfectado === 'S'
                  })(
                    <Radio.Group disabled={disabledGeneral || !boolHabilitarRadioTercerosAfectados}>
                      <Radio value>Si</Radio>
                      <Radio value={false}>No</Radio>
                    </Radio.Group>
                  )}
                </div>
              </Col>
            )}
          </Row>
          {boolMostrarDatosCargaMasiva && (
            <Row gutter={24} type="flex" justify="start">
              {
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <div className="claims-rrgg-description-list-index-term">Código reclamo banco</div>
                  <div className="claims-rrgg-description-list-index-detail">
                    <span>{codReclamoBanco}</span>
                  </div>
                </Col>
              }
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <div className="claims-rrgg-description-list-index-detail">
                  {getFieldDecorator('indPrevencionFraude', {
                    valuePropName: 'checked',
                    initialValue: indPrevencionFraude === 'S'
                  })(<Checkbox disabled={disabledGeneral}>Prevenci&oacute;n de fraude</Checkbox>)}
                </div>
              </Col>
            </Row>
          )}
        </Fragment>
        <Form.Item>
          {getFieldDecorator('direccion', {
            initialValue: {
              secUbicacion: '',
              ideDirec: '',
              continente: (ubicacion || {}).continente,
              codPais: (ubicacion || {}).pais,
              codEstado: (ubicacion || {}).codDepartamento,
              descEstado: (ubicacion || {}).desDepartamento,
              codCiudad: (ubicacion || {}).codProvincia,
              descCiudad: (ubicacion || {}).desProvincia,
              codMunicipio: (ubicacion || {}).codDistrito,
              descMunicipio: (ubicacion || {}).desDistrito,
              direc: (ubicacion || {}).direccion
            }
            // rules: [{ validator: this.checkDireccionSiniestro }],
          })(
            <DireccionFormItem
              cambioFlagUbicacionModificada={this.cambioFlagUbicacionModificada}
              poliza={getFieldValue('poliza')}
              currentTask={currentTask}
              disabledGeneral={disabledGeneral || !boolHabilitarBotonEditarLugarSiniestro}
            />
          )}
        </Form.Item>
        <Row gutter={24}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item label="Descripci&oacute;n del Siniestro/Bienes afectados">
              {getFieldDecorator('descripcionSiniestro', {
                validateTrigger: 'onBlur',
                initialValue: bienAfectado,
                rules: [
                  {
                    whitespace: true,
                    message: ValidationMessage.NOT_VALID
                  }
                ]
              })(
                <Input.TextArea
                  maxLength="500"
                  disabled={disabledGeneral || !boolHabilitarInputDescripcionSiniestro}
                  placeholder="Ingresa la descripci&oacute;n"
                  autosize={{ minRows: 2, maxRows: 3 }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          {boolMostrarCheckboxBurningCost && (
            <Col xs={24} sm={8} md={8} lg={8} xl={8} xxl={8}>
              <Form.Item>
                <Row type="flex" justify="start">
                  {getFieldDecorator('indBurningCost', {
                    valuePropName: 'checked',
                    initialValue: indBurningCost === 'S'
                  })(<Checkbox disabled={disabledGeneral || !boolHabilitarCheckboxBurningCost}>Burning Cost</Checkbox>)}
                </Row>
              </Form.Item>
            </Col>
          )}
          {boolMostrarCheckboxRecupero && (
            <Col xs={24} sm={8} md={8} lg={8} xl={8} xxl={8}>
              <Form.Item>
                <Row type="flex" justify="start">
                  {getFieldDecorator('indRecupero', {
                    valuePropName: 'checked',
                    initialValue: indRecupero === 'S'
                  })(<Checkbox disabled={disabledGeneral || !boolHabilitarCheckboxRecupero}>Recupero</Checkbox>)}
                </Row>
              </Form.Item>
            </Col>
          )}
          {boolMostrarCheckboxSalvamento && (
            <Col xs={24} sm={8} md={8} lg={8} xl={8} xxl={8}>
              <Form.Item>
                <Row type="flex" justify="start">
                  {getFieldDecorator('indSalvamento', {
                    valuePropName: 'checked',
                    initialValue: indSalvamento === 'S'
                  })(<Checkbox disabled={disabledGeneral || !boolHabilitarCheckboxSalvamento}>Salvamento</Checkbox>)}
                </Row>
              </Form.Item>
            </Col>
          )}
        </Row>
        {
          <Fragment>
            {boolMostrarSeccionTransporte && (
              <Fragment>
                <Divider orientation="left" style={{ color: '#919191', fontWeight: 'bold' }}>
                  Ramo transporte
                </Divider>
                <Row gutter={24}>
                  {boolMostrarTextoMedioTransporte && (
                    <Col xs={24} sm={8} md={8} lg={4} xl={4}>
                      <Form.Item label="Medio transporte">
                        <span>{transporte.dscMedioTransporte}</span>
                      </Form.Item>
                    </Col>
                  )}
                  <Col xs={24} sm={16} md={16} lg={12} xl={12}>
                    <Form.Item label="Nombre transporte original">
                      {transporte.nombreTransporteOriginal !== undefined &&
                        getFieldDecorator('nombretransporte', {
                          validateTrigger: 'onBlur',
                          initialValue: transporte.nombreTransporteOriginal,
                          rules: [
                            {
                              type: 'string',
                              whitespace: true,
                              message: ValidationMessage.NOT_VALID
                            },
                            {
                              required: boolRequerirInputDatosTransporte,
                              message: ValidationMessage.REQUIRED
                            }
                          ]
                        })(
                          <Input
                            maxLength="200"
                            disabled={disabledGeneral || !boolHabilitarInputDatosTransporte}
                            placeholder="Nombre transporte original"
                          />
                        )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={16} md={16} lg={12} xl={12}>
                    <Form.Item label="Lugar embarque">
                      {getFieldDecorator('lugarEmbarque', {
                        validateTrigger: 'onBlur',
                        initialValue: transporte.lugarEmbarque,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirInputDatosTransporte,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input
                          maxLength="200"
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte}
                          placeholder="Lugar de embarque"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6} md={6} lg={8} xl={8}>
                    <Form.Item label="Fecha embarque">
                      {getFieldDecorator('fechaEmbarque', {
                        initialValue:
                          (transporte && transporte.fechaEmbarque && moment(transporte.fechaEmbarque).utc()) || null,
                        rules: [
                          {
                            required: boolRequerirInputDatosTransporte,
                            message: ValidationMessage.REQUIRED
                          },
                          {
                            validator: this.checkFechaEmbarque
                          }
                        ]
                      })(
                        <DatePicker
                          format={CONSTANTS_APP.FORMAT_DATE}
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={16} md={16} lg={12} xl={12}>
                    <Form.Item label="Lugar descarga">
                      {getFieldDecorator('lugarDescarga', {
                        validateTrigger: 'onBlur',
                        initialValue: transporte.lugarDescargo,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirInputDatosTransporte,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input
                          maxLength="200"
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte}
                          placeholder="Lugar de descarga"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6} md={6} lg={8} xl={8}>
                    <Form.Item label="Fecha llegada">
                      {getFieldDecorator('fechaLlegada', {
                        initialValue:
                          (transporte && transporte.fechaLlegada && moment(transporte.fechaLlegada).utc()) || null,
                        rules: [
                          {
                            required: boolRequerirInputDatosTransporte,
                            message: ValidationMessage.REQUIRED
                          },
                          {
                            validator: this.checkFechaLlegada
                          }
                        ]
                      })(
                        <DatePicker
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte}
                          format={CONSTANTS_APP.FORMAT_DATE}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row className="marginsBottom" gutter={24}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item label="Trasbordos">
                      {getFieldDecorator('trasbordos', {
                        validateTrigger: 'onBlur',
                        initialValue: {
                          trasbordos:
                            (transporte.transportesTrasbordo || []).map((item, index) => {
                              return { ...item, rowKey: index };
                            }) || [],
                          indTrasbordo: transporte.indTrasbordo === 'S'
                        },
                        rules: [
                          {
                            validator: this.checkTrasbordo
                          }
                        ]
                      })(
                        <TrasbordoFormItem
                          disabledGeneral={disabledGeneral}
                          form={form}
                          showScroll={showScroll}
                          idTarea={idTarea}
                          esSiniestroPreventivo={esSiniestroPreventivo}
                          flagModificar={flagModificar}
                          tamanioTablaPagina={tamanioTablaPagina}
                          validacionCheckboxTrasbordos={validacionCheckboxTrasbordos}
                          validacionBotonAgregarTrasbordo={validacionBotonAgregarTrasbordo}
                          validacionGrillaTrasbordo={validacionGrillaTrasbordo}
                          validacionOpcionGrillaTrasbordoIncoterms={validacionOpcionGrillaTrasbordoIncoterms}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  {
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item label="Naturaleza del embarque">
                        {getFieldDecorator('incoterms', {
                          initialValue: {
                            incoterms: transporte.listaIcoterms,
                            codigoNaturalezaEmbarque: transporte.codigoNaturalezaEmbarque || undefined
                          },
                          rules: [{ validator: this.validarIncoterms }]
                        })(
                          <EmbarqueFormItem
                            disabledGeneral={disabledGeneral}
                            form={form}
                            showScroll={showScroll}
                            constListaIncoterms={incoterms}
                            shipmentNatures={shipmentNatures}
                            idTarea={idTarea}
                            tamanioTablaPagina={tamanioTablaPagina}
                            esSiniestroPreventivo={esSiniestroPreventivo}
                            flagModificar={flagModificar}
                            cerrarSiniestroValue={cerrarSiniestroValue}
                            validacionSelectNaturalezaEmbarque={validacionSelectNaturalezaEmbarque}
                            validacionBotonAgregarIncoterms={validacionBotonAgregarIncoterms}
                            validacionGrillaIncoterms={validacionGrillaIncoterms}
                            validacionOpcionGrillaTrasbordoIncoterms={validacionOpcionGrillaTrasbordoIncoterms}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  }
                </Row>
              </Fragment>
            )}
            <Fragment>
              {boolMostrarInputDatosTransporte3001 && (
                <Row gutter={24}>
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item label="Nombre empresa transporte">
                      {getFieldDecorator('nombreEmpresaTransporte', {
                        validateTrigger: 'onBlur',
                        initialValue: transporte.empresaTransporte,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirInputDatosTransporte3001,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input
                          maxLength="100"
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte3001}
                          type="primary"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item label="Nombre conductor">
                      {getFieldDecorator('nombreConductor', {
                        validateTrigger: 'onBlur',
                        initialValue: transporte.nombreConductor,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirInputDatosTransporte3001,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input
                          maxLength="100"
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte3001}
                          type="primary"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item label="Placa-Imo-Nro Matr&iacute;cula">
                      {getFieldDecorator('placaImoMatricula', {
                        validateTrigger: 'onBlur',
                        initialValue: transporte.placa,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirInputDatosTransporte3001,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input
                          maxLength="20"
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte3001}
                          type="primary"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item label="Tipo mercader&iacute;a">
                      {getFieldDecorator('tipoMercaderia', {
                        validateTrigger: 'onBlur',
                        initialValue: transporte.tipoMercaderia,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirInputDatosTransporte3001,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input
                          maxLength="45"
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte3001}
                          type="primary"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                    <Form.Item label="Fecha inspecci&oacute;n">
                      {getFieldDecorator('fechaInspeccion', {
                        initialValue:
                          (transporte &&
                            transporte.fechaInspeccion !== '' &&
                            moment(transporte.fechaInspeccion).utc()) ||
                          null,
                        rules: [
                          {
                            required: boolRequerirInputDatosTransporte3001,
                            message: ValidationMessage.REQUIRED
                          },
                          {
                            validator: this.checkFechaInspeccion
                          }
                        ]
                      })(
                        <DatePicker
                          disabled={disabledGeneral || !boolHabilitarInputDatosTransporte3001}
                          format={CONSTANTS_APP.FORMAT_DATE}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </Fragment>

            {boolMostrarSeccionCascoMaritimo && (
              <Fragment>
                <Divider orientation="left" style={{ color: '#919191', fontWeight: 'bold' }}>
                  Ramo cascos mar&iacute;timos
                </Divider>
                {getFieldDecorator('idCascoMaritimo', {
                  initialValue: cascoMaritimo.idCascoMaritimo
                })(<Input type="hidden" />)}
                <Row gutter={24}>
                  <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Form.Item label="Embarcaci&oacute;n">
                      {getFieldDecorator('nombreEmbarcacion', {
                        validateTrigger: 'onBlur',
                        initialValue: cascoMaritimo.nombreEmbarcacion,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirSeccionCascoMaritimo,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input disabled={disabledGeneral || !boolHabilitarSeccionCascoMaritimo} type="primary" />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Form.Item label="P&I">
                      {getFieldDecorator('pi', {
                        validateTrigger: 'onBlur',
                        initialValue: cascoMaritimo.pi,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirSeccionCascoMaritimo,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input disabled={disabledGeneral || !boolHabilitarSeccionCascoMaritimo} type="primary" />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Form.Item label="IMO">
                      {getFieldDecorator('imo', {
                        validateTrigger: 'onBlur',
                        initialValue: cascoMaritimo.imo,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirSeccionCascoMaritimo,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input disabled={disabledGeneral || !boolHabilitarSeccionCascoMaritimo} type="primary" />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Fragment>
            )}
            {boolMostrarSeccionAviacion && (
              <Fragment>
                <Divider orientation="left" style={{ color: '#919191', fontWeight: 'bold' }}>
                  Ramo aviaci&oacute;n
                </Divider>
                {getFieldDecorator('idAviacion', {
                  initialValue: aviacion.idAviacion
                })(<Input type="hidden" />)}
                <Row gutter={24}>
                  <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Form.Item label="Nombre aerol&iacute;nea">
                      {getFieldDecorator('nombreAerolinea', {
                        initialValue: aviacion.nombreAerolinea,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirSeccionAviacion,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(
                        <Input
                          disabled={disabledGeneral || !boolHabilitarSeccionAviacion}
                          type="primary"
                          placeholder="Nombre aerol&iacute;nea"
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Form.Item label="Matr&iacute;cula aeronave">
                      {getFieldDecorator('matriculaAeronave', {
                        initialValue: aviacion.matriculaAeronave,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirSeccionAviacion,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input disabled={disabledGeneral || !boolHabilitarSeccionAviacion} type="primary" />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Form.Item label="N&uacute;mero vuelo">
                      {getFieldDecorator('numeroVuelo', {
                        initialValue: aviacion.numeroVuelo,
                        rules: [
                          {
                            type: 'string',
                            whitespace: true,
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: boolRequerirSeccionAviacion,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input disabled={disabledGeneral || !boolHabilitarSeccionAviacion} type="primary" />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Fragment>
            )}
          </Fragment>
        }
        <Divider orientation="left" style={{ color: '#919191', fontWeight: 'bold' }}>
          Reserva otros conceptos
        </Divider>
        <Row gutter={24}>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item>
              <OtherConceptsTableFormItem
                form={form}
                pagos={getFieldValue('pagos') || {}}
                disabledGeneral={disabledGeneral}
                showScroll={showScroll}
                flagModificar={flagModificar}
                userClaims={userClaims}
                esEjecutivo={esEjecutivo}
                esAjustador={esAjustador}
                currentTask={currentTask}
                numSiniestro={numSiniestro}
                otrosConceptos={otrosConceptos}
                tamanioTablaPagina={tamanioTablaPagina}
                asignarOtrosConceptos={this.asignarOtrosConceptos}
                validacionBotonAgregarConcepto={validacionBotonAgregarConcepto}
                validacionRadioOtrosConceptos={validacionRadioOtrosConceptos}
                validacionBotonAnularConcepto={validacionBotonAnularConcepto}
                validacionEnlaceModificarConcepto={validacionEnlaceModificarConcepto}
                codEstadoSiniestro={codEstadoSiniestro}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        {boolMostrarCheckboxCerrarSiniestro && (
          <Row gutter={48}>
            <Col xs={24} sm={12} md={8} lg={8} xl={8} style={{ marginBottom: '10px' }}>
              {getFieldDecorator('indCerrarSiniestro', {
                valuePropName: 'checked',
                initialValue: indCerrarSiniestro
                // rules:[{ validator: this.validarCierreSiniestro }]
              })(
                <Checkbox
                  onChange={this.cambioCierreSiniestro}
                  disabled={disabledGeneral || !boolHabilitarCheckboxCerrarSiniestro}
                >
                  Cerrar siniestro
                </Checkbox>
              )}
            </Col>
            {boolMostrarSelectMotivoCierre && (
              <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                <Form.Item label="Motivo cierre" required>
                  {getFieldDecorator('codMotivoCierre', {
                    initialValue: codTipoSiniestro === 'P' ? '0001' : codMotivoCierre || undefined,
                    rules: [
                      {
                        required: boolRequerirSelectMotivoCierre,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Select
                      placeholder="Seleccione motivo"
                      disabled={disabledGeneral || !boolHabilitarSelectMotivoCierre}
                      style={{
                        width: 200,
                        marginLeft: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      {closingReasons.map(closingReason => {
                        return (
                          <Select.Option key={closingReason.valor} value={closingReason.valor}>
                            {closingReason.descripcion}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
          </Row>
        )}
      </Fragment>
    );
  }
}
export default SinisterFormItem;
