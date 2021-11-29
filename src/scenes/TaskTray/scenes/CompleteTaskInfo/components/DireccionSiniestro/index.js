import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Modal, Button, Card, Empty, Form, Input } from 'antd';
import DireccionTable from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DireccionSiniestro/components/DireccionTable';
import Info from 'scenes/TaskTray/scenes/SiniestroDuplicado/components/InfoRegistrada/index';
import { getParam } from 'services/types/reducer';
import * as Utils from 'util/index';
import AddDireccionModalForm from './components/AddDireccionModalForm';
import './styles.css';

class DireccionSiniestro extends React.Component {
  componentDidUpdate(prevProps) {
    const polizaPrev = prevProps.poliza || {};
    const { idePol } = this.props.poliza || {};

    if (polizaPrev.idePol && idePol && idePol !== polizaPrev.idePol) {
      this.props.resetDireccionElegida();
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      datosDireccionSeleccionada: null,
      modalTablaVisible: false,
      modalFormVisible: false,
      saveButtonDisabled: true
    };
  }

  setDatosDireccion = datosDireccionSeleccionada => {
    this.setState({ saveButtonDisabled: false, datosDireccionSeleccionada });
  };

  onOk = () => {
    this.props.setDireccionElegida(this.state.datosDireccionSeleccionada);
    this.setState({ modalTablaVisible: false, modalFormVisible: false });
  };

  onOkForm = () => {
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const datosDireccion = values.departamentoProvinciaDistrito.split('/');

      const data = {
        secUbicacion: 0,
        continente: this.props.codContinente,
        codPais: this.props.codPais,
        /*
          codCiudad: datosDireccion[0],
          descCiudad: datosDireccion[1],
          codEstado: datosDireccion[2],
          descEstado: datosDireccion[3],
        */

        /* Estado => Departamento | Ciudad => Provincia | Municipio => Distrito */
        codEstado: datosDireccion[0],
        descEstado: datosDireccion[1],
        codCiudad: datosDireccion[2],
        descCiudad: datosDireccion[3],
        codMunicipio: datosDireccion[4],
        descMunicipio: datosDireccion[5],
        direc: values.calle
      };

      this.props.setDireccionElegida(data);
      this.setState({ modalTablaVisible: false, modalFormVisible: false });
    });
  };

  onCancel = () => {
    this.setState({
      datosDireccionSeleccionada: null,
      modalTablaVisible: false,
      modalFormVisible: false
    });
  };

  handleModalTablaVisible = () => {
    this.setState({ modalTablaVisible: true, saveButtonDisabled: true });
  };

  handleModalFormVisible = () => {
    this.setState({ modalFormVisible: true, saveButtonDisabled: true });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    const { idePol } = this.props.poliza || {};
    const direccionElegida = this.props.datosDireccionElegida || {};
    const {
      currentTask: { duplicado },
      direccionSiniestroDuplicado: { dscDepartamento, dscDistrito, dscProvincia, direccion } = {}
    } = this.props;

    const direccionNotEmpty =
      Utils.isNotEmpty(direccionElegida.descEstado) ||
      Utils.isNotEmpty(direccionElegida.codEstado) ||
      Utils.isNotEmpty(direccionElegida.descCiudad) ||
      Utils.isNotEmpty(direccionElegida.codCiudad) ||
      Utils.isNotEmpty(direccionElegida.descMunicipio) ||
      Utils.isNotEmpty(direccionElegida.codMunicipio) ||
      Utils.isNotEmpty(direccionElegida.direc);

    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card
            title={
              <React.Fragment>
                <Button
                  icon="search"
                  disabled={
                    !idePol || this.props.disabledGeneral /* Fecha de ocurrencia */ || !this.props.currentTask.tomado
                  }
                  onClick={this.handleModalTablaVisible}
                  onFocus={this.props.onFocusHandler}
                >
                  Direcciones Declaradas
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  icon="plus-circle"
                  disabled={
                    !idePol ||
                    this.props.disabledGeneral /*! this.props.currentTask.tomado */ ||
                    !this.props.currentTask.tomado
                  }
                  onClick={this.handleModalFormVisible}
                  onFocus={this.props.onFocusHandler}
                >
                  {direccionNotEmpty ? 'Modificar Direcci\u00f3n' : 'Agregar Direcci\u00f3n'}
                </Button>
              </React.Fragment>
            }
          >
            {direccionNotEmpty && (
              <React.Fragment>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Departamento</div>
                  <div className="claims-rrgg-description-list-index-detail">{direccionElegida.descEstado}</div>
                  {duplicado && <Info valor={dscDepartamento} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Provincia</div>
                  <div className="claims-rrgg-description-list-index-detail">{direccionElegida.descCiudad}</div>
                  {duplicado && <Info valor={dscDistrito} />}
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Distrito</div>
                  <div className="claims-rrgg-description-list-index-detail">{direccionElegida.descMunicipio}</div>
                  {duplicado && <Info valor={dscProvincia} />}
                </Col>
                <Col span={24} sm={12} md={8}>
                  <div className="claims-rrgg-description-list-index-term">Direcci&oacute;n</div>
                  <div className="claims-rrgg-description-list-index-detail">{direccionElegida.direc}</div>
                  {duplicado && <Info valor={direccion} />}
                </Col>
              </React.Fragment>
            )}
            {!direccionNotEmpty && <Empty description="No hay datos de Direccion" />}
          </Card>
        </Row>
        <Modal
          centered
          okButtonProps={{ disabled: this.state.saveButtonDisabled }}
          visible={this.state.modalTablaVisible}
          okText="Seleccionar"
          onOk={this.onOk}
          onCancel={this.onCancel}
          destroyOnClose
          maskClosable={false}
          width={700}
        >
          <Row gutter={24}>
            <h2>B&uacute;squeda de Direcciones Declaradas</h2>
            <DireccionTable idePol={idePol} setDatosDireccion={this.setDatosDireccion} />
          </Row>
        </Modal>

        {this.state.modalFormVisible && (
          <AddDireccionModalForm
            wrappedComponentRef={this.saveFormRef}
            visible={this.state.modalFormVisible}
            onCancel={this.onCancel}
            onOk={this.onOkForm}
            isDireccionNotEmpty={direccionNotEmpty}
            direccionElegida={direccionElegida}
          />
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  const codPais = getParam(state, 'CRG_SYN_TAREAS', 'CODPAIS');
  const codContinente = getParam(state, 'CRG_SYN_TAREAS', 'CODCONTINENTE');
  return {
    codPais,
    codContinente
  };
}

export default connect(mapStateToProps)(DireccionSiniestro);
