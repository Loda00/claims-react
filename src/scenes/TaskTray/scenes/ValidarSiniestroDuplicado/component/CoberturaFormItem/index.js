import React from 'react';
import { Row, Tooltip, Button, Card, Switch, Icon } from 'antd';
import TablaCobertura from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/CoberturaFormItem/component/tablaCobertura/index';

const initialState = {
  datosCertificadoSeleccionado: null,
  modalVisible: false,
  saveButtonDisabled: true,
  formValues: {}
};

class SearchCertificado extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  render() {
    const { loadingCobertura, onChangeCobertura } = this.props;

    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card
            title={<Button icon="plus-circle">Adicionar cobertura</Button>}
            extra={
              <Tooltip
                placement="left"
                title={loadingCobertura ? 'Ocultar cobertura del Core' : 'Mostar cobertura del Core'}
              >
                <Switch
                  checked={loadingCobertura}
                  onChange={onChangeCobertura}
                  checkedChildren={<Icon type="down" />}
                  unCheckedChildren={<Icon type="right" />}
                />
              </Tooltip>
            }
          >
            <React.Fragment>
              <TablaCobertura />
            </React.Fragment>
          </Card>
        </Row>
      </React.Fragment>
    );
  }
}

export default SearchCertificado;
