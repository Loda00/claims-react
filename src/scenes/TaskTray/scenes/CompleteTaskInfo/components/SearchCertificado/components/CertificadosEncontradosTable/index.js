import React from 'react';
import { Table } from 'antd';
import { CONSTANTS_APP } from 'constants/index';
import * as Utils from 'util/index';
import './styles.css';

class CertificadosEncontradosTable extends React.Component {
  onSelectChange = (selectedRowKeys, selectedRow) => {
    const { setDatosCertificado } = this.props;
    setDatosCertificado(selectedRow[0]);
  };

  render() {
    const { poliza: { codProd } = {}, pagination, handlePagination, certificates } = this.props;

    const rowSelection = {
      type: 'radio',
      onChange: this.onSelectChange,
      hideDefaultSelections: true
    };

    const columns = [
      {
        title: 'Certificado',
        dataIndex: 'numCert',
        sorter: (a, b) => Utils.sortNumbers(a.numCert, b.numCert),
        align: 'center'
      },
      {
        title: 'Descripción',
        dataIndex: 'dscCert',
        sorter: (a, b) => Utils.sortStrings(a.dscCert, b.dscCert)
      },
      {
        title: 'Moneda',
        dataIndex: 'codMonSumAseg',
        sorter: (a, b) => Utils.sortStrings(a.codMonSumAseg, b.codMonSumAseg)
      },
      {
        title: 'Suma Asegurada',
        dataIndex: 'sumAseg',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortNumbers(a.sumAseg, b.sumAseg)
      },
      {
        title: 'Planilla',
        dataIndex: 'planilla',
        sorter: (a, b) => Utils.sortStrings(a.planilla, b.planilla),
        className: codProd === '3001' ? 'show' : 'hide'
      },
      {
        title: 'Aplicación',
        dataIndex: 'aplicacion',
        sorter: (a, b) => Utils.sortStrings(a.aplicacion, b.aplicacion),
        className: codProd === '3001' ? 'show' : 'hide'
      },
      {
        title: 'Prima',
        dataIndex: 'prima',
        render: text => Utils.formatAmount(text),
        sorter: (a, b) => Utils.sortNumbers(a.prima, b.prima),
        className: codProd === '3001' ? 'show' : 'hide'
      },
      {
        title: 'Estado',
        dataIndex: 'stsCert',
        sorter: (a, b) => Utils.sortStrings(a.stsCert, b.stsCert)
      },
      {
        title: 'Inicio Vigencia',
        dataIndex: 'fecIng',
        render: text => Utils.formatDateCore(text),
        sorter: (a, b) => Utils.sortDates(a.fecIng, b.fecIng, CONSTANTS_APP.FORMAT_DATE_OUTPUT_CORE)
      },
      {
        title: 'Fin Vigencia',
        dataIndex: 'fecFin',
        render: text => Utils.formatDateCore(text),
        sorter: (a, b) => Utils.sortDates(a.fecFin, b.fecFin)
      }
    ];

    const certificatesMap = certificates.certificates;
    const data = certificatesMap.map((certificate, index) => {
      const dataItem = {
        ...certificate,
        key: index
      };
      return dataItem;
    });

    return (
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handlePagination}
        loading={certificates.isLoading}
        size="small"
        scroll={{ x: '100%' }}
      />
    );
  }
}
export default CertificadosEncontradosTable;
