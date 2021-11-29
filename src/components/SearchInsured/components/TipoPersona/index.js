import React from 'react';
import { Tabs } from 'antd';
import FormPersonaNatural from 'components/SearchInsured/components/FormPersonaNatural';
import FormPersonaJuridica from 'components/SearchInsured/components/FormPersonaJuridica';

class TipoPersona extends React.Component {
  render() {
    const TabPane = Tabs.TabPane;

    return (
      <Tabs tabPosition={this.props.siderCollapse ? 'top' : 'left'} defaultActiveKey="1">
        <TabPane tab="Persona Natural" key="1">
          <FormPersonaNatural errorThirdparty={this.props.errorThirdparty} roleType={this.props.roleType} />
        </TabPane>
        <TabPane tab="Persona Jurídica" key="2">
          <FormPersonaJuridica errorThirdparty={this.props.errorThirdparty} roleType={this.props.roleType} />
        </TabPane>
      </Tabs>
    );
  }
}

export default TipoPersona;
