import React, { Component, Fragment } from 'react';
import { ROLE_TYPE } from 'constants/index';
import { Row, Card, Col, Input, Divider, Form } from 'antd';
import { ValidationMessage } from 'util/validation';
import PersonInfo from 'scenes/TaskTray/components/SectionDataCertificate/components/CertificateFormItem/components/AseguradoFormItem/components/PersonInfo/';
import ReplaceInsuredModal from 'components/Search';

class AseguradoFormItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.reinicioCampos = this.reinicioCampos.bind(this);
  }

  getDireccionNuevoAseguro = listDirecctions => {
    if (listDirecctions.length > 0) {
      const direccionActual = listDirecctions.filter(item => item.principal === 'X')[0] || undefined;
      return (
        (direccionActual && `${direccionActual.tipoVia} ${direccionActual.nombreVia} ${direccionActual.numeroVia}`) ||
        ''
      );
    }
    return '-';
  };

  AseguradoInfo = (tipoDoc, nuevoAsegurado) => {
    const { nombres, apePaterno, apeMaterno } = this.props;
    return tipoDoc === 'PE1' ? (
      <Col xs={24} sm={12} md={8} lg={6} xl={6}>
        <div className="claims-rrgg-description-list-index-term">Raz&oacute;n social</div>
        <div className="claims-rrgg-description-list-index-detail">
          <span>{(nuevoAsegurado && nuevoAsegurado.nomCompleto) || nombres}</span>
        </div>
      </Col>
    ) : (
      <PersonInfo nuevoAsegurado={nuevoAsegurado} nombres={nombres} apePaterno={apePaterno} apeMaterno={apeMaterno} />
    );
  };

  reinicioCampos() {
    const {
      form: { setFieldsValue }
    } = this.props;

    setFieldsValue({ emailAseguradoCertificate: '' });
  }

  render() {
    const {
      tipoDocumento,
      numId,
      email,
      dscTipoDocumento,
      numDocumento,
      direccion,
      flagModificar,
      disabledGeneral,
      idTarea,
      form,
      esCargaMasiva,
      tieneCertificado,
      esSiniestroPreventivo,
      validacionBotonReemplazarAsegurado: { habilitarBotonReemplazarAsegurado, mostrarBotonReemplazarAsegurado },
      validacionInputEmailAsegurado: {
        requerirInputEmailAsegurado,
        habilitarInputEmailAsegurado,
        mostrarInputEmailAsegurado
      },
      form: { getFieldDecorator, getFieldValue },
      // klrojas coaseguro ---->
      esCMCoaseguro
    } = this.props;
    const nuevoAsegurado =
      (getFieldValue('nuevoAsegurado') && getFieldValue('nuevoAsegurado').terceroElegido) || undefined;
    const tipoDoc = (nuevoAsegurado && nuevoAsegurado.tipoDocumento) || tipoDocumento;
    const cerrarSiniestroValue = getFieldValue('indCerrarSiniestro');

    // Validacion
    const boolHabilitarBotonReemplazarAsegurado = habilitarBotonReemplazarAsegurado({ esSiniestroPreventivo });
    const boolMostrarBotonReemplazarAsegurado = mostrarBotonReemplazarAsegurado({
      idTarea,
      flagModificar,
      tieneCertificado
    });
    const boolRequerirInputEmailAsegurado = requerirInputEmailAsegurado({
      cerrarSiniestroValue,
      esCMCoaseguro
    });
    const boolHabilitarInputEmailAsegurado = habilitarInputEmailAsegurado({
      idTarea,
      esSiniestroPreventivo,
      flagModificar,
      cerrarSiniestroValue
    });
    const boolMostrarInputEmailAsegurado = mostrarInputEmailAsegurado({
      nuevoAsegurado,
      correoAsegurado: email,
      esCargaMasiva
    });
    // Fin validacion

    return (
      <Fragment>
        <Divider style={{ color: '#919191', fontWeight: 'bold' }} orientation="left">
          Asegurado
        </Divider>
        <Fragment>
          <Card
            title={
              boolMostrarBotonReemplazarAsegurado && (
                <Form.Item>
                  {getFieldDecorator('nuevoAsegurado', {})(
                    <ReplaceInsuredModal
                      roleType={ROLE_TYPE.ASEGURADO}
                      disabledGeneral={disabledGeneral || !boolHabilitarBotonReemplazarAsegurado}
                      fromAseguradoFormItem
                      form={form}
                      cerrarSiniestroValue={cerrarSiniestroValue}
                      reinicioCampos={this.reinicioCampos}
                    />
                  )}
                </Form.Item>
              )
            }
          >
            <Row gutter={24}>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <div className="claims-rrgg-description-list-index-term">C&oacute;digo asegurado</div>
                <div className="claims-rrgg-description-list-index-detail">
                  <span>{(nuevoAsegurado && nuevoAsegurado.codExterno) || numId}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <div className="claims-rrgg-description-list-index-term">Tipo documento</div>
                <div className="claims-rrgg-description-list-index-detail">
                  <span>{(nuevoAsegurado && nuevoAsegurado.dscTipoDocumento) || dscTipoDocumento}</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <div className="claims-rrgg-description-list-index-term">Nro. Documento</div>
                <div className="claims-rrgg-description-list-index-detail">
                  <span>{(nuevoAsegurado && nuevoAsegurado.numDocumento) || numDocumento}</span>
                </div>
              </Col>
              {this.AseguradoInfo(tipoDoc, nuevoAsegurado)}
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <div className="claims-rrgg-description-list-index-term">Direcci&oacute;n</div>
                <div className="claims-rrgg-description-list-index-detail">
                  <span>
                    {(nuevoAsegurado && this.getDireccionNuevoAseguro(nuevoAsegurado.direccion)) || direccion}
                  </span>
                </div>
              </Col>
              {boolMostrarInputEmailAsegurado && (
                <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Form.Item label="E-mail">
                    {getFieldDecorator('emailAseguradoCertificate', {
                      // validateTrigger: 'onBlur',
                      initialValue: '',
                      rules: [
                        {
                          type: cerrarSiniestroValue ? 'string' : 'email',
                          message: ValidationMessage.NOT_VALID
                        },
                        {
                          required: boolRequerirInputEmailAsegurado,
                          message: ValidationMessage.REQUIRED
                        }
                      ]
                    })(
                      <Input
                        placeholder="Ingrese e-mail"
                        disabled={disabledGeneral || !boolHabilitarInputEmailAsegurado}
                      />
                    )}
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Card>
        </Fragment>
      </Fragment>
    );
  }
}

export default AseguradoFormItem;
