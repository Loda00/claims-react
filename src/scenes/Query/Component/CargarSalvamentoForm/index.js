/* eslint-disable no-nested-ternary */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Icon, Button, Col, Form, Row, Card, Modal, message } from 'antd';
import { showErrorMessage } from 'util/index';
import { CONSTANTS_APP, VALORES_CONSULTA } from 'constants/index';
import { getListSalvamento } from 'scenes/Query/Component/CargarSalvamentoForm/data/listSalvamento/reducer';
import { getSaveSalvamento } from 'scenes/Query/Component/CargarSalvamentoForm/data/saveSalvamento/reducer';
import { getSaveDocument } from 'scenes/data/documento/reducer';
import { getParamGeneral } from 'services/types/reducer';
import { getDocuments } from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/reducer';
import CargarDocumentoTabla from 'scenes/components/SectionCargarDocumento';
import CargarSalvamentoTable from 'scenes/Query/Component/CargarSalvamentoForm/components/CargarSalvamentoTable';
import AddSalvamentoModal from 'scenes/Query/Component/CargarSalvamentoForm/components/AddSalvamentoModal/index';
import DocumentosSalvamento from 'scenes/Query/Component/CargarSalvamentoForm/components/documentosSalvamento';
import * as listSalvamentoCreators from 'scenes/Query/Component/CargarSalvamentoForm/data/listSalvamento/action';
import * as saveSalvamentoCreators from 'scenes/Query/Component/CargarSalvamentoForm/data/saveSalvamento/action';
import * as saveDocumentoCreators from 'scenes/data/documento/action';
import * as documentSinisterCreator from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/action';

class CargarSalvamentoForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      datosSalvamentoState: [],
      addSalvamentoDisabled: false,
      modalVisible: false,
      guardarDisabled: true,
      ubicacionPantalla: 'salvamento',
      lentghTabla: false,
      guardarGeneralDisabled: false,
      tipoDocumentoState: true
    };
  }

  async componentDidMount() {
    const { numSiniestro } = this.props;

    const RG = this.props.numSiniestro;
    const promises = [];
    const subTipoDoc = null;
    promises.push(this.props.dispatch(listSalvamentoCreators.fetchListSalvamento(RG)));
    promises.push(this.props.dispatch(documentSinisterCreator.fetchDocuments(numSiniestro, subTipoDoc)));

    try {
      await Promise.all(promises);
      this.datosSalvamentoDelModal(this.props.listSalvamento.listSalvamento);
      const length = this.props.listSalvamento.listSalvamento.length;
      const ultimoDesistido =
        this.props.listSalvamento.listSalvamento.length > 0
          ? this.props.listSalvamento.listSalvamento[length - 1].salvDesistido
          : 'No hay data';

      if (ultimoDesistido === 'S') {
        this.setState({
          addSalvamentoDisabled: true
        });
      } else {
        this.setState({
          addSalvamentoDisabled: false
        });
      }
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(listSalvamentoCreators.fetchListSalvamentoReset());
    this.props.dispatch(saveSalvamentoCreators.fetchSaveSalvamentoReset());
    this.props.dispatch(saveDocumentoCreators.fetchSaveDocumentReset());
  }

  datosSalvamentoDelModal = nuevosSalvamentos => {
    this.setState({
      datosSalvamentoState: nuevosSalvamentos
    });
  };

  datosSalvamentoDisabled = salvamentoTable => {
    const {
      form: { getFieldValue }
    } = this.props;
    const lengthLocal = salvamentoTable.length > 0;
    const valorAccion = salvamentoTable[0] ? salvamentoTable[0].accion !== 'x' : null;

    const documentos = getFieldValue('documentos') || [];

    const noTieneDocumento = documentos.listaDocumentos ? documentos.listaDocumentos.length === 0 : true;

    if (!noTieneDocumento) {
      this.setState({
        lentghTabla: false
      });
    }

    if (lengthLocal && valorAccion) {
      if (salvamentoTable[0].salvDesistido === 'SI' || salvamentoTable[0].salvDesistido === 'S') {
        this.setState({
          guardarDisabled: false,
          guardarGeneralDisabled: true,
          tipoDocumentoState: false,
          addSalvamentoDisabled: true,
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
        addSalvamentoDisabled: true
      });
    } else {
      this.setState({
        addSalvamentoDisabled: false,
        guardarDisabled: true,
        guardarGeneralDisabled: false,
        tipoDocumentoState: true
      });
    }
  };

  saveSalvamentoButton = async () => {
    const { datosSalvamentoState } = this.state;

    const {
      form: { resetFields },
      numSiniestro
    } = this.props;

    const rolUsuario = this.props.userClaims.codTipo;
    const salvamentosNuevos = datosSalvamentoState.filter(item => item.accion === 'n');

    const salvamento = salvamentosNuevos.map((item, index) => {
      return {
        fechaVenta: item.fecVenta ? moment.utc(item.fecVenta).format(CONSTANTS_APP.FORMAT_DATE_INPUT_DB) : '',
        comprador: item.comprador ? item.comprador : '',
        documento: item.dniRucComprador ? item.dniRucComprador : '',
        numroLiquidacion: item.nroLiquidacion ? parseInt(item.nroLiquidacion) : '',
        monto: item.mtoVentaDolares ? parseInt(item.mtoVentaDolares) : '',
        precioBase: item.mtoPrecioDolares ? parseInt(item.mtoPrecioDolares) : '',
        vendedor: item.vendedor ? item.vendedor : '',
        ejecutivoLegal: item.ejecutivoLegal ? item.ejecutivoLegal : '',
        observacion: item.obervacion ? item.obervacion : '',
        desisitido: item.salvDesistido === 'N' || item.salvDesistido === 'NO' ? 'N' : 'S'
      };
    });

    if (salvamentosNuevos.length > 0) {
      const responseSalvamento = await this.props
        .dispatch(saveSalvamentoCreators.fetchSaveSalvamento(numSiniestro, salvamento, rolUsuario))
        .finally(resp => {
          if (this.props.errorSaveSalvamento) {
            showErrorMessage(this.props.errorSaveSalvamento.message);
          }
        });

      if (responseSalvamento.code === 'CRG-000') {
        message.success('Se guardó exitosamente salvamento');
        const responseListaSalvamento = await this.props.dispatch(
          listSalvamentoCreators.fetchListSalvamento(numSiniestro)
        );
        this.setState({
          datosSalvamentoState: responseListaSalvamento.data,
          addSalvamentoDisabled: false
        });

        const length = this.props.listSalvamento.listSalvamento.length;
        const ultimoDesistido =
          this.props.listSalvamento.listSalvamento.length > 0
            ? this.props.listSalvamento.listSalvamento[length - 1].salvDesistido
            : 'No hay data';

        if (ultimoDesistido === 'S') {
          this.setState({
            addSalvamentoDisabled: true,
            tipoDocumentoState: true,
            guardarDisabled: true
          });
        } else {
          this.setState({
            addSalvamentoDisabled: false
          });
        }
      }
    }

    try {
      const {
        form: { getFieldValue }
      } = this.props;

      const validar = 'L';

      const { listaDocumentos } = getFieldValue('documentos') || [];

      const documentos = listaDocumentos.map((item, index) => {
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
      addSalvamentoDisabled: false,
      guardarDisabled: true,
      guardarGeneralDisabled: false
    });

    this.dataCargadaEnSalvamento();
  };

  dataCargadaEnSalvamento = () => {
    const { datosSalvamentoState } = this.state;

    const salvamentoLocal = datosSalvamentoState.filter(item => item.accion !== 'x');

    if (salvamentoLocal.length > 0) {
      this.modalSalvamentoPrecargado();
      return;
    }

    this.dataCargadaEnDocumento();
  };

  modalSalvamentoPrecargado = () => {
    Modal.confirm({
      title: 'Cargar salvamento',
      content: 'Tiene salvamento por registar, si continúa se perderá.',
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

    const noTieneDocumento = documentos.listaDocumentos ? documentos.listaDocumentos.length === 0 : true;

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
      loadingListSalvamento,
      tamanioPaginacion,
      loadingDocuments,
      loadingSaveSalvamento,
      loadingDocumento
    } = this.props;

    const {
      modalVisible,
      addSalvamentoDisabled,
      datosSalvamentoState,
      guardarDisabled,
      ubicacionPantalla,
      lentghTabla,
      guardarGeneralDisabled,
      tipoDocumentoState
    } = this.state;

    const listSalvamentoDataItem = datosSalvamentoState.map((item, index) => {
      return {
        key: index,
        fecVenta: item.fecVenta ? item.fecVenta : null,
        comprador: item.comprador ? item.comprador : '',
        dniRucComprador: item.dniRucComprador ? item.dniRucComprador : '',
        nroLiquidacion: item.nroLiquidacion ? item.nroLiquidacion : '',
        mtoVentaDolares: item.mtoVentaDolares ? item.mtoVentaDolares : '',
        mtoPrecioDolares: item.mtoPrecioDolares ? item.mtoPrecioDolares : '',
        vendedor: item.vendedor ? item.vendedor : '',
        ejecutivolegal: item.ejecutivoLegal ? item.ejecutivoLegal : '',
        obervacion: item.obervacion ? item.obervacion : '',
        salvDesistido: item.salvDesistido === 'N' || item.salvDesistido === 'NO' ? 'NO' : 'SI',
        accion: item.accion
      };
    });

    const documentsDataSalvamento = [];

    this.props.documents.documents.map((doc, index) => {
      const { archivos = [], nomTipo, nomSubtipo, nomDocumento, idSubTipoArchivo } = doc;
      archivos.map((arch, indexindex) => {
        const obj = {};
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
          { idSubTipoArchivoSalvamento: idSubTipoArchivo },
          { idDocMetadata: arch.idDocMetadata }
        );
        documentsDataSalvamento.push(obj);
        return { documentsDataSalvamento };
      });
      return { documentsDataSalvamento };
    });

    const documentsDataItem = documentsDataSalvamento.filter(item => item.idSubTipoArchivoSalvamento === 7);

    const documentos = getFieldValue('documentos') || [];

    const noTieneDocumento = documentos.listaDocumentos ? documentos.listaDocumentos.length === 0 : true;

    let guardarBloqueado = true;
    if (lentghTabla) {
      guardarBloqueado = guardarDisabled === true && noTieneDocumento === true;
    } else {
      guardarBloqueado = guardarDisabled === true;
    }

    const bloqueadoParaRegistrar =
      loadingSaveSalvamento === true || loadingDocumento === true || loadingListSalvamento === true;

    return (
      <Form>
        <h1>Cargar Salvamento</h1>
        <div className="seccion_claims">
          <Card
            size="small"
            title={
              <Row gutter={24}>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <span>
                    {' '}
                    <strong> N&uacute;mero de caso: </strong> {numSiniestro}
                  </span>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <span>
                    <strong>N&uacute;mero p&oacute;liza: </strong> {VALORES_CONSULTA.NUMPOLIZA}
                  </span>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} style={{ textAlign: 'right' }}>
                  <Button
                    disabled={loadingListSalvamento ? true : addSalvamentoDisabled}
                    onClick={this.showModal}
                    type="primary"
                  >
                    <Icon type="plus-circle" style={{ fontSize: '15px' }} /> Cargar salvamento
                  </Button>
                  {modalVisible && (
                    <AddSalvamentoModal
                      datosSalvamentoDelModal={this.datosSalvamentoDelModal}
                      datosSalvamentoState={datosSalvamentoState}
                      datosSalvamentoDisabled={this.datosSalvamentoDisabled}
                      addSalvamentoDisabled={addSalvamentoDisabled}
                      cambiarEstadoModal={this.cambiarEstadoModal}
                      modalVisible={modalVisible}
                    />
                  )}
                </Col>
              </Row>
            }
          >
            <CargarSalvamentoTable
              datosSalvamentoState={listSalvamentoDataItem}
              datosSalvamentoDelModal={this.datosSalvamentoDelModal}
              loadingSaveSalvamento={this.props.loadingSaveSalvamento}
              datosSalvamentoDisabled={this.datosSalvamentoDisabled}
              loadingListSalvamento={loadingListSalvamento}
              tamanioPaginacion={tamanioPaginacion}
              showScroll={showScroll}
            />
          </Card>
        </div>
        <div className="seccion_claims">
          <h3>Documentos salvamento</h3>
          <DocumentosSalvamento
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
            Cancelar
            <Icon type="close-circle" style={{ fontSize: '15px' }} />
          </Button>
          <Button
            onClick={this.saveSalvamentoButton}
            style={{ marginLeft: '10px', marginBottom: '30px' }}
            type="primary"
            disabled={bloqueadoParaRegistrar ? true : guardarGeneralDisabled ? guardarDisabled : guardarBloqueado}
          >
            Guardar
            <Icon type="save" style={{ fontSize: '15px' }} />
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
  const listSalvamento = getListSalvamento(state);
  const saveSalvamento = getSaveSalvamento(state);
  const documento = getSaveDocument(state);
  const documents = getDocuments(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  const numSiniestro = params.numSiniestro;

  return {
    numSiniestro,

    listSalvamento,
    loadingListSalvamento: listSalvamento.isLoading,
    errorListSalvamento: listSalvamento.error,

    saveSalvamento,
    loadingSaveSalvamento: saveSalvamento.isLoading,
    errorSaveSalvamento: saveSalvamento.error,

    documents,
    loadingDocuments: documents.isLoading,

    documento,
    loadingDocumento: documento.isLoading,

    tamanioPaginacion,

    showScroll: state.services.device.scrollActivated,
    userClaims: state.services.user.userClaims
  };
};

export default connect(mapStateToProps)(Form.create({ name: 'cargar_salvamento_form' })(CargarSalvamentoForm));
