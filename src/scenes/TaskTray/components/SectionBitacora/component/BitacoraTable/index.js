import React from 'react';
import { Table } from 'antd';
import * as Utils from 'util/index';

class BitacoraTable extends React.Component {
  render() {
    const { showScroll, data, loadingBitacora, tamanioPaginacion } = this.props;

    const columns = [
      {
        title: 'Usuario',
        dataIndex: 'usuario',
        key: 'usuario'
      },
      {
        title: 'Nombre actividad',
        dataIndex: 'nombreactividad',
        key: 'nombreactividad'
      },
      {
        title: 'Estado actividad',
        dataIndex: 'estadoactividad',
        key: 'estadoactividad'
      },
      {
        title: 'Fecha y hora inicio',
        dataIndex: 'fechahorainicio',
        key: 'fechahorainicio',
        align: 'center',
        defaultSortOrder: 'descend',
        sorter: (a, b) => Utils.sortDates(a.fechahorainicio, b.fechahorainicio, 'DD/MM/YYYY HH:mm:ss')
      },
      {
        title: 'Fecha y hora finalización',
        dataIndex: 'fechahorafinalizacion',
        key: 'fechahorafinalizacion',
        align: 'center',
        sorter: (a, b) => Utils.sortDates(a.fechahorainicio, b.fechahorainicio, 'DD/MM/YYYY HH:mm:ss')
      },
      {
        title: 'Observación',
        dataIndex: 'observacion',
        key: 'observacion',
        width: showScroll ? '50%' : '35%'
      }
    ];

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            columns={columns}
            dataSource={data}
            loading={loadingBitacora}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
            scroll={{ x: '140%' }}
          />
        )}
        {!showScroll && (
          <Table
            columns={columns}
            dataSource={data}
            loading={loadingBitacora}
            pagination={{ defaultPageSize: tamanioPaginacion }}
            size="small"
          />
        )}
      </React.Fragment>
    );
  }
}
export default BitacoraTable;
