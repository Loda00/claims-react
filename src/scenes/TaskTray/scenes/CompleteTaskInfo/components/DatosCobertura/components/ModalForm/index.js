import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Select, Modal } from 'antd';
import { isEmpty } from 'lodash';
import currency from 'currency.js';
import moment from 'moment';
import * as branchesActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/actions';
import * as causesActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/actions';
import * as consequencesActionCreator from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/actions';
import {
  getRamosCoberturas,
  getCoverages
} from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/branches/reducer';
import { getCertificado } from 'scenes/TaskTray/components/SectionDataCertificate/data/dataCertificate/reducer';
import { getCoberturaLoading } from 'scenes/TaskTray/components/SectionDataCobertura/data/crearCobertura/reducer';
import { getCauses } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/causes/reducer';
import { getConsequences } from 'scenes/TaskTray/scenes/CompleteTaskInfo/components/DatosCobertura/data/consequences/reducer';
import { getDataSinister } from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';
import { hasErrors, showErrorMessage } from 'util/index';
import PriceInput from 'components/PriceInput';
import { ValidationMessage } from 'util/validation';
import { servicioValidaCoberturaRimac, validaFechaDeOcurrencia } from './validation';

class ModalForm extends React.Component {
  state = {
    validandoCobertura: false
  };

  componentDidMount() {
    const { certificadoActual, siniestroRG, indCargaMasiva, onCancel } = this.props;

    this.props.form.validateFields();

    const selectedCobertura = this.props.selectedCobertura || {};

    const { codMonSumAseg } = this.props.certificado || {};

    this.props.form.setFieldsValue({ cobertura: [] });

    this.props.form.setFieldsValue({
      montoAproximadoReclamado: {
        currency: codMonSumAseg,
        number: Number(selectedCobertura.montoAproximadoReclamado || '')
      }
    });

    const { idePol } = this.props.poliza || {};
    const { numCert, ideDec } = this.props.certificado || {};

    let declaracion = ideDec > 0 ? ideDec : undefined;
    if (!isEmpty(siniestroRG) && siniestroRG.codProducto === '3001') {
      declaracion = certificadoActual.idDeclaracion;
    }

    if (indCargaMasiva === 'COA') {
      if (!numCert || !idePol) {
        Modal.warning({
          // title: "Ramo no encontrado",
          content: `Se debe buscar ${!idePol ? 'una póliza' : 'un certificado'}.`,
          onOk: onCancel()
        });
        return;
      }
    }

    this.props.dispatch(branchesActionCreator.fetchBranches(idePol, numCert, declaracion)).finally(() => {
      const {
        branches,
        dispatch,
        ramosYcoberturas,
        form: { setFieldsValue }
      } = this.props;

      if (this.props.branches.error) {
        showErrorMessage(this.props.branches.error.message);
        return;
      }

      if (selectedCobertura.codRamo) {
        setFieldsValue({ ramo: selectedCobertura.codRamo });
        dispatch(branchesActionCreator.updateSelectedBranch(selectedCobertura.codRamo));

        this.setState({
          codigoRamo: selectedCobertura.codRamo
        });

        if (selectedCobertura.idCobertura) {
          setFieldsValue({ cobertura: `${selectedCobertura.idCobertura}` });
        }
      } else if (ramosYcoberturas.length === 1) {
        setFieldsValue({
          ramo: branches.branches[0].codRamo
        });

        this.handleBranchChange(branches.branches[0].codRamo);
      }
    });

    if (selectedCobertura.codRamo) {
      this.props
        .dispatch(causesActionCreator.fetchCauses(selectedCobertura.codRamo))
        .then(() => {
          if (selectedCobertura.codCausa) {
            this.props.form.setFieldsValue({ causa: selectedCobertura.codCausa });
          }
        })
        .finally(() => {
          if (this.props.causes.error) {
            showErrorMessage(this.props.causes.error.message);
          }
        });

      this.props
        .dispatch(consequencesActionCreator.fetchConsequences(selectedCobertura.codRamo))
        .then(() => {
          if (selectedCobertura.codConsecuencia) {
            this.props.form.setFieldsValue({ consecuencia: selectedCobertura.codConsecuencia });
          }
        })
        .finally(() => {
          if (this.props.consequences.error) {
            showErrorMessage(this.props.consequences.error.message);
          }
        });
    }
  }

  handleBranchChange = codRamo => {
    this.props.dispatch(branchesActionCreator.updateSelectedBranch(codRamo));
    this.props.form.setFieldsValue({ cobertura: [], causa: [], consecuencia: [] });
    this.props.form.validateFields();

    // obtiene causas
    this.props.dispatch(causesActionCreator.fetchCauses(codRamo)).finally(() => {
      if (this.props.causes.error) {
        showErrorMessage(this.props.causes.error.message);
      }
    });

    // obtiene consecuencias
    this.props.dispatch(consequencesActionCreator.fetchConsequences(codRamo)).finally(() => {
      if (this.props.consequences.error) {
        showErrorMessage(this.props.consequences.error.message);
      }
    });
  };

  checkPrice = (rule, value, callback) => {
    const {
      form: { getFieldsValue },
      coverages,
      indCargaMasiva
    } = this.props;

    const esCMCoaseguro = indCargaMasiva === 'COA';

    if (!isEmpty(value) && Number.isNaN(Number(value.number))) {
      callback(ValidationMessage.REQUIRED);
      return;
    }

    if (value && Number(value.number) <= 0) {
      callback('El monto debe ser mayor que cero');
      return;
    }

    if (esCMCoaseguro) {
      callback();
      return;
    }

    const coberturaActual = getFieldsValue().cobertura;
    if (coberturaActual && coverages) {
      const obj = coverages.find(item => item.ideCobert === coberturaActual);
      if (obj) {
        if (obj.sumAseg < Number(value.number)) {
          callback(`El monto no debe ser mayor a ${currency(obj.sumAseg).format()}`);
          return;
        }
      }
    }

    let retornar = false;
    if (coberturaActual && getFieldsValue().montoAproximadoReclamado.number) {
      coverages.forEach(item => {
        if (Number(item.ideCobert) === Number(coberturaActual)) {
          if (Number(item.sumAseg) < Number(getFieldsValue().montoAproximadoReclamado.number)) {
            callback(`El monto no debe ser mayor a ${currency(item.sumAseg).format()}`);
            retornar = true;
          }
        }
      });

      if (retornar) {
        return;
      }
    }

    callback();
  };

  handleCobertura = () => {
    const {
      form: { validateFields }
    } = this.props;
    setTimeout(() => {
      validateFields(['montoAproximadoReclamado'], { force: true });
    }, 1);
  };

  checkCobertura = async (rule, value, callback) => {
    const {
      agregarCobertura,
      ramos,
      coverages,
      fechaOcurrencia,
      dispatch,
      form: { getFieldValue }
    } = this.props;

    const { idePol } = this.props.poliza || {};
    const { numCert } = this.props.certificado || {};

    let ramoSeleccionado = '';

    if (agregarCobertura && !isEmpty(coverages)) {
      ramoSeleccionado = getFieldValue('ramo');
      const data = [];
      ramos.forEach(ramo => {
        const row = ramo.coberturas.map(item => ({
          idCobertura: item.idCobertura || item.ideCobert,
          codRamo: item.codRamo
        }));
        data.push(...row);
      });

      let notificar = false;
      data.forEach(item => {
        coverages.forEach(cobertura => {
          if (Number(item.idCobertura) === Number(cobertura.ideCobert) && Number(item.idCobertura) === Number(value)) {
            notificar = true;
          }
        });
      });

      if (notificar) {
        callback('Ya existe esta cobertura para el ramo seleccionado');
        return;
      }

      if (value && value.length === 0) {
        callback('Debe elegir una cobertura');
        return;
      }
    } else {
      if (!value || value.length === 0) {
        callback(ValidationMessage.REQUIRED);
        return;
      }
      ramoSeleccionado = this.props.form.getFieldValue('ramo')
        ? this.props.form.getFieldValue('ramo').split('|')[0]
        : undefined;
      const coberturasElegidasVisibles = this.props.selectedCobertura
        ? this.props.coberturasElegidas.filter(
            item => item.delete !== true && item.idCobertura !== this.props.selectedCobertura.idCobertura
          )
        : this.props.coberturasElegidas.filter(item => item.delete !== true);

      let existeCobertura = false;
      coberturasElegidasVisibles &&
        coberturasElegidasVisibles.forEach(cobElegida => {
          if (
            cobElegida.codRamo === ramoSeleccionado &&
            cobElegida.idCobertura &&
            cobElegida.idCobertura.toString() === value
          ) {
            existeCobertura = true;
          }
        });

      if (existeCobertura) {
        callback('Ya existe esta cobertura para el ramo seleccionado');
        return;
      }
    }

    const paramsValidacion = {
      idePol,
      numCert,
      codRamo: ramoSeleccionado,
      ideCobert: value,
      fecOcurr: moment.utc(fechaOcurrencia).format('YYYYMMDD')
    };

    try {
      this.setState({ validandoCobertura: true });
      const response = await servicioValidaCoberturaRimac(dispatch, paramsValidacion);
      this.setState({ validandoCobertura: false });

      if (response.code !== 'CRG-000') {
        callback('No se puede validar la cobertura seleccionada');
        return;
      }
      const msg = validaFechaDeOcurrencia(response.data);
      callback(msg);
    } catch (e) {
      this.setState({ validandoCobertura: false });
      callback('No se puede validar la cobertura seleccionada');
    }
  };

  render() {
    const { validandoCobertura } = this.state;
    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;

    const { loadingCrear, loadingGuardar, indCargaMasiva } = this.props;

    const esCMCoaseguro = indCargaMasiva === 'COA';
    const ramoError = isFieldTouched('ramo') && getFieldError('ramo');
    const coberturaError = isFieldTouched('cobertura') && getFieldError('cobertura');
    const montoAproximadoReclamadoError =
      isFieldTouched('montoAproximadoReclamado') && getFieldError('montoAproximadoReclamado');
    const causaError = isFieldTouched('causa') && getFieldError('causa');
    const consecuenciaError = isFieldTouched('consecuencia') && getFieldError('consecuencia');

    const coverages = this.props.coverages || [];
    const coveragesOptions = coverages.map(coverage => (
      <Select.Option
        key={coverage.ideCobert}
        value={coverage.ideCobert}
      >{`${coverage.codCobert} - ${coverage.dscCobert}`}</Select.Option>
    ));

    const causes = this.props.causes.causes;
    const causesOptions = causes.map(cause => (
      <Select.Option key={cause.codCausa} title={cause.dscCausa} value={cause.codCausa}>
        {cause.dscCausa}
      </Select.Option>
    ));

    const consequences = this.props.consequences.consequences;
    const consequencesOptions = consequences.map(consequence => (
      <Select.Option key={consequence.codConsecuencia} value={consequence.codConsecuencia}>
        {consequence.dscConsecuencia}
      </Select.Option>
    ));

    const ramos = this.props.branches.branches.map(branch => (
      <Select.Option key={branch.codRamo} value={branch.codRamo}>
        {branch.codRamo}
      </Select.Option>
    ));

    return (
      <Modal
        centered
        visible={this.props.visible}
        okButtonProps={{
          disabled:
            hasErrors(getFieldsError()) ||
            loadingCrear ||
            this.props.branches.isLoading ||
            loadingGuardar ||
            validandoCobertura,
          loading: loadingCrear || loadingGuardar || validandoCobertura
        }}
        cancelButtonProps={{
          disabled: loadingCrear
        }}
        okText={this.props.edit ? 'Actualizar' : 'Agregar'}
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        destroyOnClose
        maskClosable={false}
        width={700}
      >
        <h2>{this.props.edit ? 'Actualizar' : 'Agregar'} Cobertura</h2>
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <Form.Item label="Ramo" validateStatus={ramoError ? 'error' : ''} help={ramoError || ''}>
                {getFieldDecorator('ramo', {
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select
                    onChange={this.handleBranchChange}
                    placeholder="Seleccione ramo"
                    loading={this.props.branches.isLoading}
                    disabled={loadingCrear}
                  >
                    {ramos}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={16} lg={16} xl={16}>
              <Form.Item
                label="Cobertura"
                required
                validateStatus={coberturaError ? 'error' : ''}
                help={coberturaError || ''}
              >
                {getFieldDecorator('cobertura', {
                  rules: [{ validator: this.checkCobertura }]
                })(
                  <Select
                    placeholder="Seleccione cobertura"
                    onChange={this.handleCobertura}
                    disabled={loadingCrear}
                    loading={validandoCobertura}
                  >
                    {coveragesOptions}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={16} lg={8} xl={8}>
              <Form.Item label="Causa" validateStatus={causaError ? 'error' : ''} help={causaError || ''}>
                {getFieldDecorator('causa', {
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select
                    showSearch
                    placeholder="Seleccione causa"
                    loading={this.props.causes.isLoading}
                    disabled={loadingCrear}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {causesOptions}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <Form.Item
                label="Consecuencia"
                validateStatus={consecuenciaError ? 'error' : ''}
                help={consecuenciaError || ''}
              >
                {getFieldDecorator('consecuencia', {
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select
                    showSearch
                    placeholder="Seleccione consecuencia"
                    loading={this.props.consequences.isLoading}
                    disabled={loadingCrear}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {consequencesOptions}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <Form.Item
                label="Monto aproximado reclamado"
                required
                validateStatus={montoAproximadoReclamadoError ? 'error' : ''}
                help={montoAproximadoReclamadoError || ''}
              >
                {getFieldDecorator('montoAproximadoReclamado', {
                  rules: [{ validator: this.checkPrice }, { required: true }]
                })(
                  <PriceInput
                    currencyDisabled
                    moneyDisabled={loadingCrear || this.props.branches.isLoading || loadingGuardar || esCMCoaseguro}
                    err={montoAproximadoReclamadoError}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  loadingCrear: getCoberturaLoading(state),
  ramosYcoberturas: getRamosCoberturas(state),
  certificadoActual: getCertificado(state),
  siniestroRG: getDataSinister(state),
  causes: getCauses(state),
  consequences: getConsequences(state),
  coverages: getCoverages(state)
});

export default connect(mapStateToProps)(ModalForm);
