import React from 'react';
import { Card } from 'antd';

const tabListNoTitle = [
  {
    key: 'article',
    tab: 'article'
  },
  {
    key: 'app',
    tab: 'app'
  },
  {
    key: 'project',
    tab: 'project'
  }
];

class Sinisters extends React.Component {
  state = {
    key: 'tab1',
    noTitleKey: 'app'
  };

  onTabChange = (key, type) => {
    this.setState({ [type]: key });
  };

  render() {
    return (
      <React.Fragment>
        <Card
          style={{ width: '100%' }}
          tabList={tabListNoTitle}
          activeTabKey={this.state.noTitleKey}
          onTabChange={key => {
            this.onTabChange(key, 'noTitleKey');
          }}
        />
      </React.Fragment>
    );
  }
}

export default Sinisters;
