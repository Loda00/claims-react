import React from 'react';
import { connect } from 'react-redux';
import { Icon, Collapse, Button, Col, Form, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { capitalize } from 'lodash';
import TakeTask from 'scenes/TaskTray/components/TakeTaskButton/index';
import {
  showErrorMessage,
  showSuccessMessage,
  llamarServiciosAnalizarSiniestro,
  reinicioServiciosAnalizarSiniestro,
  modalConfirmacionCompletarTarea,
  showFirstError,
  modalConfirmacionReintentar,
  modalDocumentoCompletar
} from 'util/index';

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
import * as uiActionCreators from 'services/ui/actions';
import * as taskActionCreators from 'scenes/TaskTray/data/task/actions';

/* REDUCERS */
import { getCoordenadas } from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Coordenadas/data/coordenadas/reducer';
import { getPayments } from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';
import { getCurrentTask } from 'scenes/TaskTray/scenes/TaskTrayHome/data/taskTable/reducer';
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
import { MENSAJES_TAREAS, BOTONES, MENSAJE_DOCUMENTOS_COMPLETAR, MENSAJE_DOCUMENTOS_GUARDAR } from 'constants/index';
import { getIdCargoBpm } from 'services/users/reducer';
import { getAjustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/reducer';

import { creaRequestDesdeProps } from 'scenes/TaskTray/util';
/* CSS */
import './styles.css';

class AdjuntarCargoRechazo extends React.Component {
  state = {
    activeKey: []
  };

  async componentDidMount() {
    const {
      numSiniestro,
      dispatch,
      idCaso,
      currentTask: { idTareaBitacora }
    } = this.props;
    try {
      dispatch(uiActionCreators.switchLoader());
      await llamarServiciosAnalizarSiniestro(dispatch, numSiniestro, Number(idCaso), idTareaBitacora);
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

  componentWillUnmount() {
    const { dispatch } = this.props;
    reinicioServiciosAnalizarSiniestro(dispatch);
  }

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

  selectSection = key => {
    // eslint-disable-next-line
    this.setState({
      activeKey: key
    });
  };

  redirectToPath = path => {
    const { history } = this.props;
    history.push(path);
  };

  handleCompletar = () => {
    const {
      form: { validateFields }
    } = this.props;

    validateFields({ force: true }, errors => {
      if (!errors) {
        modalConfirmacionCompletarTarea(() => this.handleConfirmar());
      } else {
        // muestra validaciones genericas a nivel de seccion(es)
        // que se muestran en modal
        const { documentos } = errors;
        if (documentos) showFirstError(documentos);
      }
    });
  };

  handleConfirmar = async () => {
    const { dispatch, tipoConfirmarGestion } = this.props;

    const params = {
      tipoConfirmarGestion,
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

  redireccionBandeja = () => {
    const { history } = this.props;
    history.push('/tareas');
  };

  handleGuardar = async () => {
    const {
      dispatch,
      numSiniestro,
      form: { resetFields },
      currentTask: { idTareaBitacora },
      idCaso
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
      reinicioServiciosAnalizarSiniestro(dispatch);
      await llamarServiciosAnalizarSiniestro(dispatch, numSiniestro, Number(idCaso), idTareaBitacora);
      resetFields();
    } catch (e) {
      showErrorMessage(MENSAJES_TAREAS.ERROR_CARGA_DESPUES_GUARDAR);
      return;
    } finally {
      dispatch(uiActionCreators.switchLoader());
    }

    showSuccessMessage(MENSAJES_TAREAS.EXITO_GUARDAR);
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
            this.handleGuardar();
          } else {
            this.redireccionBandeja();
          }
        },
        onCancel: () => {}
      });
    } else if (event === BOTONES.CANCELAR) {
      this.redireccionBandeja();
    } else if (event === BOTONES.GUARDAR) {
      this.handleGuardar();
    } else if (event === BOTONES.COMPLETAR) {
      this.handleCompletar();
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
      // user,
      numSiniestro,
      userClaims,
      takeTask,
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

    const { activeKey, alinearBotonAgregarEmbarque } = this.state;
    const customPanelStyle = {
      background: '#FFFF',
      borderRadius: 4,
      marginBottom: 0,
      border: 0,
      overflow: 'hidden'
    };

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
          <Collapse.Panel header="DATOS P&Oacute;LIZA" key="1" style={customPanelStyle} forceRender>
            <DataPolizaSections
              form={form}
              disabledGeneral={!currentTask.tomado}
              userClaims={userClaims}
              idCurrentTask={idTarea}
              dataPoliza={dataPoliza.poliza[0]}
              currentTask={currentTask}
              numSiniestro={numSiniestro}
              redirectToPath={this.redirectToPath}
            />
          </Collapse.Panel>
          <Collapse.Panel header="DATOS DEL CERTIFICADO" key="2" style={customPanelStyle}>
            <DataCertificateSections
              form={form}
              userClaims={userClaims}
              currentTask={currentTask}
              idCurrentTask={currentTask.idTarea}
              numSiniestro={numSiniestro}
              disabledGeneral={!currentTask.tomado}
              DataCertificateMethodsHandler={this.DataCertificateMethodsHandler}
              dataCertificado={dataCertificate.certificate[0]}
            />
          </Collapse.Panel>
          <Collapse.Panel header="DATOS DEL SINIESTRO" forceRender key="3" style={customPanelStyle}>
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
            />
          </Collapse.Panel>
          <Collapse.Panel forceRender header="DATOS DEL INFORME" key="5" style={customPanelStyle}>
            <DataReportSections
              form={form}
              disabledGeneral={!currentTask.tomado}
              data={datosInforme}
              ajustadores={ajustadores.adjusters}
              siniestro={dataSinister}
              motivos={motivos}
              tarea={currentTask}
            />
          </Collapse.Panel>
          <Collapse.Panel forceRender header="DOCUMENTOS DEL SINIESTRO" key="6" style={customPanelStyle}>
            <DocumentSinisterSections
              disabledGeneral={!currentTask.tomado}
              numSiniestro={numSiniestro}
              currentTask={currentTask}
            />
          </Collapse.Panel>
          <Collapse.Panel forceRender header="CARGA DE DOCUMENTOS" key="7" style={customPanelStyle}>
            <SectionCargarDocumento
              form={form}
              disabledGeneral={!currentTask.tomado}
              currentTask={currentTask}
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
            />
          </Collapse.Panel>
          <Collapse.Panel header="OBSERVACI&Oacute;N" key="10" style={customPanelStyle}>
            <ObservacionSection
              disabledGeneral={!currentTask.tomado}
              form={form}
              dataSiniestro={dataSinister}
              tareaTomada={takeTask}
              currentTask={currentTask}
              userClaims={userClaims}
              tarea={currentTask}
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
            type="primary"
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
  const currentTask = getCurrentTask(state, ownProps.match);
  const takeTask = getTakeTask(state);
  const datosInforme = obtenerDatoInforme(state); // datosInforme
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
    idCargoBpm,
    idCaso,
    ajustadoresFromReport: getAjustadores(state)
  };
};

export default withRouter(
  connect(mapStateToProps)(Form.create({ name: 'adjuntar_cargo_rechazo' })(AdjuntarCargoRechazo))
);
