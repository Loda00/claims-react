import React from 'react';
import { connect } from 'react-redux';
import { Icon, Collapse, Button, Col, Form, Modal, notification, Spin } from 'antd';
import { withRouter } from 'react-router-dom';
import { capitalize, union } from 'lodash';
import TakeTask from 'scenes/TaskTray/components/TakeTaskButton/index';
import {
  showErrorMessage,
  showSuccessMessage,
  showFirstError,
  llamarServiciosAnalizarSiniestro,
  reinicioServiciosAnalizarSiniestro,
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
import SalvamentoRecupero from 'scenes/TaskTray/components/SectionSalvamentoRecupero';

/* ACTION CREATORS */
import * as taskActionCreators from 'scenes/TaskTray/data/task/actions';
import * as bitacoraActionCreator from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/action';
import * as uiActionCreators from 'services/ui/actions';
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
// import { getAdjusters } from 'scenes/TaskTray/components/SectionPayments/data/adjusters/reducer';
import { obtenerMotivos } from 'scenes/TaskTray/components/SectionDataReport/data/motivo/reducer';
import {
  CONSTANTS_APP,
  MENSAJES_TAREAS,
  BOTONES,
  MENSAJE_DOCUMENTOS_COMPLETAR,
  MENSAJE_DOCUMENTOS_GUARDAR
} from 'constants/index';
import { getIdCargoBpm } from 'services/users/reducer';
import { getAjustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/reducer';

import { creaRequestDesdeProps } from 'scenes/TaskTray/util';
/* CSS */
import './styles.css';

class AnalizeSinisterInfo extends React.Component {
  state = {
    activeKey: [],
    isLoading: false
  };

  async componentDidMount() {
    const {
      currentTask: { idTareaBitacora },
      numSiniestro,
      dispatch
    } = this.props;
    try {
      dispatch(uiActionCreators.switchLoader());
      await llamarServiciosAnalizarSiniestro(dispatch, numSiniestro, null, idTareaBitacora);
      this.setState({ activeKey: ['1'] });
      // resetFields();
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

    try {
      const {
        form: { validateFields }
      } = this.props;

      const lstCoasegurosReaseguros = this.getCoasegurosYReaseguros();
      await validateFields(lstCoasegurosReaseguros);
    } catch (e) {
      // showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
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

  getCoasegurosYReaseguros = () => {
    const {
      coaseguros,
      reaseguros,
      form: { getFieldValue }
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

    const validacionInicial = [];
    coaseguros.forEach(element => {
      validacionInicial.push(`coaseguro${element.idCoaseguro}`);
    });
    reasegurosFiltrados.forEach(element => {
      validacionInicial.push(`reaseguro${element.idReasegurador}`);
    });
    return validacionInicial;
  };

  completarSinisterConfirm = () => {
    const { dispatch, history } = this.props;
    const datosTarea = creaRequestDesdeProps('C', this.props);
    Modal.confirm({
      title: 'Desea continuar con la atención del siniestro ?.',
      okText: 'Si',
      cancelText: 'No',
      onOk: async () => {
        try {
          await dispatch(taskActionCreators.completarTarea(datosTarea));
          Modal.success({
            title: 'Completar Siniestro',
            content: 'El siniestro se complet\u00f3 exitosamente',
            onOk: () => {
              history.push('/tareas');
            }
          });
        } catch (error) {
          const { response: { status } = {} } = error;
          if (status === 504) {
            modalConfirmacionReintentar();
            return;
          }

          showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
        }
      }
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

  ErrorCorreosSegurosHandler = func => {
    this.mostrarErrorEmailSegurosHandler = func;
  };

  takeTask = async () => {
    const {
      numSiniestro,
      dispatch,
      userClaims,
      userClaims: { nombres, apePaterno },
      currentTask
    } = this.props;
    const username = `${capitalize(nombres)} ${capitalize(apePaterno)}`;

    try {
      await dispatch(taskActionCreators.takeTask(username, currentTask, userClaims));
      showSuccessMessage('Se tom\u00f3 la tarea con \u00e9xito');
      dispatch(bitacoraActionCreator.fecthBitacora(numSiniestro));
    } catch (e) {
      showErrorMessage(CONSTANTS_APP.GENERIC_ERROR_MESSAGE);
    }
  };

  onSubmit = async () => {
    const {
      form: { validateFieldsAndScroll, validateFields, getFieldsValue, getFieldValue },
      dataSinister: {
        ajustador: { indHabilitado }
      }
    } = this.props;

    const { codTipoSiniestro: codTipoSiniestroBack, indCargaMasiva } = getFieldValue('siniestro') || {};

    const tipoSiniestroForm = getFieldValue('tipoSiniestro');

    if (codTipoSiniestroBack === 'P' && tipoSiniestroForm === 'N') {
      Modal.warning({
        title: 'No puede realizar cambios',
        content: 'Debe guardar los cambios del siniestro convertido a normal',
        okText: 'Aceptar'
      });
      return;
    }

    const valoresFormulario = getFieldsValue();
    const lstCoasegurosReaseguros = this.getCoasegurosYReaseguros();

    const validarSecciones = ['pagos', 'dataRamosCoberturas', 'siniestro', 'documentos', 'poliza'];

    const validarCampos = Object.keys(valoresFormulario).filter(key => !validarSecciones.includes(key));

    const tieneReaseguros = lstCoasegurosReaseguros.some(element => element.startsWith('r'));
    try {
      if (tieneReaseguros) {
        await validateFields(['poliza']);
      }
    } catch (e) {
      const { errors: { poliza } = {} } = e;
      if (poliza) showFirstError(poliza);
      return;
    }

    try {
      validateFieldsAndScroll(validarCampos, { scroll: { offsetTop: 20 }, force: true }, async (error, values) => {
        if (!error) {
          validateFields(validarSecciones, { force: true }, err => {
            if (!err) {
              if (!values.ajustadorSeleccionado && indHabilitado === 'N' && indCargaMasiva !== 'COA') {
                Modal.error({
                  title: 'Error',
                  content: 'Ajustador no se encuentra activo, por favor reemplazar'
                });
              } else {
                this.completarSinisterConfirm(values);
              }
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
          const errorInputSeguros = [];
          const errores = Object.keys(error);
          errores.forEach(err => {
            // Validar si hay campos vacíos en Coaseguro y Reaseguro
            if (err.startsWith('coaseguro') || err.startsWith('reaseguro')) {
              if (err) {
                errorInputSeguros.push(err);
              }
            }
          });
          if (error.emailCorredorPoliza || errorInputSeguros.length > 0) {
            this.mostrarErrorEmailSegurosHandler();
            this.setState(
              prevState => {
                return {
                  ...prevState,
                  activeKey: union(prevState.activeKey, ['1'])
                };
              },
              () => {
                if (!error.emailCorredorPoliza && errorInputSeguros.length > 0) {
                  document.getElementById(`analyzeSinister_${errorInputSeguros[0]}`).focus();
                }
              }
            );
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
            error.reservaHonorarios ||
            error.incoterms ||
            error.codMotivoCierre
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
            error.nroPreferenciaAjustador ||
            error.ajustadorEncargado ||
            error.fechaCoordinacion ||
            error.fechaInspeccionInforme ||
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

  guardarTarea = async () => {
    const {
      dispatch,
      numSiniestro,
      currentTask: { idTareaBitacora },
      form: { setFields, getFieldValue, validateFieldsAndScroll, getFieldsValue, resetFields }
    } = this.props;
    const valoresFormulario = getFieldsValue();
    const valoresTipoCadena = [];
    Object.keys(valoresFormulario).forEach(valorFormulario => {
      if (typeof getFieldValue(valorFormulario) === 'string') {
        if (getFieldValue(valorFormulario).length > 0) {
          valoresTipoCadena.push(valorFormulario);
        }
      }
    });

    try {
      validateFieldsAndScroll(valoresTipoCadena, async error => {
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
          if (params.siniestro.tipoSiniestroAnt === 'P' && params.siniestro.tipoSiniestro === 'N') {
            setFields({
              tipoSiniestro: { value: undefined, errors: [] }
            });
          }
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
    this.setState({
      activeKey: key
    });
  };

  redirectToTarget = () => {
    const { history } = this.props;
    history.push('/tareas');
  };

  redirectToPath = path => {
    const { history } = this.props;
    history.push(path);
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
            <Collapse.Panel header="DATOS P&Oacute;LIZA" key="1" style={customPanelStyle} forceRender>
              <DataPolizaSections
                getCoasegurosYReaseguros={this.getCoasegurosYReaseguros}
                form={form}
                disabledGeneral={!currentTask.tomado}
                userClaims={userClaims}
                idCurrentTask={idTarea}
                dataPoliza={dataPoliza.poliza[0]}
                currentTask={currentTask}
                numSiniestro={numSiniestro}
                ErrorCorreosSegurosHandler={this.ErrorCorreosSegurosHandler}
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
                dataSiniestro={dataSinister}
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
            <Collapse.Panel forceRender header="OBSERVACI&Oacute;N" key="10" style={customPanelStyle}>
              <ObservacionSection
                disabledGeneral={!currentTask.tomado}
                form={form}
                dataSiniestro={dataSinister}
                currentTask={currentTask}
                userClaims={userClaims}
                tarea={currentTask}
              />
            </Collapse.Panel>
            <Collapse.Panel header="BIT&Aacute;CORA" key="11" style={customPanelStyle}>
              <BitacoraSection />
            </Collapse.Panel>
            {currentTask.idTarea === null && (
              <Collapse.Panel header="RECUPERO Y SALVAMENTO" key="12" style={customPanelStyle}>
                <SalvamentoRecupero numSiniestro={numSiniestro} />
              </Collapse.Panel>
            )}
          </Collapse>
          <Col style={{ textAlign: 'right' }}>
            <Button onClick={this.redirectToTarget}>
              Cancelar
              <Icon type="close-circle" />
            </Button>
            <Button
              onClick={this.guardarTarea}
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
            <Button type="primary" onClick={this.onSubmit} disabled={!currentTask.tomado}>
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
  const datosInforme = obtenerDatoInforme(state); // datosInforme
  const ajustadores = getAjustadores(state);
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

const FormAnalizar = Form.create({ name: 'analyzeSinister' })(AnalizeSinisterInfo);

export { FormAnalizar };

export default withRouter(connect(mapStateToProps)(FormAnalizar));
