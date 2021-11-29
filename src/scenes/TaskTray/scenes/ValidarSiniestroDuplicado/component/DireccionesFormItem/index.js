import React from 'react';
import { Row, Col, Button, Card, Tooltip, Switch, Icon } from 'antd';

class DireccionSiniestro extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      datosDireccionSeleccionada: null
    };
  }

  render() {
    const { onChangeDireccion, loadingDireccion } = this.props;

    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card
            title={
              <React.Fragment>
                <Button icon="search">Direcciones declaradas</Button>
                <Button style={{ marginLeft: 8 }} icon="plus-circle">
                  Modificar dirección
                </Button>
              </React.Fragment>
            }
            extra={
              <Tooltip
                placement="left"
                title={loadingDireccion ? 'Ocultar dirección del Core' : 'Mostar dirección del Core'}
              >
                <Switch
                  checked={loadingDireccion}
                  onChange={onChangeDireccion}
                  checkedChildren={<Icon type="down" />}
                  unCheckedChildren={<Icon type="right" />}
                />
              </Tooltip>
            }
          >
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

export default DireccionSiniestro;
