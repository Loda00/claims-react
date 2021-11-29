import React from 'react';
import { Row, Col, Card } from 'antd';

class DireccionCore extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      datosDireccionSeleccionada: null
    };
  }

  render() {
    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card>
            <React.Fragment>
              <Col xs={24} sm={12} md={8}>
                <div className="claims-rrgg-description-list-index-term">Departamento</div>
                <div className="claims-rrgg-description-list-index-detail">LIMA</div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div className="claims-rrgg-description-list-index-term">Provincia</div>
                <div className="claims-rrgg-description-list-index-detail">LIMA</div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div className="claims-rrgg-description-list-index-term">Distrito</div>
                <div className="claims-rrgg-description-list-index-detail">SURCO</div>
              </Col>
              <Col span={24}>
                <div className="claims-rrgg-description-list-index-term">Direcci&oacute;n</div>
                <div className="claims-rrgg-description-list-index-detail">Av: Caminos del Inca #1570</div>
              </Col>
            </React.Fragment>
          </Card>
        </Row>
      </React.Fragment>
    );
  }
}

export default DireccionCore;
