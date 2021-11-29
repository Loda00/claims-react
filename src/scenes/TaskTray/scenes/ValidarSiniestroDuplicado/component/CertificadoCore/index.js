import React from 'react';
import { Row, Col } from 'antd';

const initialState = {
  datosCertificadoSeleccionado: null,
  modalVisible: false,
  saveButtonDisabled: true,
  formValues: {}
};

class CertificadoCore extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  render() {
    return (
      <React.Fragment>
        <Row gutter={8}>
          <Col xs={24} sm={20} md={8}>
            <div className="claims-rrgg-description-list-index-term">Certificado</div>
            <div className="claims-rrgg-description-list-index-detail">1</div>
          </Col>
          <Col xs={24} sm={20} md={16}>
            <div className="claims-rrgg-description-list-index-term">Descripción</div>
            <div className="claims-rrgg-description-list-index-detail">SERGIO ARMANDO</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="claims-rrgg-description-list-index-term">Moneda</div>
            <div className="claims-rrgg-description-list-index-detail">USD</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="claims-rrgg-description-list-index-term">Suma asegurada</div>
            <div className="claims-rrgg-description-list-index-detail">2,245,154.12</div>
          </Col>
          <React.Fragment>
            <Col xs={24} sm={12} md={8}>
              <div className="claims-rrgg-description-list-index-term">Planilla</div>
              <div className="claims-rrgg-description-list-index-detail">5555</div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="claims-rrgg-description-list-index-term">Aplicación</div>
              <div className="claims-rrgg-description-list-index-detail">2222</div>
            </Col>
          </React.Fragment>
          <Col xs={24} sm={12} md={8}>
            <div className="claims-rrgg-description-list-index-term">Prima</div>
            <div className="claims-rrgg-description-list-index-detail">0.00</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="claims-rrgg-description-list-index-term">Estado</div>
            <div className="claims-rrgg-description-list-index-detail">ACT</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="claims-rrgg-description-list-index-term">Inicio vigencia</div>
            <div className="claims-rrgg-description-list-index-detail">21/12/2019</div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="claims-rrgg-description-list-index-term">Fin vigencia</div>
            <div className="claims-rrgg-description-list-index-detail">21/12/2019</div>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default CertificadoCore;
