/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-unused-state */
import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Form, Col, Icon, Button, Row, Card, Modal, message } from 'antd';
import { getListRecovered } from 'scenes/Query/Component/CargarRecuperoForm/data/listRecovered/reducer';
import { getSaveRecovered } from 'scenes/Query/Component/CargarRecuperoForm/data/saveRecovered/reducer';
import { getSaveDocument } from 'scenes/data/documento/reducer';
import { CONSTANTS_APP, VALORES_CONSULTA } from 'constants/index';
import { showErrorMessage } from 'util/index';
import { getParamGeneral } from 'services/types/reducer';
import { getDocuments } from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/reducer';
import CargarRecuperoTable from 'scenes/Query/Component/CargarRecuperoForm/components/CargarRecuperoTable/index';
import AddRecuperoModal from 'scenes/Query/Component/CargarRecuperoForm/components/AddRecuperoModal/index';
import CargarDocumentoTabla from 'scenes/components/SectionCargarDocumento';
import DocumentosRecupero from 'scenes/Query/Component/CargarRecuperoForm/components/documentosRecupero';
import * as listRecoveredCreators from 'scenes/Query/Component/CargarRecuperoForm/data/listRecovered/action';
import * as saveRecoveredCreators from 'scenes/Query/Component/CargarRecuperoForm/data/saveRecovered/action';
import * as saveDocumentoCreators from 'scenes/data/documento/action';
import * as documentSinisterCreator from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/action';

class CargarRecuperoForm extends React.Component {
  state = {
    datosRecuperoState: [],
    addRecuperoDisabled: false,
    modalVisible: false,
    guardarDisabled: true,
    ubicacionPantalla: 'recupero',
    lentghTabla: false,
    guardarGeneralDisabled: false,
    tipoDocumentoState: true
  };

  async componentDidMount() {
    const {
      match: { params }
    } = this.props;
    let numSiniestro = params.numSiniestro;
    const subTipoDoc = null;

    const RG = this.props.numSiniestro;
    const promises = [];
    promises.push(this.props.dispatch(listRecoveredCreators.fetchListRecovered(RG)));
    promises.push(this.props.dispatch(documentSinisterCreator.fetchDocuments(numSiniestro, subTipoDoc)));

    try {
      await Promise.all(promises);
      this.datosRecuperoDelModal(this.props.listRecovered.listRecovered);
      let length = this.props.listRecovered.listRecovered.length;
      let ultimoDesisitido =
        this.props.listRecovered.listRecovered.length > 0
          ? this.props.listRecovered.listRecovered[length - 1].recuperoDesistido
          : 'No hay data';

      if (ultimoDesisitido === 'S') {
        this.setState({
          addRecuperoDisabled: true
        });
      } else {
        this.setState({
          addRecuperoDisabled: false
        });
      }
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(listRecoveredCreators.fetchListRecoveredReset());
    this.props.dispatch(saveRecoveredCreators.fetchSaveRecoveredReset());
    this.props.dispatch(saveDocumentoCreators.fetchSaveDocumentReset());
  }

  datosRecuperoDelModal = nuevosRecuperos => {
    this.setState({
      datosRecuperoState: nuevosRecuperos
    });
  };

  datosRecuperoDisabled = recuperoTable => {
    const {
      form: { getFieldValue }
    } = this.props;

    let lengthLocal = recuperoTable.length > 0;
    let valorAccion = lengthLocal ? recuperoTable[0].accion !== 'x' : false;

    const documentos = getFieldValue('documentos') || [];

    let noTieneDocumento = documentos.listaDocumentos ? documentos.listaDocumentos.length === 0 : true;

    if (!noTieneDocumento) {
      this.setState({
        lentghTabla: false
      });
    }

    if (lengthLocal && valorAccion) {
      if (recuperoTable[0].recuperoDesistido === 'SI' || recuperoTable[0].recuperoDesistido === 'S') {
        this.setState({
          guardarDisabled: false,
          guardarGeneralDisabled: true,
          tipoDocumentoState: false,
          addRecuperoDisabled: true,
          lentghTabla: true
        });

        if (noTieneDocumento) {
          this.setState({
            tipoDocumentoState: false
          });
        } else {
          this.setState({
            tipoDocumentoState: true
          });
        }

        return;
      }

      if (noTieneDocumento) {
        this.setState({
          tipoDocumentoState: false
        });
      } else {
        this.setState({
          tipoDocumentoState: true
        });
      }

      this.setState({
        lentghTabla: true,
        addRecuperoDisabled: true
      });
    } else {
      this.setState({
        addRecuperoDisabled: false,
        guardarDisabled: true,
        guardarGeneralDisabled: false,
        tipoDocumentoState: true
      });
    }
  };

  saveRecoveredButton = async () => {
    const { datosRecuperoState } = this.state;

    const {
      form: { resetFields }
    } = this.props;

    const rolUsuario = this.props.userClaims.codTipo;
    let numSiniestro = this.props.numSiniestro;
    let recuperosNuevos = datosRecuperoState.filter(item => item.accion === 'n');

    let recupero = recuperosNuevos.map((itemRecupero, index) => {
      return {
        fechaIngreso: itemRecupero.fechaRecupero
          ? moment(itemRecupero.fechaRecupero).format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB)
          : '',
        demandado: itemRecupero.demandado ? itemRecupero.demandado : '',
        documento: itemRecupero.docDemandado ? itemRecupero.docDemandado : '',
        monto: itemRecupero.montoDolares ? parseInt(itemRecupero.montoDolares) : '',
        numroLiquidacion: itemRecupero.numeroLiquidacion ? parseInt(itemRecupero.numeroLiquidacion) : '',
        estudioJuridico: itemRecupero.estadoJuridico ? itemRecupero.estadoJuridico : '',
        ejecutivoLegal: itemRecupero.ejecutivoLegal ? itemRecupero.ejecutivoLegal : '',
        desisitido: itemRecupero.recuperoDesistido === 'NO' || itemRecupero.recuperoDesistido === 'N' ? 'N' : 'S',
        observacion: itemRecupero.observacion ? itemRecupero.observacion : ''
      };
    });

    if (recuperosNuevos.length > 0) {
      const responseRecupero = await this.props
        .dispatch(saveRecoveredCreators.fetchSaveRecovered(numSiniestro, recupero, rolUsuario))
        .finally(resp => {
          if (this.props.errorSaveRecovered) {
            showErrorMessage(this.props.errorSaveRecovered.message);
          }
        });

      if (responseRecupero.code === 'CRG-000') {
        message.success('Se guardó exitosamente recupero');
        const responseListRecovered = await this.props.dispatch(listRecoveredCreators.fetchListRecovered(numSiniestro));
        this.setState({
          datosRecuperoState: responseListRecovered.data,
          addRecuperoDisabled: false
        });

        let length = this.props.listRecovered.listRecovered.length;
        let ultimoDesisitido =
          this.props.listRecovered.listRecovered.length > 0
            ? this.props.listRecovered.listRecovered[length - 1].recuperoDesistido
            : 'No hay data';

        if (ultimoDesisitido === 'S') {
          this.setState({
            addRecuperoDisabled: true,
            tipoDocumentoState: true,
            guardarDisabled: true
          });
        } else {
          this.setState({
            addRecuperoDisabled: false
          });
        }
      }
    }

    try {
      const validar = 'L';
      const {
        form: { getFieldValue }
      } = this.props;

      const { listaDocumentos } = getFieldValue('documentos') || [];

      let documentos = listaDocumentos.map((item, index) => {
        return {
          key: index,
          image: item.image,
          nomArchivo: item.nomArchivo,
          nomDocumento: item.nomDocumento,
          subTipo: item.subTipo
        };
      });

      if (documentos.length > 0) {
        const responseDocumento = await this.props.dispatch(
          saveDocumentoCreators.fetchSaveDocument(validar, numSiniestro, null, documentos)
        );
        if (responseDocumento.code === 'CRG-000') {
          message.success('Se guardó exitosamente documento');
          const subTipoDoc = null;
          this.props.dispatch(documentSinisterCreator.fetchDocuments(numSiniestro, subTipoDoc));
          resetFields(['documentos']);
        }
      }
    } catch (e) {
      showErrorMessage(e);
    }
  };

  redirectToTarget = () => {
    this.setState({
      addRecuperoDisabled: false,
      guardarDisabled: true,
      guardarGeneralDisabled: false
    });

    this.dataCargadaEnRecupero();
  };

  dataCargadaEnRecupero = () => {
    const { datosRecuperoState } = this.state;

    let recuperoLocal = datosRecuperoState.filter(item => item.accion !== 'x');

    if (recuperoLocal.length > 0) {
      this.modalRecuperoPrecargado();
      return;
    }

    this.dataCargadaEnDocumento();
  };

  modalRecuperoPrecargado = () => {
    Modal.confirm({
      title: 'Cargar recupero',
      content: 'Tiene recupero por registar, si continúa se perderá.',
      okText: 'Si',
      cancelText: 'No',
      onOk: () => {
        this.props.history.push('/consulta');
      },
      onCancel: () => {}
    });
  };

  dataCargadaEnDocumento = () => {
    const {
      form: { getFieldValue }
    } = this.props;

    const documentos = getFieldValue('documentos') || [];

    let noTieneDocumento = documentos.listaDocumentos ? documentos.listaDocumentos.length === 0 : true;

    if (!noTieneDocumento) {
      this.modalDocumentosPrecargados();
    } else {
      this.props.history.push('/consulta');
    }
  };

  modalDocumentosPrecargados = () => {
    Modal.confirm({
      title: 'Cargar documento',
      content: 'Tiene documento cargado, si continúa se perderá.',
      okText: 'Si',
      cancelText: 'No',
      onOk: () => {
        this.props.history.push('/consulta');
        // return;
      },
      onCancel: () => {}
    });
  };

  cambiarEstadoModal = valor => {
    this.setState({
      modalVisible: valor
    });
  };

  showModal = () => {
    this.setState({
      modalVisible: true
    });
  };

  disabledTipoDocumentoLegal = valor => {
    this.setState({
      tipoDocumentoState: valor
    });
  };

  render() {
    const {
      form,
      form: { getFieldValue },
      numSiniestro,
      showScroll,
      loadingListRecovered,
      tamanioPaginacion,
      loadingDocuments,
      loadingSaveRecovered,
      loadingDocumento
    } = this.props;

    const {
      modalVisible,
      addRecuperoDisabled,
      datosRecuperoState,
      guardarDisabled,
      ubicacionPantalla,
      lentghTabla,
      guardarGeneralDisabled,
      tipoDocumentoState
    } = this.state;

    let listRecoveredDataItem = datosRecuperoState.map((item, index) => {
      return {
        key: index,
        fechaRecupero: item.fechaRecupero ? item.fechaRecupero : '',
        demandado: item.demandado ? item.demandado : '',
        docDemandado: item.docDemandado ? item.docDemandado : '',
        numeroLiquidacion: item.numeroLiquidacion ? item.numeroLiquidacion : '',
        montoDolares: item.montoDolares ? parseInt(item.montoDolares) : '',
        estadoJuridico: item.estadoJuridico ? item.estadoJuridico : '',
        ejecutivoLegal: item.ejecutivoLegal ? item.ejecutivoLegal : '',
        recuperoDesistido: item.recuperoDesistido === 'SI' || item.recuperoDesistido === 'S' ? 'SI' : 'NO',
        observacion: item.observacion ? item.observacion : '',
        accion: item.accion
      };
    });

    let documentsDataRecupero = [];

    this.props.documents.documents.map((doc, index) => {
      const { archivos = [], nomTipo, nomSubtipo, nomDocumento, idSubTipoArchivo } = doc;
      archivos.map((arch, indexindex) => {
        let obj = {};
        Object.assign(
          obj,
          { key: index + indexindex },
          { tipodocumento: nomTipo },
          { subtipo: nomSubtipo },
          { descripcion: nomDocumento },
          { usuario: arch.usuario },
          { fechacarga: arch.fechaCarga },
          { documento: arch.nombreArchivo },
          { tag: arch.tag },
          { idSubTipoArchivoRecupero: idSubTipoArchivo },
          { idDocMetadata: arch.idDocMetadata }
        );
        documentsDataRecupero.push(obj);
        return { documentsDataRecupero };
      });
      return { documentsDataRecupero };
    });

    let documentsDataItem = documentsDataRecupero.filter(item => item.idSubTipoArchivoRecupero === 8);

    const documentos = getFieldValue('documentos') || [];

    let noTieneDocumento = documentos.listaDocumentos ? documentos.listaDocumentos.length === 0 : true;

    let guardarBloqueado = true;
    if (lentghTabla) {
      guardarBloqueado = guardarDisabled === true && noTieneDocumento === true;
    } else {
      guardarBloqueado = guardarDisabled === true;
    }

    const bloqueadoParaRegistrar =
      loadingSaveRecovered === true || loadingDocumento === true || loadingListRecovered === true;

    return (
      <Form>
        <h1>Cargar Recupero</h1>
        <div className="seccion_claims">
          <Card
            size="small"
            title={
              <Row gutter={24}>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <span>
                    <strong>N&uacute;mero de caso: </strong> {numSiniestro}
                  </span>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <span>
                    <strong>N&uacute;mero p&oacute;liza: </strong> {VALORES_CONSULTA.NUMPOLIZA}
                  </span>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} style={{ textAlign: 'right' }}>
                  <Button
                    onClick={this.showModal}
                    disabled={loadingListRecovered ? true : addRecuperoDisabled}
                    style={{ marginLeft: '10px' }}
                    type="primary"
                  >
                    <Icon type="plus-circle" style={{ fontSize: '15px' }} /> Cargar recupero
                  </Button>

                  {modalVisible && (
                    <AddRecuperoModal
                      datosRecuperoDelModal={this.datosRecuperoDelModal}
                      datosRecuperoState={this.state.datosRecuperoState}
                      datosRecuperoDisabled={this.datosRecuperoDisabled}
                      addRecuperoDisabled={this.state.addRecuperoDisabled}
                      cambiarEstadoModal={this.cambiarEstadoModal}
                      modalVisible={modalVisible}
                    />
                  )}
                </Col>
              </Row>
            }
          >
            <CargarRecuperoTable
              datosRecuperoState={listRecoveredDataItem}
              datosRecuperoDelModal={this.datosRecuperoDelModal}
              loadingListRecovered={this.props.loadingListRecovered}
              loadingSaveRecovered={this.props.loadingSaveRecovered}
              datosRecuperoDisabled={this.datosRecuperoDisabled}
              tamanioPaginacion={tamanioPaginacion}
              showScroll={showScroll}
            />
          </Card>
        </div>
        <div className="seccion_claims">
          <h3>Documentos recupero</h3>
          <DocumentosRecupero
            tamanioPaginacion={tamanioPaginacion}
            loadingDocuments={loadingDocuments}
            documentsDataItem={documentsDataItem}
            showScroll={showScroll}
          />
        </div>
        <div className="seccion_claims">
          <h3>Cargar Documento</h3>
          <CargarDocumentoTabla
            form={form}
            showScroll={showScroll}
            ubicacionPantalla={ubicacionPantalla}
            tipoDocumentoState={tipoDocumentoState}
            disabledTipoDocumentoLegal={this.disabledTipoDocumentoLegal}
          />
        </div>
        <Col style={{ textAlign: 'right' }}>
          <Button onClick={this.redirectToTarget}>
            Cancelar <Icon type="close-circle" style={{ fontSize: '12px' }} />
          </Button>
          <Button
            onClick={this.saveRecoveredButton}
            style={{ marginLeft: '10px', marginBottom: '30px' }}
            type="primary"
            disabled={bloqueadoParaRegistrar ? true : guardarGeneralDisabled ? guardarDisabled : guardarBloqueado}
          >
            Guardar <Icon type="save" style={{ fontSize: '15px' }} />
          </Button>
        </Col>
      </Form>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {
    match: { params }
  } = ownProps;
  const listRecovered = getListRecovered(state);
  const saveRecovered = getSaveRecovered(state);
  const documento = getSaveDocument(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  const documents = getDocuments(state);
  const numSiniestro = params.numSiniestro;
  return {
    numSiniestro,

    listRecovered,
    loadingListRecovered: listRecovered.isLoading,
    errorListRecovered: listRecovered.error,

    documents,
    loadingDocuments: documents.isLoading,

    saveRecovered,
    loadingSaveRecovered: saveRecovered.isLoading,
    errorSaveRecovered: saveRecovered.error,

    documento,
    loadingDocumento: documento.isLoading,

    tamanioPaginacion,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims
  };
};

export default withRouter(connect(mapStateToProps)(Form.create({ name: 'cargar_recupero_form' })(CargarRecuperoForm)));
