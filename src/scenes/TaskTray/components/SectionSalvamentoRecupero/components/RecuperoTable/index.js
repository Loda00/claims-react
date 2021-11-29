import React from 'react';
import { Table } from 'antd';
import * as Utils from 'util/index';

class RecuperoTable extends React.Component {
  render() {
    const { tamanioPaginacion, showScroll } = this.props;

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
      }
    ];

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            loading={this.props.loadingListRecovered}
            dataSource={this.props.recuperoDataItem}
            size="small"
            pagination={{ defaultPageSize: tamanioPaginacion }}
            scroll={{ x: '100%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            loading={this.props.loadingListRecovered}
            dataSource={this.props.recuperoDataItem}
            size="small"
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
      </React.Fragment>
    );
  }
}
export default RecuperoTable;
