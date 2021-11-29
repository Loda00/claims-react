import React, { Component, Fragment } from 'react';
import { Input, Modal, Select, Form, Col, Row, Spin } from 'antd';
import { connect } from 'react-redux';
import currency from 'currency.js';
import PriceInputNoSymbol from 'components/PriceInputNoSymbol';
import { hasErrors, showErrorMessage } from 'util/index';
import { ValidationMessage } from 'util/validation';
import { getIsLoading } from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/OtherConceptsFormItem/data/maintenanceConcept/reducer';
import { getTipoCargaMasiva } from 'scenes/TaskTray/components/SectionDataSinister/data/dataSinister/reducer';

class OtherConceptsModal extends Component {
  async componentDidMount() {
    const {
      form: { validateFields }
    } = this.props;
    try {
      validateFields();
    } catch (e) {
      showErrorMessage(e.message);
    }
  }

  onOkModal = async () => {
    const {
      editConcept,
      branches,
      concepts,
      onOkModalHadler,
      form: { validateFields }
    } = this.props;
    try {
      const value = await validateFields();
      const { mtoTotalPagos, mtoHonorarioCalculado, mtoReserva } = editConcept || {};
      const concepto = concepts.concepts.filter(item => item.valor === value.codConcepto)[0];
      const ramo = branches.filter(item => item.idRamo === value.idRamo)[0];
      const mtoModif = mtoReserva !== value.mtoReserva.number ? 'S' : 'N';
      value.codConcepto = concepto.valor;
      value.dscConcepto = concepto.descripcion;
      value.key = ramo.codRamo + concepto.valor;
      value.codRamo = ramo.codRamo;
      value.mtoTotalPagos = mtoTotalPagos || 0;
      value.mtoHonorarioCalculado = mtoHonorarioCalculado || 0;
      value.mtoReserva = value.mtoReserva.number;
      value.mtoModif = mtoModif;
      value.estado = (editConcept || {}).estado || '';
      onOkModalHadler(value);
    } catch (err) {
      showErrorMessage(String('Error en la validacion de los campos'));
    }
  };

  onCancelModal = () => {
    const { onCancelModalHandler } = this.props;
    onCancelModalHandler();
  };

  checkPrice = (rule, value, callback) => {
    // : { mtoTotalPagos = 0 } = {}
    const { editConcept } = this.props;

    if (typeof value === 'undefined') {
      callback(ValidationMessage.REQUIRED);
      return;
    }
    if (typeof value.number === 'undefined') {
      callback('Ingrese monto reserva');
      return;
    }

    if (typeof value !== 'undefined' && value.number <= 0) {
      callback('El monto debe ser mayor a cero');
      return;
    }

    const montoTotalPagos = (editConcept || {}).mtoTotalPagos || 0;
    if (value.number < montoTotalPagos) {
      callback('La reserva debe ser mayor o igual al total de pagos');
      return;
    }
    callback();
  };

  validarRamo = async (rule, value, callback) => {
    const {
      form: { validateFields }
    } = this.props;
    validateFields(['codConcepto']);
    callback();
  };

  validarConcepto = (rule, value, callback) => {
    const {
      otrosConceptos,
      editConcept,
      ajustadorRequerido,
      form: { getFieldValue }
    } = this.props;

    const ramoSeleccionado = getFieldValue('idRamo');

    if (!editConcept) {
      if (ajustadorRequerido === 'N' && value === '001') {
        callback('Se requiere ajustador para este concepto');
      }

      const validacionDuplicidad = otrosConceptos.some(
        concepto => concepto.idRamo + concepto.codConcepto === ramoSeleccionado + value
      );
      if (validacionDuplicidad) {
        callback('Reserva del concepto ya registrada');
      }
    }
    callback();
  };

  SelectOtherConceptsModal = () => {};

  render() {
    const {
      concepts,
      branches,
      isLoadingBranches,
      editConcept,
      isLoading,
      afterCloseModalHandler,
      modalVisible,
      moneda,
      tipoCargaMasiva,
      form: { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError }
    } = this.props;

    const codConceptoError = isFieldTouched('codConcepto') && getFieldError('codConcepto');
    const idRamoError = isFieldTouched('idRamo') && getFieldError('idRamo');
    const mtoReserva = isFieldTouched('mtoReserva') && getFieldError('mtoReserva');
    const mtoReservaMsgError = (getFieldError('mtoReserva') && getFieldError('mtoReserva')[0]) || '';

    const conceptosFiltrado = (concepts.concepts || []).filter(concepto => {
      const filtroAjustadorEnCargaMasiva = ['COA', 'PT'];
      return filtroAjustadorEnCargaMasiva.includes(tipoCargaMasiva) ? concepto.valor === '001' : true;
    });

    const valorInicialConcepto = (editConcept, conceptosFiltrado) => {
      if (editConcept) {
        return editConcept.codConcepto;
      }

      if (conceptosFiltrado.length === 1) {
        return conceptosFiltrado[0].valor;
      }

      return undefined;
    };

    return (
      <Fragment>
        <Modal
          centered
          visible={modalVisible}
          okButtonProps={{
            'data-cy': 'boton_aceptar_editar_concepto',
            disabled: hasErrors(getFieldsError()) || isLoading
          }}
          cancelButtonProps={{
            disabled: isLoading
          }}
          onOk={this.onOkModal}
          okText={editConcept ? 'Modificar' : 'Agregar'}
          onCancel={this.onCancelModal}
          afterClose={afterCloseModalHandler}
          destroyOnClose
        >
          <Spin spinning={isLoading}>
            <Form>
              <h2>{(editConcept !== null && 'Modificar') || 'Agregar'} Concepto</h2>
              <Row gutter={32}>
                <Col xs={24} md={12} lg={8} xl={8} xxl={8}>
                  {getFieldDecorator('key', {
                    initialValue: editConcept !== null ? editConcept.key : undefined
                  })(<Input type="hidden" />)}
                  {getFieldDecorator('action', {
                    initialValue: editConcept !== null ? 'U' : 'N'
                  })(<Input type="hidden" />)}
                  {getFieldDecorator('idOtrosConceptos', {
                    initialValue: (editConcept && editConcept.idOtrosConceptos) || undefined
                  })(<Input type="hidden" />)}
                  <Form.Item label="Ramo" validateStatus={idRamoError ? 'error' : ''} help={idRamoError || ''}>
                    {getFieldDecorator('idRamo', {
                      initialValue:
                        (branches && branches.length === 1 && branches[0].idRamo) ||
                        ((editConcept && editConcept.idRamo) || undefined),
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        },
                        {
                          validator: this.validarRamo
                        }
                      ]
                    })(
                      <Select loading={isLoadingBranches} placeholder="Seleccione ramo" disabled={!!editConcept}>
                        {branches.map(branch => {
                          return (
                            <Select.Option key={branch.idRamo} value={branch.idRamo}>
                              {branch.codRamo}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col xs={24} md={12} lg={12} xl={12} xxl={12}>
                  <Form.Item
                    label="Concepto"
                    validateStatus={codConceptoError ? 'error' : ''}
                    help={codConceptoError || ''}
                  >
                    {getFieldDecorator('codConcepto', {
                      initialValue: valorInicialConcepto(editConcept, conceptosFiltrado),
                      rules: [
                        {
                          required: true,
                          message: ValidationMessage.REQUIRED
                        },
                        {
                          validator: this.validarConcepto
                        }
                      ]
                    })(
                      <Select loading={isLoading} placeholder="Seleccione concepto" disabled={!!editConcept}>
                        {conceptosFiltrado.map(concept => {
                          return (
                            <Select.Option key={concept.valor} value={concept.valor}>
                              {concept.descripcion}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} md={8} lg={8} xl={8} xxl={8}>
                  <Form.Item
                    label="Monto reserva"
                    required
                    validateStatus={mtoReserva ? 'error' : ''}
                    help={(mtoReserva && mtoReservaMsgError) || ''}
                    extra={
                      editConcept &&
                      (editConcept.mtoTotalPagos || 0) > 0 && (
                        <span>T. Pagos: {`${moneda} ${currency(editConcept.mtoTotalPagos).format()}`}</span>
                      )
                    }
                  >
                    {getFieldDecorator('mtoReserva', {
                      initialValue: {
                        number: (editConcept && editConcept.mtoReserva) || undefined
                      },
                      rules: [{ validator: this.checkPrice }]
                    })(<PriceInputNoSymbol placeholder="0" />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Modal>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  const isLoading = getIsLoading(state);
  const tipoCargaMasiva = getTipoCargaMasiva(state);
  return {
    tipoCargaMasiva,
    isLoading
  };
};

export default connect(mapStateToProps)(Form.create({ name: 'OtherConceptsModal' })(OtherConceptsModal));
