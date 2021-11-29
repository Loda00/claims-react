import React from 'react';
import { Table } from 'antd';

class BuscarAseguradoModalTable extends React.Component {
  onSelectChange = (selectedRowKeys, selectedRow) => {
    this.props.setDatosTercero(selectedRow[0]);
  };

  render() {
    const { tamanioPagina } = this.props;
    const rowSelection = {
      type: 'radio',
      onChange: this.onSelectChange,
      hideDefaultSelections: true
    };

    const columns = [
      {
        title: 'Nombre/Razón Social',
        dataIndex: 'nomCompleto',
        sorter: (a, b) => (a.nomCompleto || '').localeCompare(b.nomCompleto)
      },
      {
        title: 'Tipo Documento',
        dataIndex: 'dscTipoDocumento',
        sorter: (a, b) => (a.dscTipoDocumento || '').localeCompare(b.dscTipoDocumento)
      },
      {
        title: 'Nro. Documento',
        dataIndex: 'numDocumento',
        sorter: (a, b) => (a.numDocumento || '').localeCompare(b.numDocumento)
      },
      {
        title: 'Cod. Cliente',
        dataIndex: 'codExterno',
        sorter: (a, b) => (a.codExterno || '').localeCompare(b.codExterno)
      }
    ];

    const thirdparty = this.props.thirdparty;
    let data = [];
    data = thirdparty.map((tercero, index) => {
      const dataItemInsured = {
        ...tercero,
        key: index
      };
      return dataItemInsured;
    });

    return (
      <React.Fragment>
        {this.props.showScroll && (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: tamanioPagina }}
            loading={this.props.loadingInsured}
            size="small"
            okText="Guardar"
            cancelText="Cancelar"
            scroll={{ x: '100%' }}
          />
        )}
        {!this.props.showScroll && (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            pagination={{ pageSize: tamanioPagina }}
            loading={this.props.loadingInsured}
            size="small"
            okText="Guardar"
            cancelText="Cancelar"
          />
        )}
      </React.Fragment>
    );
  }
}

export default BuscarAseguradoModalTable;
