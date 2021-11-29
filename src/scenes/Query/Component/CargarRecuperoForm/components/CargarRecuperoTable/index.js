import React from 'react';
import { Table, Popconfirm, Icon } from 'antd';
import * as Utils from 'util/index';

class CargarRecuperoTable extends React.Component {
  handleDelete = key => {
    const { datosRecuperoState, datosRecuperoDelModal, datosRecuperoDisabled } = this.props;
    const recuperos = datosRecuperoState.filter(recuperoElegido => recuperoElegido.key !== key);
    datosRecuperoDelModal(recuperos);
    datosRecuperoDisabled(recuperos);
  };

  render() {
    const {
      datosRecuperoState,
      loadingListRecovered,
      loadingSaveRecovered,
      tamanioPaginacion,
      showScroll
    } = this.props;

    const columns = [
      {
        title: 'Fec. Ingreso Recupero',
        key: 'fechaRecupero',
        dataIndex: 'fechaRecupero',
        render: text => Utils.formatDateBandeja(text),
        align: 'center'
      },
      {
        title: 'Demandado',
        key: 'demandado',
        dataIndex: 'demandado'
      },
      {
        title: 'DNI/RUC Demandado',
        key: 'docDemandado',
        dataIndex: 'docDemandado'
      },
      {
        title: 'Nro. Liquidación',
        key: 'numeroLiquidacion',
        dataIndex: 'numeroLiquidacion'
      },
      {
        title: 'Monto Recupero USD',
        key: 'montoDolares',
        dataIndex: 'montoDolares',
        align: 'right',
        render: text => Utils.formatAmount(text)
      },
      {
        title: 'Estudio Jurídico/Abogado',
        key: 'estadoJuridico',
        dataIndex: 'estadoJuridico'
      },
      {
        title: 'Ejecutivo Legal',
        key: 'ejecutivoLegal',
        dataIndex: 'ejecutivoLegal'
      },
      {
        title: 'Recupero Desistido',
        key: 'recuperoDesistido',
        dataIndex: 'recuperoDesistido'
      },
      {
        title: 'Observación',
        key: 'observacion',
        dataIndex: 'observacion'
      },
      {
        title: 'Acci\u00f3n',
        key: 'accion',
        dataIndex: 'accion',
        render: (text, record) =>
          datosRecuperoState[record.key].accion === 'n' ? (
            <Popconfirm title="Seguro de eliminar?" type="primary" onConfirm={() => this.handleDelete(record.key)}>
              <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '18px' }} />
            </Popconfirm>
          ) : (
            <Icon type="delete" theme="filled" style={{ color: '#9C9998', fontSize: '18px' }} />
          )
      }
    ];
    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            loading={loadingSaveRecovered ? true : loadingListRecovered}
            dataSource={datosRecuperoState}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
            scroll={{ x: '100%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            loading={loadingSaveRecovered ? true : loadingListRecovered}
            dataSource={datosRecuperoState}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}
export default CargarRecuperoTable;
