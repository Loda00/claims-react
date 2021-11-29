import React from 'react';
import { connect } from 'react-redux';
import { Icon, Collapse, Button, Col, Form, Modal, notification, Spin } from 'antd';
import { withRouter } from 'react-router-dom';
import { capitalize, union } from 'lodash';
import TakeTask from 'scenes/TaskTray/components/TakeTaskButton';
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
  TAREAS,
  BOTONES,
  MENSAJE_DOCUMENTOS_COMPLETAR,
  MENSAJE_DOCUMENTOS_GUARDAR
} from 'constants/index';
import { getIdCargoBpm } from 'services/users/reducer';
import { getAjustadores } from 'scenes/TaskTray/components/SectionDataReport/data/ajustadores/reducer';

import { creaRequestDesdeProps } from 'scenes/TaskTray/util';
/* CSS */
import './styles.css';

class RevisarInformeBasico extends React.Component {
  state = {
    activeKey: [],
    isLoading: false,
    esDevolver: false
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
      // resetFields();
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

    try {
      const {
        form: { validateFields }
      } = this.props;

      const lstCoasegurosReaseguros = this.getCoasegurosYReaseguros();
      await validateFields(lstCoasegurosReaseguros);
    } catch (e) {
      //
    }
  }

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

  redireccionBandeja = () => {
    const { history } = this.props;
    history.push('/tareas');
  };

  handleConfirmar = async esDevolver => {
    const { dispatch } = this.props;
    const params = {
      flagAprobacion: esDevolver ? 'N' : 'S',
      ...creaRequestDesdeProps('C', this.props)
    };
    try {
      const respCompletar = await dispatch(taskActionCreators.completarTarea(params));
      // Si al cerrar siniesro  hay tareas o pagos en estado pendientes pendientes, o
      // error en la validación de cobertura, mostrar un Modal con el error.
      if (respCompletar.code === 'CRG-599') {
        Modal.error({
          title: respCompletar.message.split('.')[0] || '',
          content: `${respCompletar.message.split('.')[1]}.` || ''
        });
        return;
      }

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

  completarSinisterConfirm = () => {
    const { esDevolver } = this.state;
    modalConfirmacionCompletarTarea(() => this.handleConfirmar(esDevolver));
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

  completarTarea = async () => {
    const {
      form: { validateFieldsAndScroll, validateFields, getFieldsValue },
      currentTask: { idTarea },
      dataSinister: {
        ajustador: { indHabilitado }
      }
    } = this.props;

    const { esDevolver } = this.state;
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
      validateFieldsAndScroll(validarCampos, { scroll: { offsetTop: 20 }, force: true }, (error, values) => {
        if (
          esDevolver &&
          (idTarea === TAREAS.REVISAR_INFORME || idTarea === TAREAS.REVISAR_INFORME_BASICO) &&
          values.nuevoAjustador === 'S'
        ) {
          Modal.warning({
            title: 'No puede devolver',
            content: (
              <div>
                <p>Está solicitando un nuevo Ajustador, no puede devolver el informe.</p>
              </div>
            )
          });
        } else if (!error) {
          validateFields(validarSecciones, { force: true }, (err, val) => {
            if (!err) {
              if (!values.ajustadorSeleccionado && indHabilitado === 'N') {
                Modal.error({
                  title: 'Error',
                  content: 'Ajustador no se encuentra activo, por favor reemplazar'
                });
              } else {
                this.completarSinisterConfirm(values);
              }
            } else {
              const { pagos, dataRamosCoberturas, siniestro, documentos, poliza } = err;
              if (poliza) showFirstError(poliza);
              else if (pagos) showFirstError(pagos);
              else if (dataRamosCoberturas) showFirstError(dataRamosCoberturas);
              else if (siniestro) showFirstError(siniestro);
              else if (documentos) showFirstError(documentos);
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
                  document.getElementById(`analizarInformeBasico_${errorInputSeguros[0]}`).focus();
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
        this.setState({
          esDevolver: false
        });
      });
    } catch (err) {
      const { errors: { poliza } = {} } = err;
      if (poliza) showFirstError(poliza);
    }
  };

  ErrorCorreosSegurosHandler = func => {
    this.mostrarErrorEmailSegurosHandler = func;
  };

  saveAnalizarSiniestro = async () => {
    this.setState({
      isLoading: true
    });

    const {
      dispatch,
      numSiniestro,
      currentTask: { idTareaBitacora },
      form: { getFieldValue, validateFieldsAndScroll, getFieldsValue, resetFields }
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
          try {
            const request = creaRequestDesdeProps('G', this.props);
            await dispatch(taskActionCreators.guardarSiniestro(request));
          } catch (err) {
            showErrorMessage(String('Ocurrió un error al guardar la tarea'));
            return;
          }
          await reinicioServiciosAnalizarSiniestro(dispatch);

          try {
            dispatch(uiActionCreators.switchLoader());
            await llamarServiciosAnalizarSiniestro(dispatch, numSiniestro, null, idTareaBitacora);
          } catch (err) {
            showErrorMessage(String('Ocurrió un error al guardar la tarea'));
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
    } finally {
      this.setState({
        isLoading: false
      });
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

  handleDevolver = () => {
    try {
      this.setState(
        {
          esDevolver: true
        },
        () => this.completarTarea()
      );
    } catch (err) {
      showErrorMessage(String(err));
    }
  };

  handleAprobar = () => {
    try {
      this.setState(
        {
          esDevolver: false
        },
        () => this.completarTarea()
      );
    } catch (err) {
      showErrorMessage(String(err));
    }
  };

  tieneDocumentosCargados = event => {
    const {
      form: { getFieldValue }
    } = this.props;
    const { listaDocumentos } = getFieldValue('documentos') || {};
    const tieneDocumentos = listaDocumentos ? listaDocumentos.length >= 1 : false;
    const totalDocumentos = listaDocumentos ? listaDocumentos.length : 0;
    if (tieneDocumentos && (event === BOTONES.APROBAR || event === BOTONES.DEVOLVER)) {
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
            this.saveAnalizarSiniestro();
          } else {
            this.redirectToTarget();
          }
        },
        onCancel: () => {}
      });
    } else if (event === BOTONES.DEVOLVER) {
      this.handleDevolver();
    } else if (event === BOTONES.CANCELAR) {
      this.redirectToTarget();
    } else if (event === BOTONES.GUARDAR) {
      this.saveAnalizarSiniestro();
    } else if (event === BOTONES.APROBAR) {
      this.handleAprobar();
    }
  };

  render() {
    const {
      form,
      form: { getFieldValue },
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

    const { isLoading, activeKey, alinearBotonAgregarEmbarque, esDevolver } = this.state;
    const customPanelStyle = {
      background: '#FFFF',
      borderRadius: 4,
      marginBottom: 0,
      border: 0,
      overflow: 'hidden'
    };

    const seCierraSiniestro = getFieldValue('indCerrarSiniestro');

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
                ErrorCorreosSegurosHandler={this.ErrorCorreosSegurosHandler}
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
                esDevolver={esDevolver}
                userClaims={userClaims}
                currentTask={currentTask}
                numSiniestro={numSiniestro}
                dataSiniestro={dataSinister}
                closingReasons={closingReasons}
                shipmentNatures={shipmentNatures}
                disabledGeneral={!currentTask.tomado}
                DataSinisterMethodsHandler={this.DataSinisterMethodsHandler}
                alinearBotonAgregarEmbarque={alinearBotonAgregarEmbarque}
              />
            </Collapse.Panel>
            <Collapse.Panel header="DATOS DE LA COBERTURA" forceRender key="4" style={customPanelStyle}>
              <DataCoberturaSection
                esDevolver={esDevolver}
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
                esDevolver={esDevolver}
              />
            </Collapse.Panel>
            <Collapse.Panel header="HISTORIAL DE MODIFICACI&Oacute;N DE RESERVA" key="8" style={customPanelStyle}>
              <HistoryChangeDocumentSection />
            </Collapse.Panel>
            <Collapse.Panel forceRender header="REGISTRO DE PAGOS" key="9" style={customPanelStyle}>
              <PaymentSection
                analizarForm={form}
                esDevolver={esDevolver}
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
                esDevolver={esDevolver}
              />
            </Collapse.Panel>
            <Collapse.Panel header="BIT&Aacute;CORA" key="11" style={customPanelStyle}>
              <BitacoraSection />
            </Collapse.Panel>
          </Collapse>
          <Col style={{ textAlign: 'right' }}>
            <Button
              data-cy="boton_devolver_revisar_informe"
              disabled={!currentTask.tomado || seCierraSiniestro}
              onClick={() => this.tieneDocumentosCargados(BOTONES.DEVOLVER)}
            >
              Devolver
              <Icon type="rollback" />
            </Button>
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
              data-cy="boton_aprobar_revisar_informe"
              type="primary"
              onClick={() => this.tieneDocumentosCargados(BOTONES.APROBAR)}
              disabled={!currentTask.tomado}
            >
              Aprobar
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

const FormAnalizar = Form.create({ name: 'analizarInformeBasico' })(RevisarInformeBasico);
export { FormAnalizar };
export default withRouter(connect(mapStateToProps)(FormAnalizar));
