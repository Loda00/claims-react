import React from 'react';
import { connect } from 'react-redux';
import { descargarDocumento } from 'util/index';

class DescargaDocumento extends React.Component {
  async componentDidMount() {
    descargarDocumento(this.props);
  }

  render = () => null;
}

export default connect()(DescargaDocumento);
