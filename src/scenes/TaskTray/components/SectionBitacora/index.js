/* eslint-disable react/destructuring-assignment */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { CONSTANTS_APP } from 'constants/index';
import { Row, Col } from 'antd';
import BitacoraTable from 'scenes/TaskTray/components/SectionBitacora/component/BitacoraTable';
import * as bitacoraActionCreator from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/action';
import { getParamGeneral } from 'services/types/reducer';
import { getBitacora } from 'scenes/TaskTray/components/SectionBitacora/data/bitacora/reducer';

class BitacoraSection extends Component {
  componentWillUnmount() {
    this.props.dispatch(bitacoraActionCreator.fecthBitacoraReset());
  }

  render() {
    const { tamanioPaginacion } = this.props;

    let bitacora = this.props.bitacora.bitacora;
    let data = bitacora.map((item, index) => {
      const tieneValor =
        item.indConfirmarPago &&
        (item.tipoActividad === 'CONFIRMAR GESTIÓN' || item.tipoActividad === 'REVISAR PAGO EJECUTIVO');
      let confirmarPago = tieneValor ? (item.indConfirmarPago === 'R' ? 'RECHAZO' : 'PAGO') : null;
      return {
        key: index,
        usuario: item.usuario ? item.usuario : null,
        nombreactividad: tieneValor ? `${item.tipoActividad} - ${confirmarPago}` : item.tipoActividad,
        estadoactividad: item.estadoActividad ? item.estadoActividad : null,
        fechahorainicio: item.fechaInicio ? moment.utc(item.fechaInicio).format(CONSTANTS_APP.FORMAT_DATE_HOUR) : null,
        fechahorafinalizacion: item.fechaFin ? moment.utc(item.fechaFin).format(CONSTANTS_APP.FORMAT_DATE_HOUR) : null,
        observacion: item.observacion ? item.observacion : null
      };
    });

    return (
      <div>
        <Row>
          <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ marginBottom: '10px' }}>
            <BitacoraTable
              showScroll={this.props.showScroll}
              data={data}
              loadingBitacora={this.props.loadingBitacora}
              tamanioPaginacion={tamanioPaginacion}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const bitacora = getBitacora(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    bitacora,
    loadingBitacora: bitacora.isLoading,
    errorBitacora: bitacora.error,
    showScroll: state.services.device.scrollActivated,

    tamanioPaginacion
  };
};

export default withRouter(connect(mapStateToProps)(BitacoraSection));
