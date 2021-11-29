import React from 'react';
import { Form, Row, Col, Input, DatePicker, Select, Button, Icon, Radio, Card, Tooltip, Switch } from 'antd';
import { hasErrors } from 'util/index';
import moment from 'moment';
import { connect } from 'react-redux';
import PolizaFormItem from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/PolizaFormItem/index';
import CertificadoFormItem from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/CertificadoFormItem/index';
import CoberturaFormItem from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/CoberturaFormItem/index';
import DireccionFormItem from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/DireccionesFormItem/index';
import { fetchRG } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRG/action';
import { fetchRGDuplicado } from 'scenes/TaskTray/scenes/SiniestroDuplicado/data/consultarRGDuplicado/action';

import PolizaCore from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/PolizaCore/index';
import CertificadoCore from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/CertificadoCore/index';
import CoberturaCore from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/CoberturaCore/index';
import DireccionCore from 'scenes/TaskTray/scenes/ValidarSiniestroDuplicado/component/DireccionCore/index';

import { ValidationMessage } from 'util/validation';
import { CONSTANTS_APP } from 'constants/index';
import './styles.css';

const { Option } = Select;

class ValidarSiniestroDuplicado extends React.Component {
  state = {
    loadingPoliza: true,
    loadingCertificado: false,
    loadingDireccion: false,
    loadingCobertura: false,
    loadingSiniestro: false
  };

  onChangePoliza = checked => {
    this.setState({
      loadingPoliza: checked
    });
  };

  onChangeCertificado = checked => {
    this.setState({
      loadingCertificado: checked
    });
  };

  onChangeDireccion = checked => {
    this.setState({
      loadingDireccion: checked
    });
  };

  onChangeCobertura = checked => {
    this.setState({
      loadingCobertura: checked
    });
  };

  onChangeSiniestro = checked => {
    this.setState({
      loadingSiniestro: checked
    });
  };

  render() {
    const {
      form: { getFieldError, getFieldDecorator, getFieldsError }
    } = this.props;

    const { loadingPoliza, loadingCertificado, loadingDireccion, loadingCobertura, loadingSiniestro } = this.state;

    const polizaError = getFieldError('poliza');
    const certificadoError = getFieldError('certificado');
    const fechadeocurrenciaError = getFieldError('fechadeocurrencia');
    const descripcionSiniestroError = getFieldError('descripcionSiniestro');
    const tipoPerdidaError = getFieldError('tipoPerdida');
    const medioTransporteError = getFieldError('medioTransporte');
    const detallePerdidaError = getFieldError('detallePerdida');
    const tipoEventoError = getFieldError('tipoEvento');
    const direccionError = getFieldError('direccion');
    const coberturasError = getFieldError('coberturas');
    const nombreCompletoError = getFieldError('nombreCompleto');
    const correoElectronicoError = getFieldError('correoElectronico');
    const telefonoError = getFieldError('telefono');
    const nombreCompleto1Error = getFieldError('nombreCompleto1');
    const correoElectronico1Error = getFieldError('correoElectronico1');
    const telefono1Error = getFieldError('telefono1');
    const nombreCompleto2Error = getFieldError('nombreCompleto2');
    const correoElectronico2Error = getFieldError('correoElectronico2');
    const telefono2Error = getFieldError('telefono2');
    const ajustadorError = getFieldError('ajustador');

    return (
      <div>
        <Form>
          <h1>Validar Siniestro Duplicado (TAREA)</h1>
          <h3>N&uacute;mero de caso: RG19009999</h3>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24} style={{ textAlign: 'right' }}>
              <Button type="primary" shape="round" style={{ backgroundColor: '#1e8e3e', borderColor: '#1e8e3e' }}>
                Tomar tarea
              </Button>
            </Col>
          </Row>
          <div className="seccion_claims">
            <Row gutter={24}>
              <h2>Datos de p&oacute;liza y certificado</h2>
              <Col span={24} style={{ marginBottom: '20px' }}>
                <Form.Item
                  label="Póliza (Nuevo)"
                  required
                  validateStatus={polizaError ? 'error' : ''}
                  help={polizaError || ''}
                >
                  {getFieldDecorator('poliza')(
                    <PolizaFormItem onChangePoliza={this.onChangePoliza} loadingPoliza={loadingPoliza} />
                  )}
                </Form.Item>
              </Col>
              {loadingPoliza && (
                <Col span={24} style={{ marginBottom: '20px' }}>
                  <Form.Item label="Póliza (Core)">
                    <Card>
                      <PolizaCore />
                    </Card>
                  </Form.Item>
                </Col>
              )}
              <Col span={24} style={{ marginBottom: '20px' }}>
                <Form.Item
                  label="Certificado (Nuevo)"
                  required
                  validateStatus={certificadoError ? 'error' : ''}
                  help={certificadoError || ''}
                >
                  {getFieldDecorator('certificado', {
                    rules: [{ validator: this.checkCertificado }]
                  })(
                    <CertificadoFormItem
                      onChangeCertificado={this.onChangeCertificado}
                      loadingCertificado={loadingCertificado}
                    />
                  )}
                </Form.Item>
              </Col>
              {loadingCertificado && (
                <Col span={24} style={{ marginBottom: '20px' }}>
                  <Form.Item label="Certificado (Core)">
                    <Card>
                      <CertificadoCore />
                    </Card>
                  </Form.Item>
                </Col>
              )}
            </Row>
          </div>
          <div className="seccion_claims">
            <h2>Datos del Siniestro</h2>
            <Form.Item label="Siniestro (nuevo)">
              <Card
                extra={
                  <Tooltip
                    placement="left"
                    title={loadingSiniestro ? 'Ocultar cobertura del Core' : 'Mostar cobertura del Core'}
                  >
                    <Switch
                      checked={loadingSiniestro}
                      onChange={this.onChangeSiniestro}
                      checkedChildren={<Icon type="down" />}
                      unCheckedChildren={<Icon type="right" />}
                    />
                  </Tooltip>
                }
              >
                <Row gutter={24}>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <div className="claims-rrgg-description-list-index-term">Tipo de siniestro</div>
                    <div className="claims-rrgg-description-list-index-detail">Normal</div>
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Item
                      label="Fecha de ocurrencia"
                      validateStatus={fechadeocurrenciaError ? 'error' : ''}
                      help={fechadeocurrenciaError || ''}
                    >
                      {getFieldDecorator('fechadeocurrencia', {
                        initialValue: moment(),
                        rules: [{ validator: this.checkFechaOcurrencia }]
                      })(<DatePicker format={CONSTANTS_APP.FORMAT_DATE} disabled />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <div className="claims-rrgg-description-list-index-term">Fecha de aviso</div>
                    <div className="claims-rrgg-description-list-index-detail">14/15/2019</div>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                      label="Descripción del siniestro"
                      validateStatus={descripcionSiniestroError ? 'error' : ''}
                      help={descripcionSiniestroError || ''}
                    >
                      {getFieldDecorator('descripcionSiniestro', {
                        initialValue: 'Dato no completado - nombreDato',
                        rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                      })(
                        <Input.TextArea
                          placeholder="Ingrese descripción del siniestro / bienes afectados"
                          maxLength={200}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <React.Fragment>
                    {false && (
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div className="claims-rrgg-description-list-index-term">Empresa de transporte</div>
                          <div className="claims-rrgg-description-list-index-detail">Emtrafesa</div>
                        </Col>
                      ) && (
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div className="claims-rrgg-description-list-index-term">Nombre del chofer</div>
                          <div className="claims-rrgg-description-list-index-detail">Jose</div>
                        </Col>
                      ) && (
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div className="claims-rrgg-description-list-index-term">Placa</div>
                          <div className="claims-rrgg-description-list-index-detail">XTS-145</div>
                        </Col>
                      ) && (
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <Form.Item
                            label="Medio de transporte"
                            validateStatus={medioTransporteError ? 'error' : ''}
                            help={medioTransporteError || ''}
                          >
                            {getFieldDecorator('medioTransporte', {
                              initialValue: 1,
                              rules: [
                                {
                                  required: true,
                                  message: ValidationMessage.REQUIRED
                                }
                              ]
                            })(
                              <Select placeholder="Seleccione medio transporte">
                                <Option value={1}> Vía terrestre </Option>
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                      )}
                  </React.Fragment>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <div className="claims-rrgg-description-list-index-term">Terceros afectados</div>
                    <div className="claims-rrgg-description-list-index-detail">NO</div>
                  </Col>
                  {false && (
                      <React.Fragment>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <Form.Item
                            label="Tipo de pérdida"
                            validateStatus={tipoPerdidaError ? 'error' : ''}
                            help={tipoPerdidaError || ''}
                          >
                            {getFieldDecorator('tipoPerdida', {
                              initialValue: '1',
                              rules: [
                                {
                                  required: true,
                                  message: ValidationMessage.REQUIRED
                                }
                              ]
                            })(
                              <Select placeholder="Seleccione tipo de pérdida">
                                <Option value="1"> Total </Option>
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <Form.Item
                            label="Detalle de la pérdida"
                            validateStatus={detallePerdidaError ? 'error' : ''}
                            help={detallePerdidaError || ''}
                          >
                            {getFieldDecorator('detallePerdida', {
                              initialValue: 1,
                              rules: [
                                {
                                  required: true,
                                  message: ValidationMessage.REQUIRED
                                }
                              ]
                            })(
                              <Select placeholder="Seleccione detalle de pérdida">
                                <Option value={1}> Se ha perdido </Option>
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                      </React.Fragment>
                    ) && (
                      <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                          label="Tipo de evento"
                          validateStatus={tipoEventoError ? 'error' : ''}
                          help={tipoEventoError || ''}
                        >
                          {getFieldDecorator('tipoEvento', {
                            initialValue: 1,
                            rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                          })(
                            <Select placeholder="Selecccione tipo de evento">
                              <Option value={1}> Tipo evento </Option>
                            </Select>
                          )}
                        </Form.Item>
                      </Col>
                    ) && (
                      <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item label="Prevención fraude">
                          {getFieldDecorator('prevencionFraude', {
                            initialValue: 'N',
                            rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                          })(
                            <Radio.Group>
                              <Radio value="S">Si</Radio>
                              <Radio value="N">No</Radio>
                            </Radio.Group>
                          )}
                        </Form.Item>
                      </Col>
                    )}
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item label="Tipo evento catastrófico">
                      {getFieldDecorator('tipoEventoCatastrofico', {
                        initialValue: 'Texto del tipo del evento catasfrófico'
                      })(<Input.TextArea placeholder="Ingrese" maxLength={200} disabled />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Form.Item>
            <br />
            {loadingSiniestro && (
              <Form.Item label="Siniestro (Core)">
                <Card>
                  <Row gutter={24}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                      <div className="claims-rrgg-description-list-index-term">Tipo de siniestro</div>
                      <div className="claims-rrgg-description-list-index-detail">Normal</div>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                      <Form.Item label="Fecha de ocurrencia">
                        {getFieldDecorator('fechadeocurrencia', {
                          initialValue: moment()
                        })(<DatePicker format={CONSTANTS_APP.FORMAT_DATE} disabled />)}
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                      <div className="claims-rrgg-description-list-index-term">Fecha de aviso</div>
                      <div className="claims-rrgg-description-list-index-detail">14/15/2019</div>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item label="Descripción del siniestro">
                        {getFieldDecorator('descripcionSiniestro', {
                          initialValue: 'Dato no completado - nombreDato'
                        })(
                          <Input.TextArea
                            placeholder="Ingrese descripción del siniestro / bienes afectados"
                            maxLength={200}
                            disabled
                          />
                        )}
                      </Form.Item>
                    </Col>
                    {false && (
                      <React.Fragment>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div className="claims-rrgg-description-list-index-term">Empresa de transporte</div>
                          <div className="claims-rrgg-description-list-index-detail">Emtrafesa</div>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div className="claims-rrgg-description-list-index-term">Nombre del chofer</div>
                          <div className="claims-rrgg-description-list-index-detail">Jose</div>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <div className="claims-rrgg-description-list-index-term">Placa</div>
                          <div className="claims-rrgg-description-list-index-detail">XTS-145</div>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <Form.Item label="Medio de transporte">
                            {getFieldDecorator('medioTransporte', {
                              initialValue: 1
                            })(
                              <Select placeholder="Seleccione medio transporte" disabled>
                                <Option value={1}> Vía terrestre </Option>
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                      </React.Fragment>
                    )}
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <div className="claims-rrgg-description-list-index-term">Terceros afectados</div>
                      <div className="claims-rrgg-description-list-index-detail">NO</div>
                    </Col>
                    {false && (
                        <React.Fragment>
                          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Form.Item label="Tipo de pérdida">
                              {getFieldDecorator('tipoPerdida', {
                                initialValue: '1'
                              })(
                                <Select placeholder="Seleccione tipo de pérdida" disabled>
                                  <Option value="1">Total</Option>
                                </Select>
                              )}
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Form.Item label="Detalle de la pérdida">
                              {getFieldDecorator('detallePerdida', {
                                initialValue: 1
                              })(
                                <Select placeholder="Seleccione detalle de pérdida" disabled>
                                  <Option value={1}> Se ha perdido </Option>
                                </Select>
                              )}
                            </Form.Item>
                          </Col>
                        </React.Fragment>
                      ) && (
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <Form.Item label="Tipo de evento">
                            {getFieldDecorator('tipoEvento', {
                              initialValue: 1
                            })(
                              <Select placeholder="Selecccione tipo de evento" disabled>
                                <Option value={1}> Tipo evento </Option>
                              </Select>
                            )}
                          </Form.Item>
                        </Col>
                      ) && (
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                          <Form.Item label="Prevención fraude">
                            {getFieldDecorator('prevencionFraude', {
                              initialValue: 'N'
                            })(
                              <Radio.Group disabled>
                                <Radio value="S">Si</Radio>
                                <Radio value="N">No</Radio>
                              </Radio.Group>
                            )}
                          </Form.Item>
                        </Col>
                      )}
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                      <Form.Item label="Tipo evento catastrófico">
                        {getFieldDecorator('tipoEventoCatastrofico', {
                          initialValue: 'Texto del tipo del evento catasfrófico'
                        })(<Input.TextArea placeholder="Ingresebienes afectados" maxLength={200} disabled />)}
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Form.Item>
            )}
          </div>

          <div className="seccion_claims">
            <Row gutter={24}>
              <Col>
                <h2>Dirección del siniestro</h2>
              </Col>
              <Col span={24} style={{ marginBottom: '20px' }}>
                <Form.Item
                  label="Dirección (Nuevo)"
                  required
                  validateStatus={direccionError ? 'error' : ''}
                  help={direccionError || ''}
                >
                  {getFieldDecorator('direccion')(
                    <DireccionFormItem onChangeDireccion={this.onChangeDireccion} loadingDireccion={loadingDireccion} />
                  )}
                </Form.Item>
              </Col>
              {loadingDireccion && (
                <Col span={24} style={{ marginBottom: '20px' }}>
                  <Form.Item label="Dirección (Core)">
                    <DireccionCore />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </div>

          <div className="seccion_claims">
            <Row gutter={24}>
              <Col>
                <h2>Datos de cobertura</h2>
              </Col>
              <Col span={24} style={{ marginBottom: '20px' }}>
                <Form.Item
                  label="Coberturas (Nuevo)"
                  required
                  validateStatus={coberturasError ? 'error' : ''}
                  help={coberturasError || ''}
                >
                  {getFieldDecorator('coberturas', {
                    rules: [{ validator: this.checkCobertura }]
                  })(
                    <CoberturaFormItem onChangeCobertura={this.onChangeCobertura} loadingCobertura={loadingCobertura} />
                  )}
                </Form.Item>
              </Col>
              {loadingCobertura && (
                <Col span={24} style={{ marginBottom: '20px' }}>
                  <Form.Item label="Coberturas (Core)">
                    <Card>
                      <CoberturaCore />
                    </Card>
                  </Form.Item>
                </Col>
              )}
            </Row>
          </div>

          <div className="seccion_claims">
            <Row gutter={24}>
              <Col>
                <h2>Datos adicionales</h2>
                <h3>Datos de contacto para las notificaciones</h3>
                <Row gutter={24} align="bottom">
                  <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={3}
                    xl={3}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.85)'
                    }}
                  >
                    <p style={{ marginBottom: '25px' }}>Asegurado</p>
                  </Col>
                  <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                    <Form.Item
                      label="Nombre completo"
                      validateStatus={nombreCompletoError ? 'error' : ''}
                      help={nombreCompletoError || ''}
                    >
                      {getFieldDecorator('nombreCompleto', {
                        rules: [
                          {
                            type: 'string',
                            message: ValidationMessage.NOT_VALID,
                            pattern: /^[^0-9]+$/
                          },
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input placeholder="Ingrese nombre" maxLength={1000} />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                    <Form.Item
                      label="Correo electrónico"
                      validateStatus={correoElectronicoError ? 'error' : ''}
                      help={correoElectronicoError || ''}
                    >
                      {getFieldDecorator('correoElectronico', {
                        rules: [
                          {
                            type: 'email',
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: false,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input placeholder="Ingrese correo" maxLength={1000} />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={4} lg={7} xl={7}>
                    <Form.Item
                      label="Teléfono"
                      validateStatus={telefonoError ? 'error' : ''}
                      help={telefonoError || ''}
                    >
                      {getFieldDecorator('telefono', {
                        rules: [
                          {
                            type: 'string',
                            message: ValidationMessage.NOT_VALID,
                            pattern: CONSTANTS_APP.REGEX.TELEFONO
                          },
                          {
                            required: true,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input placeholder="Ingrese teléfono" maxLength={9} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24} align="bottom">
                  <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={3}
                    xl={3}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.85)'
                    }}
                  >
                    <p style={{ marginBottom: '25px' }}>Corredor</p>
                  </Col>
                  <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                    <Form.Item
                      label="Nombre completo"
                      validateStatus={nombreCompleto1Error ? 'error' : ''}
                      help={nombreCompleto1Error || ''}
                    >
                      {getFieldDecorator('nombreCompleto1', {
                        rules: [
                          {
                            type: 'string',
                            message: ValidationMessage.NOT_VALID,
                            pattern: /^[^0-9]+$/
                          },
                          {
                            required: false,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input placeholder="Ingrese nombre" maxLength={1000} />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                    <Form.Item
                      label="Correo electrónico"
                      validateStatus={correoElectronico1Error ? 'error' : ''}
                      help={correoElectronico1Error || ''}
                    >
                      {getFieldDecorator('correoElectronico1', {
                        rules: [
                          {
                            type: 'email',
                            message: ValidationMessage.NOT_VALID
                          },
                          {
                            required: false,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input placeholder="Ingrese correo" maxLength={1000} />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={4} lg={7} xl={7}>
                    <Form.Item
                      label="Teléfono"
                      validateStatus={telefono1Error ? 'error' : ''}
                      help={telefono1Error || ''}
                    >
                      {getFieldDecorator('telefono1', {
                        rules: [
                          {
                            type: 'string',
                            message: ValidationMessage.NOT_VALID,
                            pattern: CONSTANTS_APP.REGEX.TELEFONO
                          },
                          {
                            required: false,
                            message: ValidationMessage.REQUIRED
                          }
                        ]
                      })(<Input placeholder="Ingrese teléfono" maxLength={9} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24} align="bottom">
                  <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={3}
                    xl={3}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: 'rgba(0, 0, 0, 0.85)'
                    }}
                  >
                    <p style={{ marginBottom: '25px' }}>Preventor</p>
                  </Col>
                  <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                    <Form.Item
                      label="Nombre completo"
                      validateStatus={nombreCompleto2Error ? 'error' : ''}
                      help={nombreCompleto2Error || ''}
                    >
                      {getFieldDecorator('nombreCompleto2', {
                        rules: [
                          {
                            type: 'string',
                            message: ValidationMessage.NOT_VALID,
                            pattern: /^[^0-9]+$/
                          }
                        ]
                      })(<Input placeholder="Ingrese nombre" maxLength={1000} />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={10} lg={7} xl={7}>
                    <Form.Item
                      label="Correo electrónico"
                      validateStatus={correoElectronico2Error ? 'error' : ''}
                      help={correoElectronico2Error || ''}
                    >
                      {getFieldDecorator('correoElectronico2', {
                        rules: [
                          {
                            type: 'email',
                            message: 'La entrada no es válida'
                          }
                        ]
                      })(<Input placeholder="Ingrese correo" maxLength={100} />)}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={4} lg={7} xl={7}>
                    <Form.Item
                      label="Teléfono"
                      validateStatus={telefono2Error ? 'error' : ''}
                      help={telefono2Error || ''}
                    >
                      {getFieldDecorator('telefono2', {
                        rules: [
                          {
                            type: 'string',
                            message: ValidationMessage.NOT_VALID,
                            pattern: CONSTANTS_APP.REGEX.TELEFONO
                          }
                        ]
                      })(<Input placeholder="Ingrese teléfono" maxLength={9} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col>
                <h3>Seleccionar ajustador</h3>
              </Col>
              <Col xs={24} sm={24} md={12} lg={8} xl={10}>
                <Form.Item label="Ajustador" validateStatus={ajustadorError ? 'error' : ''} help={ajustadorError || ''}>
                  {getFieldDecorator('ajustador', {
                    initialValue: '1',
                    rules: [
                      {
                        required: false,
                        message: ValidationMessage.REQUIRED
                      }
                    ]
                  })(
                    <Select placeholder="Seleccione ajustador" disabled>
                      <Option value="1"> CHARLES & TAYLOR </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </div>
          <Row style={{ marginBottom: '20px', paddingBottom: '20px' }}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button type="secondary" onClick={this.redirectToTarget}>
                Cancelar
                <Icon type="close-circle" />
              </Button>
              <Button style={{ marginLeft: 8 }}>Anular</Button>
              <Button type="secondary" style={{ marginLeft: 8 }}>
                Guardar
                <Icon type="save" />
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                onClick={this.showConfirm}
                disabled={hasErrors(getFieldsError())}
              >
                Completar
                <Icon type="check-circle" />
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getSiniestro: id => dispatch(fetchRG(id)),
  getSiniestroDuplicado: id => dispatch(fetchRGDuplicado(id))
});

const Main = connect(
  null,
  mapDispatchToProps
)(ValidarSiniestroDuplicado);

export default Form.create({ name: 'validar_siniestro_duplicado' })(Main);
