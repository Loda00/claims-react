import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Modal, Button, Card, Empty } from 'antd';
import FormCertificado from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/FormCertificado';
import CertificadosEncontradosTable from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/components/CertificadosEncontradosTable';
import { getParamGeneral } from 'services/types/reducer';
import Info from 'scenes/TaskTray/scenes/SiniestroDuplicado/components/InfoRegistrada/index';
import * as Utils from 'util/index';
import { isEmpty } from 'lodash';
import * as branchesActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/actions';
import * as certificatesActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchCertificado/data/certificates/actions';
import './styles.css';

const initialState = {
  datosCertificadoSeleccionado: null,
  modalVisible: false,
  saveButtonDisabled: true,
  formValues: {},
  certificadoDuplicado: {}
};

class SearchCertificado extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidUpdate(prevProps) {
    const polizaPrev = prevProps.poliza || {};
    const { idePol } = this.props.poliza || {};

    if (polizaPrev.idePol && idePol && idePol !== polizaPrev.idePol) {
      this.props.resetCertificadoElegido();
      this.props.dispatch(certificatesActionCreators.fetchCertificatesReset());
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { rgCertificadoDuplicado } = nextProps;

    if (!isEmpty(rgCertificadoDuplicado) && rgCertificadoDuplicado !== prevState.certificadoDuplicado) {
      return {
        certificadoDuplicado: rgCertificadoDuplicado[0]
      };
    }

    return null;
  }

  componentWillUnmount() {
    this.props.dispatch(certificatesActionCreators.fetchCertificatesReset());
  }

  setDatosCertificado = datosCertificadoSeleccionado => {
    this.setState({ saveButtonDisabled: false, datosCertificadoSeleccionado });
  };

  onOk = () => {
    const { indCargaMasiva, setValidarCoberturasInicio, setValidarCoberturasFin } = this.props;
    // Si es carga masiva coaseguros, se valida que el certificado de la poliza
    // tenga el mismo ramo que la escogida en el excel.
    if (indCargaMasiva === 'COA') {
      const { dispatch, siniestroInicial } = this.props;
      const { idePol } = this.props.poliza || {};
      const {
        datosCertificadoSeleccionado: { numCert }
      } = this.state;
      const ramosSiniestroInicial = siniestroInicial.ramos || [];
      const ramoInicial = ramosSiniestroInicial[0] || {}; // .codigo
      setValidarCoberturasInicio();
      dispatch(branchesActionCreator.fetchBranches(idePol, numCert, undefined)).finally(() => {
        setValidarCoberturasFin();
        const { branches, resetCertificadoElegido } = this.props;
        const ramosNuevaPoliza = branches.branches;
        const existeRamoInicialEnNuevaPoliza = ramosNuevaPoliza.some(
          nuevoRamo => nuevoRamo.codRamo === ramoInicial.codigo
        );
        if (!existeRamoInicialEnNuevaPoliza) {
          const MSG_ERROR = `No se encontró el ramo ${ramoInicial.codigo} en la combinacion de poliza - certificado escogida. 
            Por favor, elegir otro certificado u otra póliza.`;
          Modal.error({
            title: 'Ramo no encontrado',
            content: MSG_ERROR,
            onOk: resetCertificadoElegido()
          });
        }
      });
    }

    this.props.setCertificadoElegido(this.state.datosCertificadoSeleccionado);
    this.setState(initialState);
  };

  onCancel = () => {
    this.setState({ datosCertificadoSeleccionado: null, modalVisible: false });
    this.setState(initialState);
  };

  handleModalVisible = () => {
    this.props.dispatch(certificatesActionCreators.fetchCertificatesReset());
    const {
      currentTask: { fecOcurrencia }
    } = this.props;
    const { idePol, codProd, numPol } = this.props.poliza || {};
    if (codProd && codProd !== '3001') {
      this.props
        .dispatch(certificatesActionCreators.fetchCertificates(idePol, codProd, numPol, null, null, fecOcurrencia))
        .finally(resp => {
          if (this.props.certificates.error) {
            Utils.showErrorMessage(this.props.certificates.error.message);
          }
        });
    }

    this.setState({ modalVisible: true, saveButtonDisabled: true });
  };

  setFormValues = values => {
    this.setState({ formValues: values });
  };

  handlePagination = (pagination, filters, sorters) => {
    const { current } = pagination;
    const { formValues } = this.state;
    const {
      certificates: {
        meta: { page },
        sortColumn
      },
      poliza: { idePol, codProd, numPol } = {},
      dispatch,
      currentTask: { fecOcurrencia }
    } = this.props;

    if (!isEmpty(sorters) || (isEmpty(sorters) && !isEmpty(sortColumn) && current === 1)) {
      dispatch(certificatesActionCreators.updatePage(page));

      if (
        typeof sortColumn === 'undefined' ||
        (sorters.field === sortColumn.field && sorters.order === sortColumn.order)
      ) {
        dispatch(
          certificatesActionCreators.fetchCertificates(idePol, codProd, numPol, formValues, current, fecOcurrencia)
        );
        dispatch(certificatesActionCreators.updatePage(page));
      } else {
        dispatch(certificatesActionCreators.updatePage(page));
      }
    } else {
      dispatch(
        certificatesActionCreators.fetchCertificates(idePol, codProd, numPol, formValues, current, fecOcurrencia)
      );
      dispatch(certificatesActionCreators.updatePage(current));
    }

    dispatch(certificatesActionCreators.updateSortColumn(sorters));
  };

  render() {
    const { tamanioPagina } = this.props;

    const { idePol, codProd } = this.props.poliza || {};

    const { numCert, dscCert, codMonSumAseg, sumAseg, planilla, aplicacion, prima, stsCert, fecIng, fecFin } =
      this.props.datosCertificadoElegido || {};
    const pagination = {
      total: this.props ? this.props.certificates.meta.total : undefined,
      current: this.props ? this.props.certificates.meta.page : undefined,
      pageSize: tamanioPagina
    };
    const {
      currentTask: { duplicado }
    } = this.props;

    const { certificadoDuplicado } = this.state;

    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card
            title={
              <Button
                icon="search"
                disabled={!idePol || !this.props.currentTask.tomado}
                onClick={this.handleModalVisible}
              >
                Buscar Certificado
              </Button>
            }
          >
            {Boolean(numCert) && (
              <React.Fragment>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Certificado</div>
                  <div className="claims-rrgg-description-list-index-detail">{numCert}</div>
                  {duplicado && <Info valor={certificadoDuplicado.numCert} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Descripción</div>
                  <div className="claims-rrgg-description-list-index-detail">{dscCert}</div>
                  {duplicado && <Info valor={certificadoDuplicado.dscCert} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Moneda</div>
                  <div className="claims-rrgg-description-list-index-detail">{codMonSumAseg}</div>
                  {duplicado && <Info valor={certificadoDuplicado.codMonSumAseg} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Suma asegurada</div>
                  <div className="claims-rrgg-description-list-index-detail">{Utils.formatAmount(sumAseg)}</div>
                  {duplicado && <Info valor={Utils.formatAmount(certificadoDuplicado.sumAseg)} />}
                </Col>
                {codProd && codProd === '3001' && (
                  <React.Fragment>
                    <Col xs={24} sm={12} md={8}>
                      <div className="claims-rrgg-description-list-index-term">Planilla</div>
                      <div className="claims-rrgg-description-list-index-detail">{planilla}</div>
                      {duplicado && <Info valor={certificadoDuplicado.planilla} />}
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <div className="claims-rrgg-description-list-index-term">Aplicacion</div>
                      <div className="claims-rrgg-description-list-index-detail">{aplicacion}</div>
                      {duplicado && <Info valor={certificadoDuplicado.aplicacion} />}
                    </Col>
                  </React.Fragment>
                )}
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Prima</div>
                  <div className="claims-rrgg-description-list-index-detail">{Utils.formatAmount(prima)}</div>
                  {duplicado && <Info valor={Utils.formatAmount(certificadoDuplicado.prima)} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Estado</div>
                  <div className="claims-rrgg-description-list-index-detail">{stsCert}</div>
                  {duplicado && <Info valor={certificadoDuplicado.stsCert} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Inicio Vigencia</div>
                  <div className="claims-rrgg-description-list-index-detail">{Utils.formatDateCore(fecIng)}</div>
                  {duplicado && <Info valor={Utils.formatDateCore(certificadoDuplicado.fecIng)} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Fin Vigencia</div>
                  <div className="claims-rrgg-description-list-index-detail">{Utils.formatDateCore(fecFin)}</div>
                  {duplicado && <Info valor={Utils.formatDateCore(certificadoDuplicado.fecFin)} />}
                </Col>
              </React.Fragment>
            )}
            {!numCert && <Empty description="No hay datos de Certificado" />}
          </Card>
        </Row>
        <Modal
          centered
          okButtonProps={{ disabled: this.state.saveButtonDisabled }}
          visible={this.state.modalVisible}
          okText="Seleccionar"
          onOk={this.onOk}
          onCancel={this.onCancel}
          destroyOnClose
          width={1000}
          maskClosable={false}
        >
          <h2>B&uacute;squeda de Certificado</h2>
          <Row gutter={24}>
            <FormCertificado
              poliza={this.props.poliza}
              errorCertificates={this.props.certificates.error}
              setFormValues={this.setFormValues}
            />
          </Row>
          <Row style={{ marginTop: '15px' }}>
            <Col span={24}>
              <CertificadosEncontradosTable
                poliza={this.props.poliza}
                certificates={this.props.certificates}
                pagination={pagination}
                setDatosCertificado={this.setDatosCertificado}
                handlePagination={this.handlePagination}
              />
            </Col>
          </Row>
        </Modal>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    tamanioPagina,
    rgCertificadoDuplicado: state.scenes.taskTray.completeTaskInfo.duplicados.consultarCertificadoDuplicado.certificado
  };
}

export default connect(mapStateToProps)(SearchCertificado);
