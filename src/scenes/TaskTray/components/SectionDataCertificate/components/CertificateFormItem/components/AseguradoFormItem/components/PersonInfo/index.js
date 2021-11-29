import React, { Fragment } from 'react';
import { Col } from 'antd';

function PersonInfo(props) {
  const { nuevoAsegurado, nombres, apePaterno, apeMaterno } = props;
  return (
    <Fragment>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <div className="claims-rrgg-description-list-index-term">Nombre</div>
        <div className="claims-rrgg-description-list-index-detail">
          <span>{(nuevoAsegurado && nuevoAsegurado.nombre) || nombres}</span>
        </div>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <div className="claims-rrgg-description-list-index-term">Apellido paterno</div>
        <div className="claims-rrgg-description-list-index-detail">
          <span>{(nuevoAsegurado && nuevoAsegurado.apePaterno) || apePaterno}</span>
        </div>
      </Col>
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <div className="claims-rrgg-description-list-index-term">Apellido materno</div>
        <div className="claims-rrgg-description-list-index-detail">
          <span>{(nuevoAsegurado && nuevoAsegurado.apeMaterno) || apeMaterno}</span>
        </div>
      </Col>
    </Fragment>
  );
}
export default PersonInfo;
