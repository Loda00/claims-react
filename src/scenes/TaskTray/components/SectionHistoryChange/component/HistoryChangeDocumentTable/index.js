import React from 'react';
import { Table } from 'antd';
import * as Utils from 'util/index';

class HistoryChangeDocumentTable extends React.Component {
  render() {
    const { showScroll, data, loadingHistoryReserva, tamanioPaginacion } = this.props;

    const columns = [
      {
        title: 'Ramo',
        dataIndex: 'ramo',
        key: 'ramo'
      },
      {
        title: 'Cobertura',
        dataIndex: 'cobertura',
        key: 'cobertura',
        sorter: (a, b) => Utils.sortStrings(a.cobertura, b.cobertura)
      },
      {
        title: 'Concepto',
        dataIndex: 'concepto',
        key: 'concepto'
      },
      {
        title: 'Suma asegurada',
        dataIndex: 'sumaasegurada',
        key: 'sumaasegurada',
        align: 'right',
        render: text => Utils.formatAmount(text)
      },
      {
        title: 'Monto reservado',
        dataIndex: 'montoreservado',
        key: 'montoreservado',
        align: 'right',
        render: text => Utils.formatAmount(text)
      },
      {
        title: 'Fecha modificación',
        dataIndex: 'fechamodificacion',
        key: 'fechamodificacion',
        align: 'center',
        defaultSortOrder: 'descend',
        sorter: (a, b) => Utils.sortDates(a.fechamodificacion, b.fechamodificacion, 'DD/MM/YYYY HH:mm:ss')
      },
      {
        title: 'Usuario modificación',
        dataIndex: 'usuariomodificacion',
        key: 'usuariomodificacion'
      }
    ];

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            dataSource={data}
            loading={loadingHistoryReserva}
            size="small"
            scroll={{ x: '150%' }}
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            dataSource={data}
            loading={loadingHistoryReserva}
            size="small"
            pagination={{ defaultPageSize: tamanioPaginacion }}
          />
        )}
      </React.Fragment>
    );
  }
}
export default HistoryChangeDocumentTable;
