import React from 'react';
import { connect } from 'react-redux';
import { Icon, Collapse, Button, Col, Form, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { capitalize, union, get } from 'lodash';
import TakeTask from 'scenes/TaskTray/components/TakeTaskButton/index';

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
import * as TipoConfirmarGestionActionCreators from 'scenes/TaskTray/scenes/ConfirmarGestion/data/tipoTarea/actions';
import * as uiActionCreators from 'services/ui/actions';

/* REDUCERS */
import { getCoordenadas } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/reducer';
import { getPayments } from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';
import { getCurrentTaskIdCase } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/reducer';
import { getTakeTask } from 'scenes/TaskTray/data/task/reducer';
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
import { getShipmentNatures } from 'scenes/TaskTray/components/SectionDataSinister/data/shipmentNatures/reducer';
import { getClosingReasons } from 'scenes/TaskTray/components/SectionDataSinister/data/closingReasons/reducer';
import { obtenerDatoInforme } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/reducer';
import { getAdjusters } from 'scenes/TaskTray/components/SectionPayments/data/adjusters/reducer';
import { obtenerMotivos } from 'scenes/TaskTray/components/SectionDataReport/data/motivo/reducer';
import {
  CONSTANTS_APP,
  TAREAS,
  MENSAJES_TAREAS,
  BOTONES,
  MENSAJE_DOCUMENTOS_COMPLETAR,
  MENSAJE_DOCUMENTOS_GUARDAR
} from 'constants/index';
import { getTipoConfirmarGestion } from 'scenes/TaskTray/scenes/ConfirmarGestion/data/tipoTarea/reducer';
import { getAjustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/reducer';
import { getIdCargoBpm } from 'services/users/reducer';
import {
  showErrorMessage,
  showSuccessMessage,
  showFirstError,
  llamarServiciosAnalizarSiniestro,
  reinicioServiciosAnalizarSiniestro,
  modalConfirmacionCompletarTarea,
  modalConfirmacionReintentar,
  modalDocumentoCompletar
} from 'util/index';
import { creaRequestDesdeProps } from 'scenes/TaskTray/util';

/* CSS */
import './styles.css';

class RevisarPago extends React.Component {
  state = {
    activeKey: [],
    esDevolver: false
  };

  async componentDidMount() {
    const { dispatch } = this.props;
    try {
      dispatch(uiActionCreators.switchLoader());
      await this.cargarDatosIniciales();
      this.setState({ activeKey: ['4', '9'] });
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

  cargarDatosIniciales = async () => {
    const {
      numSiniestro,
      dispatch,
      idCaso,
      currentTask: { idTareaBitacora, idTarea }
    } = this.props;
    let resultTipoConfirmarGestion;
    try {
      resultTipoConfirmarGestion = await dispatch(
        TipoConfirmarGestionActionCreators.fetchTipoTarea({
          idCaso: Number(idCaso)
        })
      );
    } catch (err) {
      showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
      return new Error('Error al cargar el tipo de confirmar gestion');
    }

    const tipoConfirmarGestion = get(resultTipoConfirmarGestion, 'data[0].tipo');
    if (tipoConfirmarGestion === 'A') {
      this.setState({ activeKey: ['9'] });
    } else if (tipoConfirmarGestion === 'R') {
      this.setState({ activeKey: ['4'] });
    }

    return llamarServiciosAnalizarSiniestro(
      dispatch,
      numSiniestro,
      Number(idCaso),
      idTareaBitacora,
      tipoConfirmarGestion,
      idTarea
    );
  };

  takeTask = () => {
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

  handleDevolver = () => {
    const {
      form: { validateFields }
    } = this.props;
    try {
      this.setState(
        {
          esDevolver: true
        },
        () =>
          validateFields(['observaciones'], { force: true }, err => {
            if (!err) {
              this.completarTarea(false);
            } else {
              this.setState(prevState => ({
                ...prevState,
                activeKey: union(prevState.activeKey, ['10'])
              }));
            }
          })
      );
    } catch (err) {
      showErrorMessage(String(err));
    }
  };

  selectSection = key => {
    this.setState({
      activeKey: key
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;
    history.push(`/tareas`);
  };

  redireccionBandeja = () => {
    const { history } = this.props;
    history.push('/tareas');
  };

  handleConfirmar = async flagAprobacion => {
    const {
      dispatch,
      form: { getFieldValue },
      dataSinister: { ajustador: { idUsuarioBPM } = {} } = {},
      currentTask: { idTarea },
      tipoConfirmarGestion
    } = this.props;

    const { indemnizaciones = [], honorarios = [], otrosConceptos = [], reposiciones = [] } =
      getFieldValue('pagos') || {};
    const indemnizacionNormalizado = indemnizaciones.map(indemnizacion => {
      return {
        ...indemnizacion,
        mtoImporte: indemnizacion.mtoIndemnizacionBruta
      };
    });
    const pagosUnificados = [...indemnizacionNormalizado, ...honorarios, ...otrosConceptos, ...reposiciones];

    const pagoRevisado = pagosUnificados.find(pgo => pgo.flagRevisarPago === 'S') || {};

    const requestGuardar = { ...creaRequestDesdeProps('C', this.props) };

    const params = {
      flagAprobacion: flagAprobacion ? 'S' : 'N',
      tipoConfirmarGestion: tipoConfirmarGestion === 'R' && pagosUnificados.length === 1 ? 'A' : tipoConfirmarGestion,
      montoPagar: pagoRevisado.mtoImporte ? Number(pagoRevisado.mtoImporte) : undefined,
      idAjustador: idUsuarioBPM,
      tipoPago: pagoRevisado.tipoPago,
      idPago: pagoRevisado.id,
      indCreoAjustador: pagoRevisado.indCreoAjustador,
      ...requestGuardar
    };

    // const request =
    //   idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO ? params : requestGuardar;
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

  completarTarea = (flagAprobacion = true) => {
    const {
      form: { validateFields }
    } = this.props;

    validateFields({ force: true }, errors => {
      if (!errors) {
        modalConfirmacionCompletarTarea(() => this.handleConfirmar(flagAprobacion));
      } else {
        // muestra validaciones genericas a nivel de seccion(es)
        // que se muestran en modal
        const { dataRamosCoberturas, pagos, siniestro } = errors;
        if (pagos) showFirstError(pagos);
        else if (dataRamosCoberturas) showFirstError(dataRamosCoberturas);
        else if (siniestro) showFirstError(siniestro);
      }
    });
  };

  handleCompletar = () => {
    this.completarTarea();
  };

  handleGuardar = async () => {
    const {
      dispatch,
      form: { resetFields }
    } = this.props;

    const params = creaRequestDesdeProps('G', this.props);

    try {
      await dispatch(taskActionCreators.guardarSiniestro(params));
    } catch (e) {
      showErrorMessage(MENSAJES_TAREAS.ERROR_GUARDAR);
      return;
    }

    try {
      dispatch(uiActionCreators.switchLoader());
      await this.cargarDatosIniciales();
      resetFields();
    } catch (e) {
      showErrorMessage(MENSAJES_TAREAS.ERROR_CARGA_DESPUES_GUARDAR);
      return;
    } finally {
      dispatch(uiActionCreators.switchLoader());
    }

    showSuccessMessage(MENSAJES_TAREAS.EXITO_GUARDAR);
  };

  muestraBotonDevolver = () => {
    const {
      currentTask: { idTarea },
      form: { getFieldValue },
      dataSinister: { indCargaMasiva }
    } = this.props;

    const { indemnizaciones = [], honorarios = [], otrosConceptos = [], reposiciones = [] } =
      getFieldValue('pagos') || {};

    const pagosUnificados = [...indemnizaciones, ...honorarios, ...otrosConceptos, ...reposiciones];

    const pagoRevisado = pagosUnificados.find(pgo => pgo.flagRevisarPago === 'S') || {};

    if (
      pagoRevisado.indCreoAjustador === 'S' &&
      idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO &&
      pagoRevisado.codEstado === 'OB' &&
      indCargaMasiva !== 'COA'
    ) {
      return true;
    }
    return false;
  };

  tieneDocumentosCargados = event => {
    const {
      form: { getFieldValue }
    } = this.props;
    const { listaDocumentos } = getFieldValue('documentos') || {};
    const tieneDocumentos = listaDocumentos ? listaDocumentos.length >= 1 : false;
    const totalDocumentos = listaDocumentos ? listaDocumentos.length : 0;
    if (tieneDocumentos && (event === BOTONES.COMPLETAR || event === BOTONES.DEVOLVER)) {
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
            this.handleGuardar();
          } else {
            this.redirectToTarget();
          }
        },
        onCancel: () => {}
      });
    } else if (event === BOTONES.CANCELAR) {
      this.redirectToTarget();
    } else if (event === BOTONES.GUARDAR) {
      this.handleGuardar();
    } else if (event === BOTONES.COMPLETAR) {
      this.handleCompletar();
    } else if (event === BOTONES.DEVOLVER) {
      this.handleDevolver();
    }
  };

  render() {
    const {
      form,
      datosInforme,
      ajustadores,
      dataSinister,
      dataPoliza,
      motivos,
      currentTask,
      numSiniestro,
      userClaims,
      currentTask: { idTarea },
      takeTask: { isLoading: takeTaskLoading },
      dataCertificate,
      shipmentNatures,
      closingReasons,
      coveragesAdjusters,
      payments,
      coordenadas,
      showScroll,
      tipoConfirmarGestion,
      idCaso
    } = this.props;

    const { activeKey, esDevolver, alinearBotonAgregarEmbarque } = this.state;

    const customPanelStyle = {
      background: '#FFFF',
      borderRadius: 4,
      marginBottom: 0,
      border: 0,
      overflow: 'hidden'
    };

    const esRevisarPagoEjecutivo = idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO;

    return (
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
          <Collapse.Panel header="DATOS P&Oacute;LIZA" key="1" style={customPanelStyle}>
            <DataPolizaSections
              form={form}
              disabledGeneral={!currentTask.tomado}
              userClaims={userClaims}
              currentTask={currentTask}
              idCurrentTask={currentTask.idTarea}
              dataPoliza={dataPoliza.poliza[0]}
              redirectToHome={this.redirectToTarget}
            />
          </Collapse.Panel>
          <Collapse.Panel header="DATOS DEL CERTIFICADO" key="2" style={customPanelStyle}>
            <DataCertificateSections
              form={form}
              userClaims={userClaims}
              currentTask={currentTask}
              idCurrentTask={currentTask.idTarea}
              disabledGeneral={!currentTask.tomado}
              dataCertificado={dataCertificate.certificate[0]}
            />
          </Collapse.Panel>
          <Collapse.Panel forceRender header="DATOS DEL SINIESTRO" key="3" style={customPanelStyle}>
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
              rechazoPago={tipoConfirmarGestion}
              idCaso={idCaso}
            />
          </Collapse.Panel>
          <Collapse.Panel header="DATOS DEL INFORME" forceRender key="5" style={customPanelStyle}>
            <DataReportSections
              form={form}
              disabledGeneral={esRevisarPagoEjecutivo && !currentTask.tomado}
              data={datosInforme}
              ajustadores={ajustadores.adjusters}
              siniestro={dataSinister}
              motivos={motivos}
              tarea={currentTask}
            />
          </Collapse.Panel>
          <Collapse.Panel header="DOCUMENTOS DEL SINIESTRO" key="6" style={customPanelStyle}>
            <DocumentSinisterSections
              disabledGeneral={esRevisarPagoEjecutivo && !currentTask.tomado}
              numSiniestro={numSiniestro}
            />
          </Collapse.Panel>
          <Collapse.Panel currentTask={currentTask} header="CARGA DE DOCUMENTOS" key="7" style={customPanelStyle}>
            <SectionCargarDocumento
              form={form}
              disabledGeneral={esRevisarPagoEjecutivo && !currentTask.tomado}
              showScroll={showScroll}
            />
          </Collapse.Panel>
          <Collapse.Panel header="HISTORIAL DE MODIFICACI&Oacute;N DE RESERVA" key="8" style={customPanelStyle}>
            <HistoryChangeDocumentSection />
          </Collapse.Panel>
          <Collapse.Panel forceRender header="REGISTRO DE PAGOS" key="9" style={customPanelStyle}>
            <PaymentSection
              analizarForm={form}
              payments={payments}
              coordenadas={coordenadas}
              numSiniestro={numSiniestro}
              currentTask={currentTask}
              disabledGeneral={!currentTask.tomado}
              showScroll={showScroll}
              tipoConfirmarGestion={tipoConfirmarGestion}
              esDevolver={esDevolver}
            />
          </Collapse.Panel>
          <Collapse.Panel forceRender header="OBSERVACI&Oacute;N" key="10" style={customPanelStyle}>
            <ObservacionSection
              disabledGeneral={!currentTask.tomado}
              form={form}
              currentTask={currentTask}
              userClaims={userClaims}
              dataSiniestro={dataSinister}
              esDevolver={esDevolver}
            />
          </Collapse.Panel>
          <Collapse.Panel header="BIT&Aacute;CORA" key="11" style={customPanelStyle}>
            <BitacoraSection />
          </Collapse.Panel>
        </Collapse>
        <Col style={{ textAlign: 'right' }}>
          {this.muestraBotonDevolver() && (
            <Button
              data-cy="boton_devolver_revisar_pago"
              disabled={!currentTask.tomado}
              // onClick={this.handleDevolver}
              onClick={() => this.tieneDocumentosCargados(BOTONES.DEVOLVER)}
            >
              Devolver
              <Icon type="rollback" />
            </Button>
          )}
          <Button /* onClick={this.redirectToTarget} */ onClick={() => this.tieneDocumentosCargados(BOTONES.CANCELAR)}>
            Cancelar
            <Icon type="close-circle" />
          </Button>
          <Button
            /* onClick={this.handleGuardar} */
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
            data-cy="boton_completar_revisar_pago"
            type="primary"
            // onClick={this.handleCompletar}
            onClick={() => this.tieneDocumentosCargados(BOTONES.COMPLETAR)}
            disabled={!currentTask.tomado}
          >
            Completar
            <Icon type="check-circle" />
          </Button>
        </Col>
      </Form>
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
  const currentTask = getCurrentTaskIdCase(state, Number(params.idCaso));
  const takeTask = getTakeTask(state);
  const datosInforme = obtenerDatoInforme(state);
  const ajustadores = getAdjusters(state);
  const motivos = obtenerMotivos(state);
  const { numSiniestro, idCaso } = params;
  const ideSinAX = getIdeSinAX(state);
  const numCertificado = getNumCertificado(state);
  const idePoliza = getIdePoliza(state);
  const shipmentNatures = getShipmentNatures(state);
  const closingReasons = getClosingReasons(state);
  const coaseguros = getCoaseguros(state);
  const reaseguros = getReaseguros(state);
  const branches = getRamos(state);
  const coveragesAdjusters = getCoveragesAdjusters(state);
  const idCargoBpm = getIdCargoBpm(state);
  return {
    numSiniestro,
    idCaso,
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
    tipoConfirmarGestion: getTipoConfirmarGestion(state),
    idCargoBpm,
    ajustadoresFromReport: getAjustadores(state)
  };
};

export default withRouter(connect(mapStateToProps)(Form.create({ name: 'revisar_pago' })(RevisarPago)));
