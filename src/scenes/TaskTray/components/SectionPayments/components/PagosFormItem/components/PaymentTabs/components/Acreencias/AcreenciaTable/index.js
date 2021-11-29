import React from 'react';
import { Table } from 'antd';
import { construirColumnas } from 'scenes/TaskTray/components/SectionPayments/util';

class AcreenciaTable extends React.Component {
  render() {
    const { acreencias: pagos = [], maintainLoading, sendLoading, acreenciaLoading, tamanioPagina } = this.props;

    const data = pagos.map(pago => {
      return {
        ...pago,
        numPlanilla: pago.numPlanilla,
        key: pago.id
      };
    });

    return (
      <React.Fragment>
        <br />
        <Table
          id="tabla_pagos_acreencias"
          rowClassName={record => {
            if (record.indCreoAjustador === 'S') {
              return 'claims-rrgg-edicion-ajustador';
            }
            return '';
          }}
          columns={construirColumnas('A', this.props)}
          dataSource={data}
          size="small"
          scroll={{ x: 1500 }}
          loading={maintainLoading || sendLoading || acreenciaLoading}
          pagination={{ defaultPageSize: tamanioPagina }}
        />
      </React.Fragment>
    );
  }
}

export default AcreenciaTable;
