import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Button, Card, Switch, Tooltip, Icon } from 'antd';

const initialState = {
  datosPolizaSeleccionada: null,
  modalVisible: false,
  saveButtonDisabled: true,
  currentValidFormFields: {}
};

class SearchPoliza extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  render() {
    const { onChangePoliza, loadingPoliza } = this.props;

    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card
            title={<Button icon="search">Buscar póliza</Button>}
            extra={
              <Tooltip placement="left" title={loadingPoliza ? 'Ocultar póliza del Core' : 'Mostar póliza del Core'}>
                <Switch
                  checked={loadingPoliza}
                  onChange={onChangePoliza}
                  checkedChildren={<Icon type="down" />}
                  unCheckedChildren={<Icon type="right" />}
                />
              </Tooltip>
            }
          >
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
          </Card>
        </Row>
      </React.Fragment>
    );
  }
}

export default connect()(SearchPoliza);
