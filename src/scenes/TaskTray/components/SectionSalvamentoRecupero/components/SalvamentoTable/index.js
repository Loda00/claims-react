import React from 'react';
import { Table } from 'antd';
import * as Utils from 'util/index';

class SalvamentoTable extends React.Component {
  render() {
    const { tamanioPaginacion, showScroll } = this.props;

    const columns = [
      {
        title: 'Fecha Venta',
        dataIndex: 'fecVenta',
        key: 'fecVenta',
        render: text => Utils.formatDateBandeja(text),
        align: 'right'
      },
      {
        title: 'Comprador',
        key: 'comprador',
        dataIndex: 'comprador'
      },
      {
        title: 'DNI/RUC Comprador',
        key: 'dniRucComprador',
        dataIndex: 'dniRucComprador'
      },
      {
        title: 'Nro. Liquidación',
        key: 'nroLiquidacion',
        dataIndex: 'nroLiquidacion'
      },
      {
        title: 'Monto Venta USD',
        key: 'mtoVentaDolares',
        dataIndex: 'mtoVentaDolares',
        align: 'right',
        render: text => Utils.formatAmount(text)
      },
      {
        title: 'Precio Base USD',
        key: 'mtoPrecioDolares',
        dataIndex: 'mtoPrecioDolares',
        align: 'right',
        render: text => Utils.formatAmount(text)
      },
      {
        title: 'Vendedor',
        key: 'vendedor',
        dataIndex: 'vendedor'
      },
      {
        title: 'Ejecutivo Legal',
        key: 'ejecutivolegal',
        dataIndex: 'ejecutivolegal'
      },
      {
        title: 'Salvamento Desistido',
        key: 'salvDesistido',
        dataIndex: 'salvDesistido'
      },
      {
        title: 'Observación',
        key: 'obervacion',
        dataIndex: 'obervacion'
      }
    ];

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            loading={this.props.loadingSaveSalvamento}
            dataSource={this.props.salvamentoDataItem}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
            scroll={{ x: '100%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            loading={this.props.loadingSaveSalvamento}
            dataSource={this.props.salvamentoDataItem}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}
export default SalvamentoTable;
