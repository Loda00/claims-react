import React from 'react';
import { connect } from 'react-redux';
import { Icon, Collapse, Button, Col, Form, Spin, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import ReasignarModal from 'scenes/Query/Component/ConsultarSiniestro/components/reasignarModal/index';
import { ESTADOS_SINIESTRO, ESTADO_SINIESTRO } from 'constants/index';

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
import SalvamentoRecupero from 'scenes/TaskTray/components/SectionSalvamentoRecupero';

/* ACTION CREATORS */
import { llamarServiciosAnalizarSiniestro, reinicioServiciosAnalizarSiniestro, esUsuarioEjecutivo } from 'util/index';

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
import { getLstIncoterms } from 'scenes/TaskTray/components/SectionDataSinister/data/incoterms/reducer';
import { getShipmentNatures } from 'scenes/TaskTray/components/SectionDataSinister/data/shipmentNatures/reducer';
import { getClosingReasons } from 'scenes/TaskTray/components/SectionDataSinister/data/closingReasons/reducer';
import { obtenerDatoInforme } from 'scenes/TaskTray/components/SectionDataReport/data/datosInforme/reducer';
import { getAdjusters } from 'scenes/TaskTray/components/SectionPayments/data/adjusters/reducer';
import { obtenerMotivos } from 'scenes/TaskTray/components/SectionDataReport/data/motivo/reducer';

/* CSS */
import './styles.css';

class ConsultaSiniestro extends React.Component {
  state = {
    activeKey: ['12'],
    isLoading: false,
    mostrarModalReasignar: false,
    disabledTodoModal: false
  };

  async componentDidMount() {
    const {
      numSiniestro,
      dispatch,
      form: { resetFields },
      idTareaBitacora
    } = this.props;

    this.setState({
      isLoading: true
    });
    try {
      await llamarServiciosAnalizarSiniestro(dispatch, numSiniestro, undefined, idTareaBitacora);
      resetFields();
    } catch (err) {
      const { history } = this.props;

      let msg = 'Ocurrió un error al obtener datos. Por favor vuelva a intentar.';
      if (err === 'CRG-204') {
        msg = 'EL siniestro no existe.';
      }
      Modal.error({
        title: msg,
        onOk() {
          history.push('/');
        }
      });
    } finally {
      this.setState({ isLoading: false, activeKey: ['1'] });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    reinicioServiciosAnalizarSiniestro(dispatch);
  }

  selectSection = key => {
    this.setState({
      activeKey: key
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;
    history.push(`/`);
  };

  encargarseReasignar = () => {
    this.setState({
      mostrarModalReasignar: true
    });
  };

  cambiarEstadoModal = ocultarModal => {
    this.setState({
      mostrarModalReasignar: ocultarModal,
      disabledTodoModal: false
    });
  };

  disabledTodoReasignar = disabledCampos => {
    this.setState({
      disabledTodoModal: disabledCampos
    });
  };

  render() {
    const {
      form,
      datosInforme,
      ajustadores,
      dataSinister,
      dataSinister: { codEstadoSiniestro, nombresEjecutivo },
      motivos,
      numSiniestro,
      userClaims,
      takeTask,
      dataCertificate,
      incoterms,
      shipmentNatures,
      closingReasons,
      coveragesAdjusters,
      payments,
      coordenadas,
      showScroll,
      dataPoliza
    } = this.props;

    const { mostrarModalReasignar, disabledTodoModal } = this.state;

    const currentTask = {
      idTarea: undefined,
      obsTareaBitacora: ''
    };

    const { isLoading, activeKey, alinearBotonAgregarEmbarque } = this.state;

    const customPanelStyle = {
      background: '#FFFF',
      borderRadius: 4,
      marginBottom: 0,
      border: 0,
      overflow: 'hidden'
    };

    const anuladoCerrado =
      codEstadoSiniestro === ESTADOS_SINIESTRO.ANULADO || codEstadoSiniestro === ESTADOS_SINIESTRO.CERRADO;
    const tieneEjecutivo = nombresEjecutivo === '';

    const esEjecutivo = esUsuarioEjecutivo(userClaims);

    const {
      PENDIENTE_COMPLETAR_DATOS,
      DATOS_COMPLETADOS,
      PENDIENTE_COMPLETAR_SUSTENTO,
      DOCUMENTO_SUSTENTO_COMPLETADO,
      REGISTRADO,
      PENDIENTE_REGISTRAR_SINIESTRO_EN_EL_CORE,
      SINIESTRO_REGISTRADO_EN_EL_CORE,
      MONTO_ACTUALIZADO_EN_EL_CORE,
      PENDIENTE_ACTUALIZAR_MONTO_EN_EL_CORE
    } = ESTADO_SINIESTRO;

    return (
      <Spin spinning={isLoading}>
        <Form>
          <h1>CONSULTA SINIESTRO</h1>
          <h3> N&uacute;mero de caso: {numSiniestro}</h3>

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
                disabledGeneral
                userClaims={userClaims}
                idCurrentTask={currentTask}
                dataPoliza={dataPoliza.poliza[0]}
                redirectToHome={this.redirectToTarget}
                currentTask={currentTask}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DEL CERTIFICADO" key="2" style={customPanelStyle}>
              <DataCertificateSections
                form={form}
                userClaims={userClaims}
                idCurrentTask={2}
                disabledGeneral
                currentTask={currentTask}
                dataCertificado={dataCertificate.certificate[0]}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DEL SINIESTRO" key="3" forceRender style={customPanelStyle}>
              <DataSinisterSections
                form={form}
                userClaims={userClaims}
                currentTask={currentTask}
                disabledGeneral
                alinearBotonAgregarEmbarque={alinearBotonAgregarEmbarque}
                dataSiniestro={dataSinister}
                numSiniestro={numSiniestro}
                incoterms={incoterms}
                shipmentNatures={shipmentNatures}
                closingReasons={closingReasons}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DE LA COBERTURA" forceRender key="4" style={customPanelStyle}>
              <DataCoberturaSection
                form={form}
                coveragesAdjusters={coveragesAdjusters}
                disabledGeneral
                currentTask={currentTask}
                numSiniestro={numSiniestro}
              />
            </Collapse.Panel>
            {!(
              PENDIENTE_COMPLETAR_DATOS === codEstadoSiniestro ||
              DATOS_COMPLETADOS === codEstadoSiniestro ||
              PENDIENTE_COMPLETAR_SUSTENTO === codEstadoSiniestro ||
              DOCUMENTO_SUSTENTO_COMPLETADO === codEstadoSiniestro ||
              REGISTRADO === codEstadoSiniestro ||
              PENDIENTE_REGISTRAR_SINIESTRO_EN_EL_CORE === codEstadoSiniestro ||
              SINIESTRO_REGISTRADO_EN_EL_CORE === codEstadoSiniestro ||
              PENDIENTE_ACTUALIZAR_MONTO_EN_EL_CORE === codEstadoSiniestro ||
              MONTO_ACTUALIZADO_EN_EL_CORE === codEstadoSiniestro
            ) && (
              <Collapse.Panel header="DATOS DEL INFORME" key="5" forceRender style={customPanelStyle}>
                <DataReportSections
                  form={form}
                  disabledGeneral
                  DataReportMethodsHandler={this.DataReportMethodsHandler}
                  data={datosInforme}
                  ajustadores={ajustadores.adjusters}
                  siniestro={dataSinister}
                  motivos={motivos}
                  tarea={currentTask}
                />
              </Collapse.Panel>
            )}
            <Collapse.Panel header="DOCUMENTOS DEL SINIESTRO" key="6" style={customPanelStyle}>
              <DocumentSinisterSections disabledGeneral numSiniestro={numSiniestro} />
            </Collapse.Panel>
            <Collapse.Panel header="CARGA DE DOCUMENTOS" key="7" style={customPanelStyle}>
              <SectionCargarDocumento form={form} disabledGeneral showScroll={showScroll} currentTask={currentTask} />
            </Collapse.Panel>
            {!(
              PENDIENTE_COMPLETAR_DATOS === codEstadoSiniestro ||
              DATOS_COMPLETADOS === codEstadoSiniestro ||
              PENDIENTE_REGISTRAR_SINIESTRO_EN_EL_CORE === codEstadoSiniestro ||
              REGISTRADO === codEstadoSiniestro
            ) && (
              <Collapse.Panel header="HISTORIAL DE MODIFICACI&Oacute;N DE RESERVA" key="8" style={customPanelStyle}>
                <HistoryChangeDocumentSection />
              </Collapse.Panel>
            )}
            {!(
              PENDIENTE_COMPLETAR_DATOS === codEstadoSiniestro ||
              DATOS_COMPLETADOS === codEstadoSiniestro ||
              PENDIENTE_COMPLETAR_SUSTENTO === codEstadoSiniestro ||
              DOCUMENTO_SUSTENTO_COMPLETADO === codEstadoSiniestro ||
              REGISTRADO === codEstadoSiniestro ||
              PENDIENTE_REGISTRAR_SINIESTRO_EN_EL_CORE === codEstadoSiniestro ||
              SINIESTRO_REGISTRADO_EN_EL_CORE === codEstadoSiniestro ||
              PENDIENTE_ACTUALIZAR_MONTO_EN_EL_CORE === codEstadoSiniestro ||
              MONTO_ACTUALIZADO_EN_EL_CORE === codEstadoSiniestro
            ) && (
              <Collapse.Panel forceRender header="REGISTRO DE PAGOS" key="9" style={customPanelStyle}>
                <PaymentSection
                  analizarForm={form}
                  payments={payments}
                  coordenadas={coordenadas}
                  numSiniestro={numSiniestro}
                  currentTask={currentTask}
                  disabledGeneral
                  showScroll={showScroll}
                />
              </Collapse.Panel>
            )}
            <Collapse.Panel header="BIT&Aacute;CORA" key="11" style={customPanelStyle}>
              <BitacoraSection />
            </Collapse.Panel>
            <Collapse.Panel header="RECUPERO Y SALVAMENTO" key="12" style={customPanelStyle}>
              <SalvamentoRecupero numSiniestro={numSiniestro} />
            </Collapse.Panel>
          </Collapse>
          <Col
            style={{
              textAlign: 'right'
            }}
          >
            <Button
              onClick={this.redirectToTarget}
              style={{
                margin: esEjecutivo ? '15px' : '10px 0px'
              }}
            >
              Cancelar
              <Icon type="close-circle" />
            </Button>
            {esEjecutivo && (
              <Button type="primary" onClick={this.encargarseReasignar} disabled={anuladoCerrado || tieneEjecutivo}>
                Reasignar
                <Icon type="rollback" />
              </Button>
            )}
          </Col>
        </Form>
        {mostrarModalReasignar && (
          <ReasignarModal
            mostrarModalReasignar={mostrarModalReasignar}
            disabledTodoModal={disabledTodoModal}
            dataSinister={dataSinister}
            numSiniestro={numSiniestro}
            cambiarEstadoModal={this.cambiarEstadoModal}
            redirectToTarget={this.redirectToTarget}
            disabledTodoReasignar={this.disabledTodoReasignar}
          />
        )}
      </Spin>
    );
  }
}

const mapStateToProps = (state, { match }) => ({
  numSiniestro: match.params.numSiniestro,
  idCaso: match.params.idCaso,
  currentTask: getCurrentTaskIdCase(state, Number(match.params.idCaso)),
  takeTask: getTakeTask(state),
  payments: getPayments(state),
  coordenadas: getCoordenadas(state),
  dataPoliza: getDataPoliza(state),
  dataCertificate: getDataCertificate(state),
  dataSinister: getDataSinister(state),
  userClaims: state.services.user.userClaims,
  showScroll: state.services.device.scrollActivated,
  ideSinAX: getIdeSinAX(state),
  numCertificado: getNumCertificado(state),
  idePoliza: getIdePoliza(state),
  incoterms: getLstIncoterms(state),
  shipmentNatures: getShipmentNatures(state),
  closingReasons: getClosingReasons(state),
  coveragesAdjusters: getCoveragesAdjusters(state),
  datosInforme: obtenerDatoInforme(state),
  ajustadores: getAdjusters(state),
  motivos: obtenerMotivos(state),
  coaseguros: getCoaseguros(state),
  reaseguros: getReaseguros(state),
  branches: getRamos(state)
});

export default withRouter(connect(mapStateToProps)(Form.create({ name: 'consultarSiniestro' })(ConsultaSiniestro)));
