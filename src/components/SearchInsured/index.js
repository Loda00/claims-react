import React from 'react';
import { connect } from 'react-redux';
import { Row, Col, Modal, Tabs } from 'antd';
import TipoPersona from 'components/SearchInsured/components/TipoPersona';
import FormDocumento from 'components/SearchInsured/components/FormDocumento';
import BuscarAseguradoModalTable from 'components/SearchInsured/components/BuscarAseguradoModalTable';
import { ROLE_TYPE } from 'constants/index';

import { getParamGeneral } from 'services/types/reducer';
import * as documentTypesActionCreators from 'components/SearchInsured/data/documentTypes/actions';
import * as thirdPartyActionCreators from 'components/SearchInsured/data/thirdparty/actions';

class SearchInsured extends React.Component {
  returnRoleTypeDescription = roleType => {
    switch (roleType) {
      case ROLE_TYPE.ASEGURADO:
        return 'Asegurado';
      case ROLE_TYPE.CONTRATANTE:
        return 'Contratante';
      case ROLE_TYPE.CORREDOR:
        return 'Corredor';
      case ROLE_TYPE.BENEFICIARIO:
        return 'Beneficiario';
      case ROLE_TYPE.PROVEEDOR:
        return 'Proveedor';
      case ROLE_TYPE.AJUSTADOR:
        return 'Ajustador';
      default:
        return 'Tercero';
    }
  };

  afterCloseHandler = () => {
    const { dispatch } = this.props;
    dispatch(documentTypesActionCreators.fetchDocumentTypesReset());
    dispatch(thirdPartyActionCreators.fetchThirdPartyReset());
  };

  render() {
    const { tamanioPagina } = this.props;
    const TabPane = Tabs.TabPane;
    const roleTypeDesc = this.returnRoleTypeDescription(this.props.roleType);

    return (
      <React.Fragment>
        <Modal
          wrapClassName="modal_tercero"
          centered
          okButtonProps={{
            id: 'modal_tercero_boton_seleccionar',
            disabled: this.props.saveButtonDisabled
          }}
          visible={this.props.modalVisible}
          okText="Seleccionar"
          onOk={this.props.onOk}
          onCancel={this.props.onCancel}
          destroyOnClose
          afterClose={this.afterCloseHandler}
          width={700}
          maskClosable={false}
        >
          <h2>B&uacute;squeda de {roleTypeDesc !== 'Tercero' ? roleTypeDesc : this.props.roleType} </h2>
          <Row gutter={24}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Por tipo de persona" key="1">
                <Col span={24}>
                  <TipoPersona
                    errorThirdparty={this.props.errorThirdparty}
                    roleType={this.props.roleType}
                    showScroll={this.props.showScroll}
                  />
                </Col>
              </TabPane>
              <TabPane tab="Por tipo de documento" key="2">
                <FormDocumento errorThirdparty={this.props.errorThirdparty} roleType={this.props.roleType} />
              </TabPane>
            </Tabs>
          </Row>
          <Row style={{ marginTop: '15px' }}>
            <Col span={24}>
              <BuscarAseguradoModalTable
                showScroll={this.props.showScroll}
                thirdparty={this.props.thirdparty}
                loadingInsured={this.props.loadingInsured}
                setDatosTercero={this.props.setDatosTercero}
                tamanioPagina={tamanioPagina}
              />
            </Col>
          </Row>
        </Modal>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const thirdparty = state.components.searchInsured.data.thirdparty;
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    thirdparty: thirdparty.thirdparty,
    loadingInsured: thirdparty.isLoading,
    errorThirdparty: thirdparty.error,
    showScroll: state.services.device.scrollActivated,
    tamanioPagina
  };
}
export default connect(mapStateToProps)(SearchInsured);
