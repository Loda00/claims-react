/* eslint-disable no-undef */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { Row, Col } from 'antd';
import { CONSTANTS_APP, VALOR_COBERTURA_POR_DEFECTO } from 'constants/index';
import { showErrorMessage } from 'util/index';
import { getParamGeneral } from 'services/types/reducer';
import HistoryChangeDocumentTable from 'scenes/TaskTray/components/SectionHistoryChange/component/HistoryChangeDocumentTable';
import * as HistoryReservaActionCreator from 'scenes/TaskTray/components/SectionHistoryChange/data/historialReserva/action';

class HistoryChangeDocumentSection extends Component {
  componentDidMount() {
    const {
      match: { params }
    } = this.props;
    let numSiniestro = params.numSiniestro;
    try {
      this.props.dispatch(HistoryReservaActionCreator.fecthHistorialReserva(numSiniestro));
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(HistoryReservaActionCreator.fecthHistorialReservaReset());
  }

  render() {
    const { tamanioPaginacion } = this.props;

    let historyReserva = this.props.historialReserva.historialReserva;
    let data = historyReserva.map((historyItem, index) => {
      return {
        key: index,
        ramo: historyItem.ramo ? historyItem.ramo : null,
        cobertura: historyItem.cobertura
          ? `${historyItem.codCobertura} - ${historyItem.cobertura}`
          : VALOR_COBERTURA_POR_DEFECTO.OTROS_CONCEPTOS,
        concepto: historyItem.concepto ? `${historyItem.codConcepto} - ${historyItem.concepto}` : null,
        moneda: historyItem.moneda ? historyItem.moneda : null,
        sumaasegurada: historyItem.sumaAsegurada ? historyItem.sumaAsegurada : null,
        montoreservado: historyItem.montoReserva ? historyItem.montoReserva : null,
        fechamodificacion: historyItem.fecModificacion
          ? moment.utc(historyItem.fecModificacion).format(CONSTANTS_APP.FORMAT_DATE_HOUR)
          : null,
        usuariomodificacion: historyItem.usuModificacion ? historyItem.usuModificacion : null
      };
    });

    return (
      <div>
        <Row>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginBottom: '10px' }}>
            <HistoryChangeDocumentTable
              showScroll={this.props.showScroll}
              loadingHistoryReserva={this.props.loadingHistoryReserva}
              data={data}
              tamanioPaginacion={tamanioPaginacion}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
function mapStateToProps(state) {
  const historialReserva = state.scenes.taskTray.taskTrayComponents.sectionHistoryChange.data.historialReserva;
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    historialReserva,
    loadingHistoryReserva: historialReserva.isLoading,
    errorHistoryReserva: historialReserva.error,
    showScroll: state.services.device.scrollActivated,

    tamanioPaginacion
  };
}
export default withRouter(connect(mapStateToProps)(HistoryChangeDocumentSection));
