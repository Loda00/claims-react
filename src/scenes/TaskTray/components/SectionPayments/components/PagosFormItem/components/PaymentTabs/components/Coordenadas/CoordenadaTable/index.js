import React from 'react';
import { Table } from 'antd';
import { construirColumnas } from 'scenes/TaskTray/components/SectionPayments/util';

class CoordenadaTable extends React.Component {
  render() {
    const { coordenadas = [], maintainLoading, sendLoading, coordenadaLoading } = this.props;

    const data = coordenadas.map(coordenada => {
      return {
        ...coordenada,
        codCobertura: coordenada.codCobertura,
        key: coordenada.id
      };
    });

    return (
      <React.Fragment>
        <br />
        <Table
          id="tabla_pagos_coordenadas"
          rowClassName={record => {
            if (record.indCreoAjustador === 'S') {
              return 'claims-rrgg-edicion-ajustador';
            }
            return '';
          }}
          columns={construirColumnas('C', this.props)}
          dataSource={data}
          size="small"
          scroll={{ x: 1300 }}
          loading={maintainLoading || sendLoading || coordenadaLoading}
        />
      </React.Fragment>
    );
  }
}

export default CoordenadaTable;
