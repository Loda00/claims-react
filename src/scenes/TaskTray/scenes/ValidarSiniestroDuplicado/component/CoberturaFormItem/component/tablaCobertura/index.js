import React from 'react';
import { Table, Popconfirm, Icon, Divider } from 'antd';
import * as Utils from 'util/index';

class CoberturasTable extends React.Component {
  handleDelete = key => {};

  render() {
    const dataSource = [];

    const columns = [
      {
        title: 'Ramo',
        dataIndex: 'codRamo',
        sorter: (a, b) => Utils.sortStrings(a.codRamo, b.codRamo)
      },
      {
        title: 'Cobertura',
        dataIndex: 'dscCobertura',
        sorter: (a, b) => Utils.sortStrings(a.dscCobertura, b.dscCobertura)
      },
      {
        title: 'Causa',
        dataIndex: 'descCausa',
        sorter: (a, b) => Utils.sortStrings(a.descCausa, b.descCausa)
      },
      {
        title: 'Consecuencia',
        dataIndex: 'descConsecuencia',
        sorter: (a, b) => Utils.sortStrings(a.descConsecuencia, b.descConsecuencia)
      },
      {
        title: `Monto aprox. reclamado`,
        dataIndex: 'montoAproximadoReclamado',
        align: 'right',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortNumbers(a.montoAproximadoReclamado, b.montoAproximadoReclamado)
      },
      {
        title: 'Acción',
        key: 'accion',
        dataIndex: 'accion',
        width: 100,
        render: (text, record) => (
          <span>
            <Icon type="edit" title="Editar" theme="filled" style={{ color: '#E6281E', fontSize: '18px' }} />
            <Divider type="vertical" />
            <Popconfirm title="Seguro de eliminar?" onConfirm={() => this.handleDelete(record.key)}>
              <Icon type="delete" theme="filled" title="Eliminar" style={{ color: '#E6281E', fontSize: '18px' }} />
            </Popconfirm>
          </span>
        )
      }
    ];

    return <Table columns={columns} dataSource={dataSource} scroll={{ x: '100%' }} size="small" />;
  }
}
export default CoberturasTable;
