import React from 'react';
import { connect } from 'react-redux';
import { Row, Button, Card } from 'antd';
import AddCoberturaModalForm from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/components/AddCoberturaModalForm';
import CoberturasTable from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/components/CoberturasTable';
import TablaCoberturaCore from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/components/TablaCoberturaCore';
import { getCoverages } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/reducer';
import { getCauses } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/reducer';
import { getConsequences } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/reducer';
import * as causesActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/actions';
import * as consequencesActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/actions';
import { getParamGeneral } from 'services/types/reducer';
import { validacionDatosCobertura } from 'scenes/TaskTray/scenes/CompleteTaskInfo/utils/validate';
import './styles.css';

class DatosCobertura extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalFormVisible: false,
      saveButtonDisabled: true,
      selectedCobertura: null,
      edit: false,
      loadingGuardar: false
    };
  }

  componentDidUpdate(prevProps) {
    const polizaPrev = prevProps.poliza || {};
    const certPrev = prevProps.certificado || {};

    const { idePol } = this.props.poliza || {};
    const { numCert } = this.props.certificado || {};
    const { indCargaMasiva } = this.props;

    if (indCargaMasiva === 'COA') {
      return;
    }

    if (!this.props.esCargaInicial && polizaPrev.idePol && idePol && idePol !== polizaPrev.idePol) {
      this.props.resetCoberturas();
    }

    if (!this.props.esCargaInicial && certPrev.numCert && numCert && numCert !== certPrev.numCert) {
      this.props.resetCoberturas();
    }
  }

  resetSelectedCobertura = () => {
    this.setState({ selectedCobertura: null });
  };

  onOkForm = () => {
    this.setState({ loadingGuardar: true });
    const form = this.formRef.props.form;
    form.validateFields(['ramo', 'causa', 'consecuencia', 'montoAproximadoReclamado'], (err, values) => {
      if (err) {
        return;
      }
      const cobertura = form.getFieldValue('cobertura');
      const selectedCoverage = this.props.coverages.find(coverage => coverage.ideCobert === cobertura);
      const selectedCause = this.props.causes.causes.find(cause => cause.codCausa === values.causa);
      const selectedConsequence = this.props.consequences.consequences.find(
        coverage => coverage.codConsecuencia === values.consecuencia
      );

      const coberturaTable = {
        codRamo: values.ramo,
        tipo: selectedCoverage.tipoRes,
        codCobertura: selectedCoverage.codCobert,
        idCobertura: selectedCoverage.ideCobert,
        dscCobertura: selectedCoverage.dscCobert,
        mtoSumaAsegurada: selectedCoverage.sumAseg,
        codCausa: selectedCause.codCausa,
        descCausa: selectedCause.dscCausa,
        codConsecuencia: selectedConsequence.codConsecuencia,
        descConsecuencia: selectedConsequence.dscConsecuencia,
        montoAproximadoReclamado: values.montoAproximadoReclamado.number
      };

      if (this.state.edit) {
        const coberturaActualizada = this.props.coberturasElegidas.map(cobertura => {
          if (cobertura.key === this.state.selectedCobertura.key) {
            return Object.assign({}, cobertura, coberturaTable);
          }
          return cobertura;
        });
        this.props.setCoberturas(coberturaActualizada);
      } else {
        const coberturasNuevas = this.props.coberturasElegidas.slice();
        coberturasNuevas.push({
          ...coberturaTable,
          key: this.props.coberturasElegidas.length + 1,
          secCobertura: 0,
          secCausa: 0,
          secConsecuencia: 0,
          secRamo: 0
        });
        this.props.setCoberturas(coberturasNuevas);
      }

      this.setState({ modalFormVisible: false, edit: false, loadingGuardar: false });

      this.props.dispatch(causesActionCreator.fetchCausesReset());
      this.props.dispatch(consequencesActionCreator.fetchConsequencesReset());
    });
  };

  onCancel = () => {
    this.setState({ modalFormVisible: false, selectedCobertura: null });
    this.props.dispatch(causesActionCreator.fetchCausesReset());
    this.props.dispatch(consequencesActionCreator.fetchConsequencesReset());
    this.setState({ edit: false, loadingGuardar: false });
  };

  handleModalFormVisible = (record, edited) => {
    this.setState({
      modalFormVisible: true,
      saveButtonDisabled: true,
      selectedCobertura: record,
      edit: edited
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    const {
      siniestroInicial: { fechaOcurrencia }
    } = this.props;

    const { idePol } = this.props.poliza || {};
    const { numCert } = this.props.certificado || {};

    const showCoberturas = idePol && numCert;
    const {
      tamanioPagina,
      indCargaMasiva,
      coberturasElegidas,
      currentTask: { tomado, duplicado },
      coberturasSiniestroDuplicado,
      form: { getFieldValue }
    } = this.props;

    const { habilitarAgregarCobertura } = validacionDatosCobertura;

    const boolHabilitarAgregarCobertura = habilitarAgregarCobertura({
      showCoberturas,
      tomado,
      indCargaMasiva,
      coberturasElegidas
    });
    const dataSource =
      this.props.coberturasElegidas && this.props.coberturasElegidas.filter(item => item.delete !== true);

    const fechaVigenciaValida = getFieldValue('fechadeocurrencia') && duplicado;

    const esCMCoaseguro = indCargaMasiva === 'COA';

    return (
      <React.Fragment>
        <Row gutter={8}>
          <Card
            title={
              !esCMCoaseguro &&
              ((dataSource.length < 1 && duplicado) || !duplicado) && (
                <Button
                  icon="plus-circle"
                  disabled={!boolHabilitarAgregarCobertura || fechaVigenciaValida}
                  onClick={this.handleModalFormVisible}
                >
                  Adicionar Cobertura
                </Button>
              )
            }
          >
            <CoberturasTable
              coberturasElegidas={this.props.coberturasElegidas}
              setCoberturas={this.props.setCoberturas}
              handleModalFormVisible={this.handleModalFormVisible}
              certificado={this.props.certificado}
              currentTask={this.props.currentTask}
              tamanioPagina={tamanioPagina}
              duplicado={duplicado}
              esCMCoaseguro={esCMCoaseguro}
            />
            {duplicado && <TablaCoberturaCore coberturasSiniestroDuplicado={coberturasSiniestroDuplicado} />}
          </Card>
        </Row>
        <AddCoberturaModalForm
          indCargaMasiva={indCargaMasiva}
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.modalFormVisible}
          edit={this.state.edit}
          onCancel={this.onCancel}
          onOk={this.onOkForm}
          poliza={this.props.poliza}
          certificado={this.props.certificado}
          branches={this.props.branches}
          coverages={this.props.coverages}
          causes={this.props.causes}
          consequences={this.props.consequences}
          selectedCobertura={this.state.selectedCobertura}
          coberturasElegidas={this.props.coberturasElegidas}
          fechaOcurrencia={fechaOcurrencia}
          loadingGuardar={this.state.loadingGuardar}
        />
      </React.Fragment>
    );
  }
}
function mapStateToProps(state) {
  const causes = getCauses(state);
  const consequences = getConsequences(state);
  const coverages = getCoverages(state);
  const tamanioPagina = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    coverages,
    causes,
    consequences,
    tamanioPagina,
    showScroll: state.services.device.scrollActivated
  };
}
export default connect(mapStateToProps)(DatosCobertura);
