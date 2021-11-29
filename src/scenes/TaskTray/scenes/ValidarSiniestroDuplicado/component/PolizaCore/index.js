import React from 'react';
import { Col } from 'antd';

class PolizaCore extends React.Component {
  state = {
    steta: true
  };

  render() {
    return (
      <React.Fragment>
        <Col xs={24} sm={12} md={8}>
          <div className="claims-rrgg-description-list-index-term">Producto</div>
          <div className="claims-rrgg-description-list-index-detail">TERRORISMO</div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="claims-rrgg-description-list-index-term">Póliza</div>
          <div className="claims-rrgg-description-list-index-detail">1425</div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="claims-rrgg-description-list-index-term">Estado</div>
          <div className="claims-rrgg-description-list-index-detail">ACT</div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="claims-rrgg-description-list-index-term">Asegurado</div>
          <div className="claims-rrgg-description-list-index-detail">Juan Perez C</div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="claims-rrgg-description-list-index-term">Inicio vigencia</div>
          <div className="claims-rrgg-description-list-index-detail">12/01/2019</div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div className="claims-rrgg-description-list-index-term">Fin vigencia</div>
          <div className="claims-rrgg-description-list-index-detail">12/05/2019</div>
        </Col>
      </React.Fragment>
    );
  }
}
export default PolizaCore;
