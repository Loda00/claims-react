import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Modal, Button, Card, Empty, Tabs } from 'antd';
import moment from 'moment';
import { isEmpty } from 'lodash';
import * as Utils from 'util/index';
import { CONSTANTS_APP } from 'constants/index';
import { getParamGeneral } from 'services/types/reducer';
import FormSearchByProductoPoliza from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/components/FormSearchByProductoPoliza';
import FormSearchByInsured from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/components/FormSearchByInsured';
import FormSearchByPolizaLider from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/components/FormSearchByPolizaLider';
import PolizasEncontradasTable from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/components/PolizasEncontradasTable';
import Info from 'scenes/TaskTray/scenes/SiniestroDuplicado/components/InfoRegistrada/index';
import * as policyActionCreators from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/SearchPoliza/data/policies/actions';

import { validacionDatosPoliza } from 'scenes/TaskTray/scenes/CompleteTaskInfo/utils/validate';

import './styles.css';

const initialState = {
  datosPolizaSeleccionada: null,
  modalVisible: false,
  saveButtonDisabled: true,
  currentValidFormFields: {},
  rgPolizaDuplicada: {}
};

class SearchPoliza extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { rgPolizaDuplicada } = nextProps;

    if (!isEmpty(rgPolizaDuplicada) && rgPolizaDuplicada !== prevState.rgPolizaDuplicada) {
      return {
        PolizaDuplicada: rgPolizaDuplicada.poliza
      };
    }

    return null;
  }

  componentWillUnmount() {
    this.props.dispatch(policyActionCreators.fetchPoliciesReset());
  }

  setDatosPoliza = datosPolizaSeleccionada => {
    this.setState({ saveButtonDisabled: false, datosPolizaSeleccionada });
  };

  onOk = async () => {
    const {
      datosPolizaSeleccionada,
      datosPolizaSeleccionada: { idePol, numCert }
    } = this.state;
    const { setPolizaElegida, dispatch, siniestroInicial = {} } = this.props;
    let detallePoliza;

    try {
      detallePoliza = await dispatch(policyActionCreators.fetchExistingPolicy(idePol, numCert, siniestroInicial));
    } catch (error) {
      if (error === 'DetallePolizaNotFound') {
        Utils.showModalError('La póliza no pertenece al coasegurador seleccionado en la carga de datos.');
        this.setState(initialState);
      } else {
        Utils.showErrorMessage(error);
      }
      return;
    }
    setPolizaElegida(datosPolizaSeleccionada, detallePoliza);
    this.setState(initialState);
  };

  onCancel = () => {
    this.setState(initialState);
  };

  handleModalVisible = () => {
    this.props.dispatch(policyActionCreators.fetchPoliciesReset());
    this.setState({ modalVisible: true, saveButtonDisabled: true });
  };

  setCurrentValidFormFields = values => {
    this.setState({ currentValidFormFields: values });
  };

  handlePagination = (pagination, filters, sorters) => {
    const { current } = pagination;
    const { currentValidFormFields } = this.state;
    const {
      policies: {
        meta: { page },
        sortColumn
      },
      dispatch
    } = this.props;

    if (!isEmpty(sorters) || (isEmpty(sorters) && !isEmpty(sortColumn) && current === 1)) {
      dispatch(policyActionCreators.updatePage(page));

      if (
        typeof sortColumn === 'undefined' ||
        (sorters.field === sortColumn.field && sorters.order === sortColumn.order)
      ) {
        dispatch(policyActionCreators.fetchPolicies(currentValidFormFields, current));
        dispatch(policyActionCreators.updatePage(page));
      } else {
        dispatch(policyActionCreators.updatePage(page));
      }
    } else {
      dispatch(policyActionCreators.fetchPolicies(currentValidFormFields, current));
      dispatch(policyActionCreators.updatePage(current));
    }

    dispatch(policyActionCreators.updateSortColumn(sorters));
  };

  render() {
    const {
      polizaLider,
      policies,
      policies: { loadingExistingPolicy },
      siniestroInicial = {},
      datosPolizaElegida: { idePol, dscProd, numPol, stsPol, nomAseg, fecIniVig, fecFinVig, numPolLider } = {},
      tamanioPagina
    } = this.props;
    const TabPane = Tabs.TabPane;

    const pagination = {
      total: this.props ? policies.meta.total : undefined,
      current: this.props ? policies.meta.page : undefined,
      pageSize: tamanioPagina
    };

    let fechaInicioVidencia;
    if (moment(fecIniVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).isValid()) {
      fechaInicioVidencia = moment(fecIniVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format(CONSTANTS_APP.FORMAT_DATE);
    } else {
      fechaInicioVidencia = '';
    }

    let fechaFinVigencia;
    if (moment(fecFinVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).isValid()) {
      fechaFinVigencia = moment(fecFinVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE).format(CONSTANTS_APP.FORMAT_DATE);
    } else {
      fechaFinVigencia = '';
    }
    const {
      polizaInicial,
      currentTask: { duplicado }
    } = this.props;

    const { PolizaDuplicada = {} } = this.state;

    const { mostrarPolizaLider } = validacionDatosPoliza;
    const boolMostrarPolizaLider = mostrarPolizaLider({
      indCargaMasiva: siniestroInicial.indCargaMasiva
    });

    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card
            title={
              <Button icon="search" onClick={this.handleModalVisible} disabled={!this.props.currentTask.tomado}>
                Buscar Poliza
              </Button>
            }
          >
            {idePol ? (
              <React.Fragment>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Producto</div>
                  <div className="claims-rrgg-description-list-index-detail">{dscProd}</div>
                  {duplicado && <Info valor={PolizaDuplicada.nomProducto} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Poliza</div>
                  <div className="claims-rrgg-description-list-index-detail">{numPol}</div>
                  {duplicado && <Info valor={PolizaDuplicada.numPoliza} />}
                </Col>

                {boolMostrarPolizaLider && (
                  <Col xs={24} sm={12} md={8}>
                    <div className="claims-rrgg-description-list-index-term">Poliza lider</div>
                    <div className="claims-rrgg-description-list-index-detail">{numPolLider}</div>
                  </Col>
                )}
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Estado</div>
                  <div className="claims-rrgg-description-list-index-detail">{stsPol}</div>
                  {duplicado && <Info valor={PolizaDuplicada.estadoPoliza} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Asegurado</div>
                  <div className="claims-rrgg-description-list-index-detail">{nomAseg}</div>
                  {duplicado && <Info valor={PolizaDuplicada.nomAseg} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Inicio Vigencia</div>
                  <div className="claims-rrgg-description-list-index-detail">{fechaInicioVidencia}</div>
                  {duplicado && <Info valor={Utils.formatDateCore(PolizaDuplicada.fecInicioVigencia)} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Fin Vigencia</div>
                  <div className="claims-rrgg-description-list-index-detail">{fechaFinVigencia}</div>
                  {duplicado && <Info valor={Utils.formatDateCore(PolizaDuplicada.fecFinVigencia)} />}
                </Col>
              </React.Fragment>
            ) : (
              <Empty description="No hay datos de Poliza" />
            )}
          </Card>
        </Row>
        <Modal
          centered
          okButtonProps={{ disabled: this.state.saveButtonDisabled, loading: loadingExistingPolicy }}
          cancelButtonProps={{ disabled: loadingExistingPolicy }}
          visible={this.state.modalVisible}
          okText="Seleccionar"
          onOk={this.onOk}
          onCancel={this.onCancel}
          destroyOnClose
          maskClosable={false}
          width={700}
        >
          <h2>B&uacute;squeda de Poliza</h2>
          <Row gutter={24}>
            <Tabs defaultActiveKey="1">
              {siniestroInicial.indCargaMasiva === 'COA' ? (
                <TabPane tab="Por P&oacute;liza l&iacute;der" key="1">
                  <FormSearchByPolizaLider
                    setCurrentValidFormFields={this.setCurrentValidFormFields}
                    errorPolicies={this.props.policies.error}
                  />
                </TabPane>
              ) : (
                <TabPane tab="Por Asegurado" key="2">
                  <FormSearchByInsured
                    setCurrentValidFormFields={this.setCurrentValidFormFields}
                    errorPolicies={this.props.policies.error}
                    loadingExistingPolicy={loadingExistingPolicy}
                  />
                </TabPane>
              )}
              {siniestroInicial.indCargaMasiva !== 'COA' && (
                <TabPane tab="Por Producto/P&oacute;liza" key="1">
                  <FormSearchByProductoPoliza
                    setCurrentValidFormFields={this.setCurrentValidFormFields}
                    errorPolicies={this.props.policies.error}
                    siniestroInicial={siniestroInicial}
                    loadingExistingPolicy={loadingExistingPolicy}
                  />
                </TabPane>
              )}
            </Tabs>
          </Row>
          <Row style={{ marginTop: '15px' }}>
            <Col span={24}>
              <PolizasEncontradasTable
                handlePagination={this.handlePagination}
                policies={this.props.policies}
                pagination={pagination}
                setDatosPoliza={this.setDatosPoliza}
                polizaLider={polizaLider}
                siniestroInicial={siniestroInicial}
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
    rgPolizaDuplicada: state.scenes.taskTray.completeTaskInfo.duplicados.consultarRGDuplicado.duplicado
  };
}

export default connect(mapStateToProps)(SearchPoliza);
