import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import {
  showErrorMessage,
  esUsuarioEjecutivo,
  esUsuarioPracticante,
  esUsuarioLegalOSalvamento,
  esUsuarioLegalORecupero
} from 'util/index';
import { Button, Col, Modal, Form } from 'antd';
import { getSearchSinister, getFilters, getMetaPaginacion } from 'scenes/Query/data/searchSinister/reducer';
import { getPayments } from 'scenes/TaskTray/components/SectionPayments/data/payments/reducer';
import { getParamGeneral } from 'services/types/reducer';
import { CONSTANTS_APP, VALORES_CONSULTA, ESTADOS_SINIESTRO, IND_SALVAMENTO_RECUPERO } from 'constants/index';
import { Link, withRouter } from 'react-router-dom';
import QuerySinisterForm from 'scenes/Query/Component/QuerySinisterForm/index';
import QuerySinisterTable from 'scenes/Query/Component/QuerySinisterTable/index';
import Reaperturar from 'scenes/Query/Component/Reaperturar';
import Anular from 'scenes/components/Anular';
import * as searchSinisterCreators from 'scenes/Query/data/searchSinister/action';
import * as pagosExistentesCreators from 'scenes/TaskTray/components/SectionPayments/data/payments/actions';
import { isNullOrUndefined } from 'util';
import { isEmpty } from 'lodash';

class QuerySinister extends React.Component {
  state = {
    // Estado para obtener y enviar número de caso y poliza a Recupero y Salvamento
    datosSiniestroElegido: null,
    // Estado objeto para obtener los datos de un registro de la grilla.
    datosSiniestroSeleccionado: null,

    // Estados para campos en recupero
    numpolizaseleccionado: null,
    nrocasoseleccionado: null,

    // Mostrar modal (Anular y Reaperturar)
    modalVisibleReaperturar: false,
    modalVisibleAnular: false,

    // Estado para habilitar Recupero
    indRecuperoState: null,
    // Estado para habilitar Salvamento
    indSalvamentoState: null,
    // Estado para habilitar Reaperturar
    indReaperturarState: null,

    // Habilitar Anular y Reaperturar
    datosModificar: true,

    valorPag: null,

    // datosRecupero: true,
    datosSalvamento: true,
    formValues: {}
  };

  paginationOptions = {
    onChange: page => {
      const { dispatchUpdate, dispatchForm } = this.props;
      const { formValues } = this.state;
      dispatchUpdate(page);
      dispatchForm(formValues);
    }
  };

  componentDidMount() {
    const { fetchReset } = this.props;
    fetchReset();
  }

  construirParams = (values, page, tamanioPagina) => {
    const {
      userClaims: { codTipo, roles }
    } = this.props;

    const {
      numeroDeSiniestro,
      fechaDeRegistro,
      fechaDeOcurrencia,
      estadoSiniestro,
      producto,
      numeroDePoliza,
      certificado,
      equipo,
      numeroDeCaso,
      asegurado,
      siniestroLider,
      numeroPlanilla
    } = values || {};

    return {
      numSiniestro: numeroDeCaso || '',
      codEstadoSiniestro: estadoSiniestro || '',
      idSiniestro: numeroDeSiniestro ? parseInt(numeroDeSiniestro) : '',
      idCaso: '',
      numPoliza: numeroDePoliza || '',
      numCertificado: certificado || certificado === 0 ? parseInt(certificado) : '',
      numIdAsegurado: asegurado.terceroElegido ? Number(values.asegurado.terceroElegido.codExterno) : '',
      codProducto: producto || '',
      fechaIniOcurrencia:
        fechaDeOcurrencia && fechaDeOcurrencia.length > 0
          ? moment(fechaDeOcurrencia[0]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      fechaFinOcurrencia:
        fechaDeOcurrencia && fechaDeOcurrencia.length > 0
          ? moment(fechaDeOcurrencia[1]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      fechaIniRegistro:
        fechaDeRegistro && fechaDeRegistro.length > 0
          ? moment(fechaDeRegistro[0]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      fechaFinRegistro:
        fechaDeRegistro && fechaDeRegistro.length > 0
          ? moment(fechaDeRegistro[1]).format(CONSTANTS_APP.FORMAT_DATE_INVERSA)
          : '',
      idEquipo: equipo ? parseInt(equipo) : '',
      rolUsuario: codTipo || '',
      roles,
      siniestroLider: siniestroLider || '',
      numeroPlanilla: numeroPlanilla || '',
      numPag: page,
      tamPag: tamanioPagina
    };
  };

  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  resetField = () => {
    const {
      form: { resetFields }
    } = this.props;

    resetFields();
  };

  setDatosSiniestro = datosSiniestroSeleccionado => {
    this.setState(
      {
        datosModificar: false,
        // datosRecupero: false,
        datosSalvamento: false,
        datosSiniestroSeleccionado
      },
      () =>
        this.setState(
          {
            numpolizaseleccionado: this.state.datosSiniestroSeleccionado.numpoliza,
            nrocasoseleccionado: this.state.datosSiniestroSeleccionado.nrocaso
          },
          () => (VALORES_CONSULTA.NUMPOLIZA = this.state.datosSiniestroSeleccionado.numpoliza)
        )
    );
    this.triggerChange({
      datosModificar: false,
      // datosRecupero: false,
      datosSalvamento: false,
      datosSiniestroSeleccionado
    });
  };

  showConfirmReaperturar = () => {
    Modal.confirm({
      title: '¿Desea reaperturar el siniestro?',
      okText: 'Si',
      cancelText: 'No',
      onOk: () => {
        this.setState({
          modalVisibleReaperturar: true
        });
      },
      onCancel() {}
    });
  };

  showConfirmAnular = () => {
    Modal.confirm({
      title: '¿Desea anular el siniestro?',
      okText: 'Si',
      cancelText: 'No',
      onOk: () => {
        this.verificarPagosPendienteAprobados();
      },
      onCancel() {}
    });
  };

  verificarPagosPendienteAprobados = async () => {
    const { fetchPagos } = this.props;

    const { nrocasoseleccionado } = this.state;

    try {
      const numCaso = nrocasoseleccionado;
      const response = await fetchPagos(numCaso);
      const noTienePagosInd = response.data.indemnizaciones.filter(pago => pago.codEstado !== 'AN');
      const noTienePagosRep = response.data.reposiciones.filter(pago => pago.codEstado !== 'AN');
      const noTienePagosHon = response.data.honorarios.filter(pago => pago.codEstado !== 'AN');
      const noTienePagosOC = response.data.otrosConceptos.filter(pago => pago.codEstado !== 'AN');

      const noTienePagos =
        noTienePagosInd.length > 0 ||
        noTienePagosRep.length > 0 ||
        noTienePagosHon.length > 0 ||
        noTienePagosOC.length > 0;

      if (noTienePagos) {
        this.setState({
          modalVisibleAnular: false
        });

        Modal.warning({
          title: 'Anular siniestro',
          content: (
            <div>
              <p>
                No puede anular el siniestro <strong>{nrocasoseleccionado}</strong> tiene pagos registrados.
              </p>
            </div>
          )
        });
      } else {
        this.setState({
          modalVisibleAnular: true
        });
      }
    } catch (e) {
      this.setState({
        modalVisibleAnular: false
      });

      showErrorMessage(e);
    }
  };

  setFormValues = values => {
    this.setState({ formValues: values });
  };

  setIndSalvamento = indSalvamento => {
    this.setState({
      indSalvamentoState: indSalvamento
    });
  };

  setIndRecupero = (indRecupero, notifRecupero) => {
    this.setState({
      indRecuperoState: indRecupero,
      indNotifRecuperoState: notifRecupero
    });
  };

  setIndReaperturar = indReaperturar => {
    this.setState({
      indReaperturarState: indReaperturar
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisibleAnular: false,
      modalVisibleReaperturar: false
    });
  };

  restablecerValores = () => {
    this.setIndSalvamento(null);
    this.setIndRecupero(null);
    this.setIndReaperturar(null);
    this.setState({
      datosModificar: true,
      modalVisibleAnular: false,
      modalVisibleReaperturar: false
    });
  };

  limpiarAlAnularReaperturar = limpiarForm => {
    this.limpiarForm = limpiarForm;
  };

  redirectEditarSiniestro = siniestro => {
    const { history } = this.props;

    history.push(`consultar-modificar/${siniestro.nrocaso}`);
  };

  desabilitarBotonModificar = () => {
    this.setState({
      datosModificar: true
    });
  };

  habilitarBotonModificar = () => {
    this.setState({
      datosModificar: false
    });
  };

  handlePagination = (pagination, filters, sorters) => {
    const { current } = pagination;
    const {
      dispatchForm,
      formFilters,
      updatePage,
      searchSinister: {
        meta: { page },
        sortColumn
      },
      updateSortColumn,
      tamanioPagina
    } = this.props;

    if (!isEmpty(sorters) || (isEmpty(sorters) && !isEmpty(sortColumn) && current === 1)) {
      if ((sorters.field === sortColumn.field && sorters.order === sortColumn.order) || sortColumn === 'tarea') {
        dispatchForm(this.construirParams(formFilters, current, tamanioPagina));
        updatePage(current);
      } else {
        updatePage(page);
      }
    } else {
      dispatchForm(this.construirParams(formFilters, current, tamanioPagina));
      updatePage(current);
    }

    updateSortColumn(sorters);
  };

  render() {
    const {
      searchSinister,
      errorSearchSinister,
      loadingSearchSinister,
      userClaims,
      tamanioPagina,
      dispatchForm
    } = this.props;

    const {
      datosSiniestroSeleccionado,
      indRecuperoState,
      indSalvamentoState,
      indReaperturarState,
      datosModificar,
      modalVisibleReaperturar,
      modalVisibleAnular
    } = this.state;

    const esEjecutivo = esUsuarioEjecutivo(userClaims);
    const esPracticante = esUsuarioPracticante(userClaims);
    const esLegalOSalvamento = esUsuarioLegalOSalvamento(userClaims);
    const esLegalORecupero = esUsuarioLegalORecupero(userClaims);

    const { nrocasoseleccionado } = this.state;

    const pagination = {
      // ...this.paginationOptions,
      total: searchSinister.meta.total,
      current: searchSinister.meta.page,
      pageSize: tamanioPagina
    };

    const buscarSiniestro = searchSinister.searchSinister;
    const data = buscarSiniestro.map((sinisterItem, index) => {
      let listaCoberturas = '';

      (sinisterItem.ramos || []).forEach((ramo, idx) => {
        const totalRamos = sinisterItem.ramos.length - 1;
        if (sinisterItem.ramos.length > 1) {
          if (idx === totalRamos.toString()) {
            listaCoberturas += `${ramo.lstDscCoberturas}`;
          } else {
            listaCoberturas += `${ramo.lstDscCoberturas},  `;
          }
        } else if (sinisterItem.ramos.length === 1) {
          listaCoberturas += `${ramo.lstDscCoberturas}`;
        }
      });

      /* for(i in sinisterItem.ramos){
      let totalRamos = sinisterItem.ramos.length - 1;
      if(sinisterItem.ramos.length > 1){
        if(i === totalRamos.toString()){
          listaCoberturas += `${sinisterItem.ramos[i].lstDscCoberturas}`;
        }else{
          listaCoberturas += `${sinisterItem.ramos[i].lstDscCoberturas},  `;
        }
      }else if(sinisterItem.ramos.length === 1){
        listaCoberturas += `${sinisterItem.ramos[i].lstDscCoberturas}`;
      } */

      return {
        key: index,
        nrosiniestro: sinisterItem.idSiniestro,
        nrocaso: sinisterItem.numSiniestro,
        fecocurrencia: sinisterItem.fechaOcurrencia,
        ramo: sinisterItem.ramos[0] ? sinisterItem.ramos[0].codRamo : '',
        cobertura: listaCoberturas,
        numpoliza: sinisterItem.numPoliza,
        certificado: sinisterItem.numCertificado,
        estadosiniestro: sinisterItem.descSubEstado
          ? `${sinisterItem.estadoSiniestro} - ${sinisterItem.descSubEstado}`
          : sinisterItem.estadoSiniestro,
        asegurado: sinisterItem.nombresAsegurado,
        equipo: sinisterItem.descripcionEquipo,
        ejecutivoasignado: sinisterItem.ejecutivoAsignado,
        ajustadorasignado: sinisterItem.ajustadorAsignado,
        indRecupero: sinisterItem.indRecupero,
        indSalvamento: sinisterItem.indSalvamento,
        codEstadoSiniestro: sinisterItem.codEstadoSiniestro,
        mensajeError: sinisterItem.errorGuardarCore,
        indNotifRecupero: sinisterItem.indNotifRecupero,
        indNotifSalvamento: sinisterItem.indNotifSalvamento,
        indReapertura: sinisterItem.indReapertura,
        nroCasoReapertura: sinisterItem.nroCasoReapertura,
        nrosiniestrolider: sinisterItem.siniestroLider,
        numplanilla: sinisterItem.numPlanilla
      };
    });

    return (
      <React.Fragment>
        <h1>Consulta siniestros</h1>
        <Col>
          <QuerySinisterForm
            setFormValues={this.setFormValues}
            errorSearchSinister={errorSearchSinister}
            lengthData={searchSinister.meta.total}
            datosSiniestroSeleccionado={datosSiniestroSeleccionado}
            restablecerValores={this.restablecerValores}
            limpiarAlAnularReaperturar={this.limpiarAlAnularReaperturar}
            desabilitarBotonModificar={this.desabilitarBotonModificar}
            construirParams={this.construirParams}
            dispatchForm={dispatchForm}
            tamanioPagina={tamanioPagina}
          />
        </Col>
        <Col className="seccion_claims">
          <QuerySinisterTable
            setDatosSiniestro={this.setDatosSiniestro}
            setIndRecupero={this.setIndRecupero}
            setIndSalvamento={this.setIndSalvamento}
            setIndReaperturar={this.setIndReaperturar}
            pagination={pagination}
            data={data}
            loadingSearchSinister={loadingSearchSinister}
            desabilitarBotonModificar={this.desabilitarBotonModificar}
            habilitarBotonModificar={this.habilitarBotonModificar}
            siniestro={datosSiniestroSeleccionado}
            restablecerValores={this.restablecerValores}
            handlePagination={this.handlePagination}
            dispatchForm={dispatchForm}
            tamanioPagina={tamanioPagina}
            userClaims={userClaims}
          />
        </Col>
        <Col style={{ textAlign: 'right' }}>
          {esLegalORecupero && (
            <Button
              disabled={indRecuperoState !== IND_SALVAMENTO_RECUPERO.RECUPERO}
              style={{
                marginLeft: '10px',
                marginBottom: '20px'
              }}
              type="primary"
            >
              {nrocasoseleccionado ? <Link to={`${nrocasoseleccionado}/recupero`}>Recupero</Link> : 'Recupero'}
            </Button>
          )}
          {esLegalOSalvamento && (
            <Button
              disabled={indSalvamentoState !== IND_SALVAMENTO_RECUPERO.SALVAMENTO}
              style={{
                marginLeft: '10px',
                marginBottom: '20px'
              }}
              type="primary"
            >
              {nrocasoseleccionado ? <Link to={`${nrocasoseleccionado}/salvamento`}>Salvamento</Link> : 'Salvamento'}
            </Button>
          )}
          {esEjecutivo && (
            <Button
              icon="close-circle"
              onClick={this.showConfirmAnular}
              style={{ marginLeft: '10px' }}
              disabled={
                indReaperturarState === ESTADOS_SINIESTRO.ANULADO ||
                indReaperturarState === null ||
                indReaperturarState === ESTADOS_SINIESTRO.CERRADO
              }
            >
              Anular
            </Button>
          )}
          {esEjecutivo && (
            <Button
              icon="rollback"
              onClick={this.showConfirmReaperturar}
              style={{
                marginLeft: '10px',
                marginBottom: '20px'
              }}
              disabled={
                !(
                  (indReaperturarState === ESTADOS_SINIESTRO.ANULADO ||
                    indReaperturarState === ESTADOS_SINIESTRO.CERRADO) &&
                  (datosSiniestroSeleccionado.nrosiniestro &&
                    isNullOrUndefined(datosSiniestroSeleccionado.nroCasoReapertura))
                )
              }
            >
              Reaperturar
            </Button>
          )}

          {(esEjecutivo || esPracticante) && (
            <Button
              type="primary"
              icon="form"
              onClick={() => this.redirectEditarSiniestro(datosSiniestroSeleccionado)}
              disabled={datosModificar}
              style={{
                marginLeft: '10px',
                marginBottom: '20px'
              }}
            >
              Modificar
            </Button>
          )}
        </Col>
        {modalVisibleReaperturar && (
          <Reaperturar
            modalVisibleReaperturar={modalVisibleReaperturar}
            handleCancel={this.handleCancel}
            restablecerValores={this.restablecerValores}
            datosSiniestroSeleccionado={datosSiniestroSeleccionado}
            limpiarForm={this.limpiarForm}
          />
        )}
        {modalVisibleAnular && (
          <Anular
            modalVisibleAnular={modalVisibleAnular}
            handleCancel={this.handleCancel}
            restablecerValores={this.restablecerValores}
            datosSiniestroSeleccionado={datosSiniestroSeleccionado}
            limpiarForm={this.limpiarForm}
          />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  searchSinister: getSearchSinister(state),
  loadingSearchSinister: getSearchSinister(state).isLoading,
  errorSearchSinister: getSearchSinister(state).error,

  payments: getPayments(state),
  loadingPayments: getPayments(state).isLoading,

  formFilters: getFilters(state),
  metaPaginacion: getMetaPaginacion(state),

  showScroll: state.services.device.scrollActivated,
  userClaims: state.services.user.userClaims,
  tamanioPagina: getParamGeneral(state, 'TAMANIO_TABLA_PAGINA')
});

const mapDispatchToProps = dispatch => ({
  //   dispatchUpdate: page => dispatch(searchSinisterCreators.updatePage(page)),
  updatePage: page => dispatch(searchSinisterCreators.updatePage(page)),
  dispatchForm: params => dispatch(searchSinisterCreators.fetchSearchSinister(params)),
  fetchReset: () => dispatch(searchSinisterCreators.fetchSearchSinisterReset()),

  updateSortColumn: sorters => dispatch(searchSinisterCreators.updateSortColumn(sorters)),
  fetchPagos: numCaso => dispatch(pagosExistentesCreators.fetchPayments({ numCaso }))
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Form.create({ name: 'consultar_siniestro' })(QuerySinister))
);
