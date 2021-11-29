/* eslint-disable react/prefer-stateless-function */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import { showErrorMessage } from 'util/index';
import { getDocuments } from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/reducer';
import { getParamGeneral } from 'services/types/reducer';
import DocumentSinistersTable from 'scenes/TaskTray/components/SectionDocumentSinister/component/DocumentSinisterTable/index';
import * as documentSinisterCreator from 'scenes/TaskTray/components/SectionDocumentSinister/data/documents/action';

class DocumentSinisterSections extends Component {
  componentDidMount() {
    const {
      match: { params }
    } = this.props;
    let numSiniestro = params.numSiniestro;
    try {
      const subTipoDoc = null;
      this.props.dispatch(documentSinisterCreator.fetchDocuments(numSiniestro, subTipoDoc));
    } catch (e) {
      showErrorMessage(e);
    }
  }

  componentWillUnmount() {
    this.props.dispatch(documentSinisterCreator.fetchDocumentsReset());
  }

  render() {
    const { currentTask, tamanioPaginacion } = this.props;

    let documentsDataItem = [];

    this.props.documents.documents.map((doc, index) => {
      const { archivos = [], nomTipo, nomSubtipo, nomDocumento } = doc;
      archivos.map((arch, indexindex) => {
        let obj = {};
        Object.assign(
          obj,
          { key: arch.idDocMetadata },
          { tipodocumento: nomTipo },
          { subtipo: nomSubtipo },
          { descripcion: nomDocumento },
          { usuario: arch.usuario },
          { fechacarga: arch.fechaCarga },
          { documento: arch.nombreArchivo },
          { tag: arch.tag },
          { idDocMetadata: arch.idDocMetadata }
        );
        documentsDataItem.push(obj);
        return { documentsDataItem };
      });
      return { documentsDataItem };
    });

    return (
      <div>
        <Row>
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <DocumentSinistersTable
              showScroll={this.props.showScroll}
              disabledGeneral={this.props.disabledGeneral}
              documentsDataItem={documentsDataItem}
              loadingDocuments={this.props.loadingDocuments}
              currentTask={currentTask}
              tamanioPaginacion={tamanioPaginacion}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const documents = getDocuments(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');

  return {
    showScroll: state.services.device.scrollActivated,

    documents,
    loadingDocuments: documents.isLoading,

    tamanioPaginacion
  };
}
export default withRouter(connect(mapStateToProps)(DocumentSinisterSections));
