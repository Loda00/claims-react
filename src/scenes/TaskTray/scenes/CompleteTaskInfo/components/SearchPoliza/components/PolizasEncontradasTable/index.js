import React from 'react';
import { Table } from 'antd';
import { CONSTANTS_APP } from 'constants/index';
import * as Utils from 'util/index';

class PolizasEncontradasTable extends React.Component {
  onSelectChange = (selectedRowKeys, selectedRow) => {
    this.props.setDatosPoliza(selectedRow[0]);
  };

  render() {
    const {
      handlePagination,
      polizaLider: { polizaLider, isLoading },
      siniestroInicial: { indCargaMasiva },
      pagination
    } = this.props;

    const rowSelection = {
      type: 'radio',
      onChange: this.onSelectChange,
      hideDefaultSelections: true
    };

    const columns = [
      {
        title: 'Producto',
        dataIndex: 'dscProd',
        sorter: (a, b) => Utils.sortStrings(a.dscProd, b.dscProd)
      },
      {
        title: 'Póliza',
        dataIndex: 'numPol',
        sorter: (a, b) => Utils.sortStrings(a.numPol, b.numPol)
      },
      {
        title: 'Estado',
        dataIndex: 'stsPol',
        sorter: (a, b) => Utils.sortStrings(a.stsPol, b.stsPol)
      },
      {
        title: 'Nombre Completo',
        dataIndex: 'nomAseg',
        sorter: (a, b) => Utils.sortStrings(a.nomAseg, b.nomAseg)
      },
      {
        title: 'Inicio Vigencia',
        dataIndex: 'fecIniVig',
        align: 'center',
        render: text => Utils.formatDateCore(text),
        sorter: (a, b) => Utils.sortDates(a.fecIniVig, b.fecIniVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE)
      },
      {
        title: 'Fin Vigencia',
        dataIndex: 'fecFinVig',
        align: 'center',
        render: text => Utils.formatDateCore(text),
        sorter: (a, b) => Utils.sortDates(a.fecFinVig, b.fecFinVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE)
      }
    ];

    const columnsDeCoaseguro = [
      {
        title: 'Producto',
        dataIndex: 'dscProd',
        sorter: (a, b) => Utils.sortStrings(a.dscProd, b.dscProd)
      },
      {
        title: 'Póliza Líder',
        dataIndex: 'numPolLider',
        sorter: (a, b) => Utils.sortStrings(a.numPol, b.numPol)
      },
      {
        title: 'Póliza',
        dataIndex: 'numPol',
        sorter: (a, b) => Utils.sortStrings(a.numPol, b.numPol)
      },
      {
        title: 'Estado',
        dataIndex: 'stsPol',
        sorter: (a, b) => Utils.sortStrings(a.stsPol, b.stsPol)
      },
      {
        title: 'Nombre Completo',
        dataIndex: 'nomAseg',
        sorter: (a, b) => Utils.sortStrings(a.nomAseg, b.nomAseg)
      },
      {
        title: 'Inicio Vigencia',
        dataIndex: 'fecIniVig',
        align: 'center',
        render: text => Utils.formatDateCore(text),
        sorter: (a, b) => Utils.sortDates(a.fecIniVig, b.fecIniVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE)
      },
      {
        title: 'Fin Vigencia',
        dataIndex: 'fecFinVig',
        align: 'center',
        render: text => Utils.formatDateCore(text),
        sorter: (a, b) => Utils.sortDates(a.fecFinVig, b.fecFinVig, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE)
      }
    ];

    const policies = this.props.policies.policies;
    const data = policies.map((policy, index) => {
      const dataItem = {
        ...policy,
        key: index
      };
      return dataItem;
    });

    const dataPolizaLider = polizaLider.map((poliza, index) => {
      const dataItem = {
        ...poliza,
        key: index
      };
      return dataItem;
    });
    const validacionCMCoaseguro = indCargaMasiva && indCargaMasiva === 'COA';

    return (
      <Table
        rowSelection={rowSelection}
        columns={validacionCMCoaseguro ? columnsDeCoaseguro : columns}
        dataSource={validacionCMCoaseguro ? dataPolizaLider : data}
        pagination={this.props.pagination}
        onChange={handlePagination}
        loading={validacionCMCoaseguro ? isLoading : this.props.policies.isLoading}
        size="small"
        scroll={{ x: '100%' }}
      />
    );
  }
}
export default PolizasEncontradasTable;
