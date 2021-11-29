import React from 'react';
import { connect } from 'react-redux';
import { Icon, Collapse, Button, Col, Form, Modal, notification, Spin } from 'antd';
import { withRouter } from 'react-router-dom';
import { capitalize, union } from 'lodash';
import TakeTask from 'scenes/TaskTray/components/TakeTaskButton';

/* SECTIONS */
import DataPolizaSections from 'scenes/TaskTray/components/SectionDataPoliza';
import DataCertificateSections from 'scenes/TaskTray/components/SectionDataCertificate';
import DataSinisterSections from 'scenes/TaskTray/components/SectionDataSinister';
import DataCoberturaSection from 'scenes/TaskTray/components/SectionDataCobertura';
import DataReportSections from 'scenes/TaskTray/components/SectionDataReport';
import DocumentSinisterSections from 'scenes/TaskTray/components/SectionDocumentSinister';
import SectionCargarDocumento from 'scenes/components/SectionCargarDocumento';
import HistoryChangeDocumentSection from 'scenes/TaskTray/components/SectionHistoryChange';
import PaymentSection from 'scenes/TaskTray/components/SectionPayments';
import ObservacionSection from 'scenes/TaskTray/components/SectionObservation';
import BitacoraSection from 'scenes/TaskTray/components/SectionBitacora';

/* ACTION CREATORS */
import * as taskActionCreators from 'scenes/TaskTray/data/task/actions';
import * as uiActionCreators from 'services/ui/actions';

import {
  showErrorMessage,
  showSuccessMessage,
  showFirstError,
  llamarServiciosAnalizarSiniestro,
  reinicioServiciosAnalizarSiniestro,
  modalConfirmacionCompletarTareaAjustador,
  modalConfirmacionReintentar,
  modalDocumentoCompletar
} from 'util/index';

/* REDUCERS */
import { getCoordenadas } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/reducer';
import { getPayments } from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';
import { getCurrentTask } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/reducer';
import { getTakeTask } from 'scenes/TaskTray/data/task/reducer';
import { getIdCargoBpm } from 'services/users/reducer';
import {
  getCoveragesAdjusters,
  getRamos
} from 'scenes/TaskTray/components/SectionDataCobertura/data/coveragesAdjusters/reducer';
import {
  getDataPoliza,
  getCoaseguros,
  getReaseguros
} from 'scenes/TaskTray/components/SectionDataPoliza/data/dataPoliza/reducer';
import { getDataCertificate } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import {
  getDataSinister,
  getIdeSinAX,
  getNumCertificado,
  getIdePoliza
} from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import { getAjustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/reducer';
import { getShipmentNatures } from 'scenes/TaskTray/components/SectionDataSinister/data/shipmentNatures/reducer';
import { getClosingReasons } from 'scenes/TaskTray/components/SectionDataSinister/data/closingReasons/reducer';
import { obtenerDatoInforme } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/reducer';
import { getAdjusters } from 'scenes/TaskTray/components/SectionPayments/data/adjusters/reducer';
import { obtenerMotivos } from 'scenes/TaskTray/components/SectionDataReport/data/motivo/reducer';
import {
  CONSTANTS_APP,
  MENSAJES_TAREAS,
  BOTONES,
  MENSAJE_DOCUMENTOS_COMPLETAR,
  MENSAJE_DOCUMENTOS_GUARDAR
} from 'constants/index';
import { creaRequestDesdeProps } from 'scenes/TaskTray/util';

/* CSS */
import './styles.css';

class GenerarInformeBasico extends React.Component {
  state = {
    activeKey: [], // '1','2','3','4','5','6','7','8','9','10','11'
    isLoading: false,
    takeTask: false
  };

  async componentDidMount() {
    const {
      numSiniestro,
      dispatch,
      currentTask: { idTareaBitacora }
    } = this.props;
    try {
      dispatch(uiActionCreators.switchLoader());
      await llamarServiciosAnalizarSiniestro(dispatch, numSiniestro, null, idTareaBitacora);
      this.setState({ activeKey: ['1'] });
    } catch (err) {
      const { history } = this.props;
      Modal.error({
        title: 'Ocurrió un error al obtener datos. Por favor vuelva a intentar.',
        onOk() {
          history.push('/tareas');
        }
      });
      // showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    } finally {
      dispatch(uiActionCreators.switchLoader());
    }
  }

  // TODO: colocar aqui todos los reset de las llamadas a API relativas al siniestro
  // para que la data se limpie y puedan popularse para un siniestro distinto ej. Ramos
  // del siniestro. No poner poner aqui reset de data unica, como por ejemplo las listas de
  // parámetros.
  componentWillUnmount() {
    const { dispatch } = this.props;
    reinicioServiciosAnalizarSiniestro(dispatch);
  }

  CompletarSinisterConfirm = () => {
    Modal.confirm({
      title: 'Desea continuar con la atención del siniestro ?.',
      okText: 'Si',
      cancelText: 'No',
      onOk() {},
      onCancel() {}
    });
  };

  AprobarSinisterConfirm = () => {
    Modal.confirm({
      title: 'Desea continuar con la atención del siniestro ?.',
      okText: 'Si',
      cancelText: 'No',
      onOk() {},
      onCancel() {}
    });
  };

  // START_CONTROL_DE_ERRORES
  changedValueInput = event => {
    // eslint-disable-next-line
    this.setState({ inputValue: event.target.value });
  };

  notificationError = () => {
    notification.error({
      message: 'Error',
      description: 'Existen campos por completar',
      duration: 3
    });
  };

  takeTask = () => {
    this.setState({
      takeTask: true
    });
    const {
      dispatch,
      userClaims,
      userClaims: { nombres, apePaterno },
      currentTask,
      takeTask: { error }
    } = this.props;
    const username = `${capitalize(nombres)} ${capitalize(apePaterno)}`;
    dispatch(taskActionCreators.takeTask(username, currentTask, userClaims)).finally(() => {
      if (error) {
        showErrorMessage(error.message);
      } else {
        showSuccessMessage('Se tom\u00f3 la tarea con \u00e9xito');
      }
    });
  };
  /* eslint-disable */
  onSubmit = () => {
    const {
      form: { validateFieldsAndScroll, validateFields, getFieldsValue }
    } = this.props;

    const valoresFormulario = getFieldsValue();
    const validarSecciones = ['pagos', 'dataRamosCoberturas', 'siniestro', 'documentos', 'poliza'];
    const validarCampos = Object.keys(valoresFormulario).filter(key => !validarSecciones.includes(key));

    validateFieldsAndScroll(validarCampos, { scroll: { offsetTop: 20 } }, (error, values) => {
      if (!error) {
        validateFields(validarSecciones, { force: true }, (err, val) => {
          if (!err) {
            this.completarTarea();
          } else {
            // muestra validaciones genericas a nivel de seccion(es)
            // que se muestran en modal
            const { pagos, dataRamosCoberturas, siniestro, documentos, poliza } = err;
            if (poliza) showFirstError(poliza);
            else if (pagos) showFirstError(pagos);
            else if (dataRamosCoberturas) showFirstError(dataRamosCoberturas);
            else if (documentos) showFirstError(documentos);
            else if (siniestro) showFirstError(siniestro);
          }
        });
      } else {
        if (error.emailCorredorPoliza) {
          this.setState(state => {
            state.activeKey = this.state.activeKey.indexOf('1') === -1 ? state.activeKey.concat('1') : state.activeKey;
          });
        }
        if (error.emailAseguradoCertificate) {
          this.setState(state => {
            state.activeKey = this.state.activeKey.indexOf('2') === -1 ? state.activeKey.concat('2') : state.activeKey;
          });
        }
        if (
          error.nombretransporte ||
          error.fechaEmbarque ||
          error.lugarEmbarque ||
          error.fechaLlegada ||
          error.lugarDescarga ||
          error.naturalezaEmbarque ||
          error.nombreempresatransporte ||
          error.nombreConductor ||
          error.placaImoMatricula ||
          error.tipoMercaderia ||
          error.fechaInspeccion ||
          error.embarcacion ||
          error.pi ||
          error.imo ||
          error.nombreAerolinea ||
          error.matriculaAeronave ||
          error.numeroVuelo ||
          error.reservaConceptos ||
          error.reservaHonorarios
        ) {
          this.setState(state => {
            state.activeKey = this.state.activeKey.indexOf('3') === -1 ? state.activeKey.concat('3') : state.activeKey;
          });
        }
        if (
          error.motivo ||
          error.ajustador ||
          error.emailInforme ||
          error.nroPreferenciaAjustador ||
          error.ajustadorEncargado ||
          error.fechaInspeccionInforme ||
          error.fechaCoordinacion ||
          error.fechaProgramadaInspeccion ||
          error.lugarInspeccion ||
          error.situacionActual ||
          error.nombrePersonaEntrevistada ||
          error.notaInforme ||
          error.fechaRecepcion
        ) {
          this.setState(state => {
            state.activeKey = this.state.activeKey.indexOf('5') === -1 ? state.activeKey.concat('5') : state.activeKey;
          });
        }

        if (error.observaciones) {
          this.setState(prevState => {
            return {
              ...prevState,
              activeKey: union(prevState.activeKey, ['10'])
            };
          });
        }
      }
    });
  };

  redireccionBandeja = () => {
    const { history } = this.props;
    history.push('/tareas');
  };

  handleConfirmar = async () => {
    const { dispatch } = this.props;

    const params = {
      ...creaRequestDesdeProps('C', this.props)
    };
    try {
      await dispatch(taskActionCreators.completarTarea(params));
      showSuccessMessage(MENSAJES_TAREAS.EXITO_COMPLETAR);
      this.redireccionBandeja();
    } catch (error) {
      const { response: { status } = {} } = error;
      if (status === 504) {
        modalConfirmacionReintentar();
        return;
      }

      showErrorMessage(MENSAJES_TAREAS.ERROR_COMPLETAR);
    }
  };

  completarTarea = () => {
    modalConfirmacionCompletarTareaAjustador(() => this.handleConfirmar());
  };

  guardarTarea = async () => {
    const {
      dispatch,
      numSiniestro,
      currentTask: { idTareaBitacora },
      form: { getFieldValue, validateFieldsAndScroll, getFieldsValue, resetFields },
      branches
    } = this.props;

    const valoresFormulario = getFieldsValue();
    const valoresTipoCadena = [];
    Object.keys(valoresFormulario).forEach(item => {
      // por cada valor del Formulario
      if (typeof getFieldValue(item) === 'string') {
        if (getFieldValue(item).length > 0) {
          // validar si es string y su longitud es mayor a 0
          valoresTipoCadena.push(item);
        }
      }
    });
    try {
      validateFieldsAndScroll(valoresTipoCadena, async (error, values) => {
        if (!error) {
          const params = creaRequestDesdeProps('G', this.props);

          try {
            await dispatch(taskActionCreators.guardarSiniestro(params));
          } catch (e) {
            showErrorMessage(MENSAJES_TAREAS.ERROR_GUARDAR);
            return;
          }

          reinicioServiciosAnalizarSiniestro(dispatch);

          try {
            dispatch(uiActionCreators.switchLoader());
            await llamarServiciosAnalizarSiniestro(dispatch, numSiniestro, null, idTareaBitacora);
          } catch (err) {
            showErrorMessage(MENSAJES_TAREAS.ERROR_CARGA_DESPUES_GUARDAR);
            return;
          } finally {
            dispatch(uiActionCreators.switchLoader());
          }
          resetFields();
        } else {
          showErrorMessage('Error en la validacion de los datos ingresados.');
          if (error.emailCorredorPoliza) {
            this.setState(prevState => {
              return {
                ...prevState,
                activeKey: union(prevState.activeKey, ['1'])
              };
            });
          }
          if (error.emailAseguradoCertificate) {
            this.setState(prevState => {
              return {
                ...prevState,
                activeKey: union(prevState.activeKey, ['2'])
              };
            });
          }

          if (
            error.nombretransporte ||
            error.fechaEmbarque ||
            error.lugarEmbarque ||
            error.fechaLlegada ||
            error.lugarDescarga ||
            error.naturalezaEmbarque ||
            error.nombreempresatransporte ||
            error.nombreConductor ||
            error.placaImoMatricula ||
            error.tipoMercaderia ||
            error.fechaInspeccion ||
            error.embarcacion ||
            error.pi ||
            error.imo ||
            error.nombreAerolinea ||
            error.matriculaAeronave ||
            error.numeroVuelo ||
            error.reservaConceptos ||
            error.reservaHonorarios
          ) {
            this.setState(prevState => {
              return {
                ...prevState,
                activeKey: union(prevState.activeKey, ['3'])
              };
            });
          }
          if (
            error.motivo ||
            error.ajustador ||
            error.emailInforme ||
            error.emailAjustador ||
            error.nroPreferenciaAjustador ||
            error.ajustadorEncargado ||
            error.fechaInspeccionInforme ||
            error.fechaCoordinacion ||
            error.fechaProgramadaInspeccion ||
            error.lugarInspeccion ||
            error.situacionActual ||
            error.nombrePersonaEntrevistada ||
            error.notaInforme ||
            error.fechaRecepcion
          ) {
            this.setState(prevState => {
              return {
                ...prevState,
                activeKey: union(prevState.activeKey, ['5'])
              };
            });
          }
          if (error.observaciones) {
            this.setState(prevState => {
              return {
                ...prevState,
                activeKey: union(prevState.activeKey, ['10'])
              };
            });
          }
        }
      });
    } catch (err) {
      showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    }
  };

  reset = e => {
    const {
      form: { resetFields, validateFields }
    } = this.props;
    e.preventDefault();
    resetFields();
    validateFields();
  };

  // END_CONTROL_DE_ERRORES

  selectSection = key => {
    // eslint-disable-next-line
    this.setState({
      activeKey: key
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;
    history.push(`/tareas`);
  };

  redirectToPath = path => {
    const { history } = this.props;
    history.push(path);
  };

  tieneDocumentosCargados = event => {
    const {
      form: { getFieldValue }
    } = this.props;
    const { listaDocumentos } = getFieldValue('documentos') || {};
    const tieneDocumentos = listaDocumentos ? listaDocumentos.length >= 1 : false;
    const totalDocumentos = listaDocumentos ? listaDocumentos.length : 0;
    if (tieneDocumentos && event === BOTONES.COMPLETAR) {
      const mensajeCuerpo =
        totalDocumentos > 1 ? MENSAJE_DOCUMENTOS_COMPLETAR.DOCUMENTOS : MENSAJE_DOCUMENTOS_COMPLETAR.DOCUMENTO;
      modalDocumentoCompletar(mensajeCuerpo);
    } else if (tieneDocumentos) {
      Modal.confirm({
        title: 'Documentos pendientes',
        content: totalDocumentos > 1 ? MENSAJE_DOCUMENTOS_GUARDAR.DOCUMENTOS : MENSAJE_DOCUMENTOS_GUARDAR.DOCUMENTO,
        okText: 'Si',
        cancelText: 'No',
        onOk: () => {
          if (event === BOTONES.GUARDAR) {
            this.guardarTarea();
          } else {
            this.redirectToTarget();
          }
        },
        onCancel: () => {}
      });
    } else if (event === BOTONES.CANCELAR) {
      this.redirectToTarget();
    } else if (event === BOTONES.GUARDAR) {
      this.guardarTarea();
    } else if (event === BOTONES.COMPLETAR) {
      this.onSubmit();
    }
  };

  render() {
    const {
      form,
      datosInforme,
      ajustadores,
      dataSinister,
      motivos,
      currentTask,
      currentTask: { idTarea },
      user,
      numSiniestro,
      userClaims,
      takeTask: { isLoading: takeTaskLoading },
      dataPoliza,
      dataCertificate,
      shipmentNatures,
      closingReasons,
      coveragesAdjusters,
      payments,
      coordenadas,
      showScroll
    } = this.props;

    const { isLoading, activeKey, alinearBotonAgregarEmbarque } = this.state;
    const customPanelStyle = {
      background: '#FFFF',
      borderRadius: 4,
      marginBottom: 0,
      border: 0,
      overflow: 'hidden'
    };
    return (
      <Spin spinning={isLoading}>
        <Form>
          <h1>{currentTask.tarea}</h1>
          <h3> N&uacute;mero de caso: {numSiniestro}</h3>
          {!currentTask.tomado && <TakeTask takeTask={this.takeTask} isLoading={takeTaskLoading} />}
          <br />
          <Collapse
            bordered={false}
            activeKey={activeKey}
            expandIcon={({ isActive }) => (
              <Icon type="right" rotate={isActive ? 90 : 0} style={{ fontSize: '20px', color: '#E6281E' }} />
            )}
            accordion={false}
            onChange={this.selectSection}
          >
            <Collapse.Panel forceRender header="DATOS P&Oacute;LIZA" key="1" style={customPanelStyle}>
              <DataPolizaSections
                form={form}
                disabledGeneral={!currentTask.tomado}
                DataPolizaMethodsHandler={this.DataPolizaMethodsHandler}
                userClaims={this.props.userClaims}
                idCurrentTask={this.props.currentTask.idTarea}
                dataPoliza={this.props.dataPoliza.poliza[0]}
                numSiniestro={numSiniestro}
                currentTask={currentTask}
                redirectToPath={this.redirectToPath}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DEL CERTIFICADO" key="2" style={customPanelStyle}>
              <DataCertificateSections
                form={form}
                userClaims={userClaims}
                idCurrentTask={currentTask.idTarea}
                currentTask={currentTask}
                numSiniestro={numSiniestro}
                disabledGeneral={!currentTask.tomado}
                DataCertificateMethodsHandler={this.DataCertificateMethodsHandler}
                dataCertificado={dataCertificate.certificate[0]}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DEL SINIESTRO" forceRender={true} key="3" style={customPanelStyle}>
              <DataSinisterSections
                form={form}
                userClaims={userClaims}
                currentTask={currentTask}
                disabledGeneral={!currentTask.tomado}
                alinearBotonAgregarEmbarque={alinearBotonAgregarEmbarque}
                DataSinisterMethodsHandler={this.DataSinisterMethodsHandler}
                dataSiniestro={dataSinister}
                numSiniestro={numSiniestro}
                shipmentNatures={shipmentNatures}
                closingReasons={closingReasons}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DE LA COBERTURA" forceRender key="4" style={customPanelStyle}>
              <DataCoberturaSection
                form={form}
                coveragesAdjusters={coveragesAdjusters}
                disabledGeneral={!currentTask.tomado}
                currentTask={currentTask}
                numSiniestro={numSiniestro}
                tarea={currentTask}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DEL INFORME" key="5" forceRender style={customPanelStyle}>
              <DataReportSections
                form={form}
                disabledGeneral={!currentTask.tomado}
                DataReportMethodsHandler={this.DataReportMethodsHandler}
                data={datosInforme}
                ajustadores={ajustadores.adjusters}
                siniestro={dataSinister}
                motivos={motivos}
                tarea={currentTask}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DOCUMENTOS DEL SINIESTRO" key="6" style={customPanelStyle}>
              <DocumentSinisterSections disabledGeneral={!currentTask.tomado} numSiniestro={numSiniestro} />
            </Collapse.Panel>
            <Collapse.Panel header="CARGA DE DOCUMENTOS" key="7" forceRender style={customPanelStyle}>
              <SectionCargarDocumento
                form={form}
                disabledGeneral={!currentTask.tomado}
                currentTask={currentTask}
                showScroll={showScroll}
                currentTask={currentTask}
              />
            </Collapse.Panel>
            <Collapse.Panel header="HISTORIAL DE MODIFICACI&Oacute;N DE RESERVA" key="8" style={customPanelStyle}>
              <HistoryChangeDocumentSection />
            </Collapse.Panel>
            <Collapse.Panel forceRender={true} header="REGISTRO DE PAGOS" key="9" style={customPanelStyle}>
              <PaymentSection
                analizarForm={form}
                payments={payments}
                coordenadas={coordenadas}
                numSiniestro={numSiniestro}
                currentTask={currentTask}
                disabledGeneral={!currentTask.tomado}
                showScroll={showScroll}
              />
            </Collapse.Panel>
            <Collapse.Panel forceRender header="OBSERVACI&Oacute;N" key="10" style={customPanelStyle}>
              <ObservacionSection
                disabledGeneral={!currentTask.tomado}
                form={form}
                userClaims={userClaims}
                dataSiniestro={dataSinister}
                takeTask={this.state.takeTask}
                currentTask={currentTask}
              />
            </Collapse.Panel>
            <Collapse.Panel header="BIT&Aacute;CORA" key="11" style={customPanelStyle}>
              <BitacoraSection />
            </Collapse.Panel>
          </Collapse>

          <Col style={{ textAlign: 'right' }}>
            <Button onClick={() => this.tieneDocumentosCargados(BOTONES.CANCELAR)}>
              Cancelar
              <Icon type="close-circle" />
            </Button>
            <Button
              onClick={() => this.tieneDocumentosCargados(BOTONES.GUARDAR)}
              disabled={!currentTask.tomado}
              style={{
                marginLeft: '10px',
                marginRight: '10px',
                marginTop: '10px',
                marginBottom: '30px'
              }}
            >
              Guardar
              <Icon type="save" />
            </Button>
            <Button
              data-cy="boton_completar_generar_informe"
              type="primary"
              onClick={() => this.tieneDocumentosCargados(BOTONES.COMPLETAR)}
              disabled={!currentTask.tomado}
            >
              Completar
              <Icon type="check-circle" />
            </Button>
          </Col>
        </Form>
      </Spin>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const payments = getPayments(state);
  const coordenadas = getCoordenadas(state);
  const dataPoliza = getDataPoliza(state);
  const dataCertificate = getDataCertificate(state);
  const dataSinister = getDataSinister(state);
  const {
    match: { params }
  } = ownProps;
  const currentTask = getCurrentTask(state, ownProps.match);
  const takeTask = getTakeTask(state);
  const datosInforme = obtenerDatoInforme(state);
  const ajustadores = getAdjusters(state);
  const motivos = obtenerMotivos(state);
  const { numSiniestro } = params;
  const ideSinAX = getIdeSinAX(state);
  const numCertificado = getNumCertificado(state);
  const idePoliza = getIdePoliza(state);
  const shipmentNatures = getShipmentNatures(state);
  const closingReasons = getClosingReasons(state);
  const coaseguros = getCoaseguros(state);
  const reaseguros = getReaseguros(state);
  const branches = getRamos(state);
  const coveragesAdjusters = getCoveragesAdjusters(state);
  return {
    numSiniestro,
    currentTask,
    takeTask,
    payments,
    coordenadas,
    dataPoliza,
    dataCertificate,
    dataSinister,
    userClaims: state.services.user.userClaims,
    showScroll: state.services.device.scrollActivated,
    ideSinAX,
    numCertificado,
    idePoliza,
    shipmentNatures,
    closingReasons,
    coveragesAdjusters,
    datosInforme,
    ajustadores,
    motivos,
    coaseguros,
    reaseguros,
    branches,
    idCargoBpm: getIdCargoBpm(state),
    ajustadoresFromReport: getAjustadores(state)
  };
};

export default withRouter(connect(mapStateToProps)(Form.create({ name: 'generarInfomeBasico' })(GenerarInformeBasico)));
