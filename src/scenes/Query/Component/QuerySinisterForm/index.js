/* eslint-disable react/destructuring-assignment */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/sort-comp */
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Form, Row, Col, Input, Button, DatePicker, Select, notification, Modal } from 'antd';
import SearchAndInput from 'components/InsuredInput/index';
import ReactExport from 'react-data-export';
import { showErrorMessage, hasErrors, hasValues, modalConfirmacionReintentar } from 'util/index';
import { ValidationMessage } from 'util/validation';
import { CONSTANTS_APP, ROLE_TYPE } from 'constants/index';
import { getSearchSinister } from 'scenes/Query/data/searchSinister/reducer';
import * as productoActionCreators from 'scenes/data/productos/action';
import * as stateSinisterActionCreators from 'scenes/Query/data/stateSinister/action';
import * as searchSinisterActionCreators from 'scenes/Query/data/searchSinister/action';
import * as searchSinisterExportCreators from 'scenes/Query/data/searchSinister/action';
import * as teamsActionCreators from 'scenes/data/teams/action';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
class QuerySinisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataExp: [],
      certificadoDisabled: true
    };
  }

  triggerChange = changedValue => {
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  componentDidMount() {
    this.props.form.validateFields((error, values) => {
      if (values.numeroDePoliza >= 4 && !error.numeroDePoliza) {
        this.setState({
          certificadoDisabled: false
        });
      } else {
        this.setState({
          certificadoDisabled: true
        });
      }
    });
    this.props.dispatch(productoActionCreators.fetchProducts()).finally(resp => {
      if (this.props.errorProducto) {
        showErrorMessage(this.props.errorProducto.message);
      }
    });
    this.props.dispatch(stateSinisterActionCreators.fetchStateSinister()).finally(resp => {
      if (this.props.errorStateSinister) {
        showErrorMessage(this.props.errorStateSinister.message);
      }
    });
    this.props.dispatch(teamsActionCreators.fetchTeams()).finally(resp => {
      if (this.props.errorTeams) {
        showErrorMessage(this.props.errorTeams.message);
      }
    });

    this.props.limpiarAlAnularReaperturar(this.handleReset.bind(this));
  }

  onChangePoliza = evt => {
    const valueCertificate = evt.target.value;
    this.props.form.validateFields((error, values) => {
      if (valueCertificate.length > 3) {
        this.setState({
          certificadoDisabled: false
        });
      } else {
        this.props.form.resetFields('certificado');
        this.setState({
          certificadoDisabled: true
        });
      }
    });
  };

  onChangeCertificate = evt => {
    const valor = evt.target.value;
    if (valor === 0) {
      this.props.form.resetFields('certificado');
    }
  };

  handleSearch = e => {
    const { desabilitarBotonModificar, tamanioPagina } = this.props;
    e.preventDefault();
    desabilitarBotonModificar();
    this.props.restablecerValores();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = this.props.construirParams(values, 1, tamanioPagina);
        this.props.setFormValues(values);
        this.props.dispatch(searchSinisterActionCreators.updatePage(1));
        this.props.dispatch(searchSinisterActionCreators.updateFilter(values));
        try {
          this.props.dispatch(searchSinisterActionCreators.fetchSearchSinister(params)).finally(resp => {
            if (this.props.errorSearchSinister) {
              showErrorMessage(this.props.errorSearchSinister.message);
            }
          });
        } catch (error) {
          const { response: { status } = {} } = error;
          if (status === 504) {
            modalConfirmacionReintentar();
          } else {
            showErrorMessage(CONSTANTS_APP.QUERY_ERROR_MESSAGE);
          }
        }
      }
    });
  };

  handleButton = (touched, hasErrors, values) => {
    if (!values || (touched && hasErrors)) {
      return true;
    }
    return false;
  };

  handleReset = () => {
    this.props.form.resetFields();
    this.setState({
      certificadoDisabled: true
    });
    this.props.dispatch(searchSinisterActionCreators.fetchSearchSinisterReset());
    this.props.restablecerValores();
  };

  notificactionExportExcel = () => {
    notification.info({
      message: 'Exportar a Excel',
      description: 'Se exportar\u00e1 en el archivo excel, hasta el registro: 1.048.576.'
    });
  };

  onClickExportExcel = e => {
    const codigoTipo = this.props.userClaims.codTipo;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState(
          {
            dataExp: []
          },
          () =>
            this.props
              .dispatch(searchSinisterExportCreators.fetchExportSearchSinister(values, codigoTipo))
              .finally(resp => {
                this.setState({
                  dataExp: this.props.exportSinister.exportSinister
                });
                if (this.props.errorExportSinister) {
                  showErrorMessage(this.props.errorExportSinister.message);
                }
              })
        );
      }
    });
    if (this.props.lengthData >= 1048576) {
      this.notificactionExportExcel();
    }
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched,
      isFieldsTouched,
      getFieldsValue
    } = this.props.form;
    const numberSinisterError = isFieldTouched('numeroDeSiniestro') && getFieldError('numeroDeSiniestro');
    const numeroDeCasoError = isFieldTouched('numeroDeCaso') && getFieldError('numeroDeCaso');
    const numeroDePolizaError = isFieldTouched('numeroDePoliza') && getFieldError('numeroDePoliza');
    const fechaDeOcurrenciaError = isFieldTouched('fechaDeOcurrencia') && getFieldError('fechaDeOcurrencia');
    const fechaDeRegistroError = isFieldTouched('fechaDeRegistro') && getFieldError('fechaDeRegistro');
    const estadoSiniestroError = isFieldTouched('estadoSiniestro') && getFieldError('estadoSiniestro');
    const certificadoError = isFieldTouched('certificado') && getFieldError('certificado');
    const productoError = isFieldTouched('producto') && getFieldError('producto');
    const equipoError = isFieldTouched('equipo') && getFieldError('equipo');
    const siniestroLiderError = isFieldTouched('siniestroLider') && getFieldError('siniestroLider');
    const numeroPlanillaError = isFieldTouched('numeroPlanilla') && getFieldError('numeroPlanilla');
    const {
      exportSinister: { exportSinister },
      producto,
      stateSinister,
      teams
    } = this.props;

    const productoItems = producto.map(item => (
      <Select.Option key={item.codProd} value={item.codProd}>{`${item.codProd} - ${item.dscProd}`}</Select.Option>
    ));

    const stateSinisterItems = stateSinister.map(item => (
      <Select.Option key={item.codEstado} value={item.codEstado}>
        {item.descEstado}
      </Select.Option>
    ));

    const teamsItems = teams.map(item => (
      <Select.Option key={item.idEquipo} value={item.idEquipo.toString()}>
        {item.equipo}
      </Select.Option>
    ));

    const exportExcelDocument = [
      {
        columns: [
          'Nro. siniestro',
          'Siniestro lider',
          'Nro. planilla',
          'Nro. caso',
          'Fecha ocurrencia',
          'Ramo',
          'Nro. póliza',
          'Certificado',
          'Cobertura',
          'Asegurado',
          'Estado siniestro',
          'Ejecutivo asignado',
          'Ajustador asignado',
          'Equipo'
        ],
        data: exportSinister.map((sinisterItem, index) => {
          let listaCoberturas = '';
          let i;
          for (i in sinisterItem.ramos) {
            const totalRamos = sinisterItem.ramos.length - 1;
            if (sinisterItem.ramos.length > 1) {
              if (i === totalRamos.toString()) {
                listaCoberturas += `${sinisterItem.ramos[i].lstDscCoberturas}`;
              } else {
                listaCoberturas += `${sinisterItem.ramos[i].lstDscCoberturas},  `;
              }
            } else if (sinisterItem.ramos.length === 1) {
              listaCoberturas += `${sinisterItem.ramos[i].lstDscCoberturas}`;
            }
          }
          return [
            { value: sinisterItem.idSiniestro ? sinisterItem.idSiniestro : '' },
            { value: sinisterItem.siniestroLider ? sinisterItem.siniestroLider : '' },
            { value: sinisterItem.numPlanilla ? sinisterItem.numPlanilla : '' },
            { value: sinisterItem.numSiniestro ? sinisterItem.numSiniestro : '' },
            {
              value: sinisterItem.fechaOcurrencia
                ? moment.utc(sinisterItem.fechaOcurrencia).format(CONSTANTS_APP.FORMAT_DATE)
                : ''
            },
            { value: sinisterItem.ramos[0] ? sinisterItem.ramos[0].codRamo : '' },
            { value: sinisterItem.numPoliza ? sinisterItem.numPoliza : '' },
            { value: sinisterItem.numCertificado ? sinisterItem.numCertificado : '' },
            { value: sinisterItem.ramos[0] ? listaCoberturas : '' },
            { value: sinisterItem.nombresAsegurado ? sinisterItem.nombresAsegurado : '' },
            {
              value: sinisterItem.descSubEstado
                ? `${sinisterItem.estadoSiniestro} - ${sinisterItem.descSubEstado}`
                : sinisterItem.estadoSiniestro
            },
            { value: sinisterItem.ejecutivoAsignado ? sinisterItem.ejecutivoAsignado : '' },
            { value: sinisterItem.ajustadorAsignado ? sinisterItem.ajustadorAsignado : '' },
            { value: sinisterItem.descripcionEquipo ? sinisterItem.descripcionEquipo : '' }
          ];
        })
      }
    ];

    return (
      <div className="seccion_claims">
        <Form onSubmit={this.handleSearch}>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="N&uacute;mero de siniestro"
                validateStatus={numberSinisterError ? 'error' : ''}
                help={numberSinisterError || ''}
              >
                {getFieldDecorator('numeroDeSiniestro', {
                  rules: [
                    {
                      type: 'string',
                      message: 'No válido / mínimo 4 digitos',
                      pattern: /^\d{4,}$/
                    }
                  ]
                })(<Input type="text" id="num" placeholder="Ingrese n&uacute;mero" maxLength={10} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="N&uacute;mero de caso"
                validateStatus={numeroDeCasoError ? 'error' : ''}
                help={numeroDeCasoError || ''}
              >
                {getFieldDecorator('numeroDeCaso', {
                  rules: [{ type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^[a-zA-Z0-9]*$/ }]
                })(<Input placeholder="Ingrese n&uacute;mero" maxLength={1000} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="N&uacute;mero de póliza"
                validateStatus={numeroDePolizaError ? 'error' : ''}
                help={numeroDePolizaError || ''}
              >
                {getFieldDecorator('numeroDePoliza', {
                  rules: [{ type: 'string', message: 'No válido / mínimo 4 dígitos', pattern: /^\d{4,}$/ }]
                })(<Input placeholder="Ingrese n&uacute;mero" maxLength={30} onChange={this.onChangePoliza} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Certificado"
                validateStatus={certificadoError ? 'error' : ''}
                help={certificadoError || ''}
              >
                {getFieldDecorator('certificado', {
                  rules: [{ type: 'string', message: ValidationMessage.NOT_VALID, pattern: /^\d{1,}$/ }]
                })(
                  <Input
                    placeholder="Ingrese n&uacute;mero"
                    min={1}
                    disabled={this.state.certificadoDisabled}
                    onChange={this.onChangeCertificate}
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Asegurado">
                {getFieldDecorator('asegurado', {
                  initialValue: {
                    terceroElegido: null,
                    terceroSeleccionado: null,
                    modalVisible: false,
                    saveButtonDisabled: true
                  }
                })(<SearchAndInput roleType={ROLE_TYPE.ASEGURADO} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Fecha de ocurrencia"
                validateStatus={fechaDeOcurrenciaError ? 'error' : ''}
                help={fechaDeOcurrenciaError || ''}
              >
                {getFieldDecorator('fechaDeOcurrencia')(<DatePicker.RangePicker format={CONSTANTS_APP.FORMAT_DATE} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Fecha de registro"
                validateStatus={fechaDeRegistroError ? 'error' : ''}
                help={fechaDeRegistroError || ''}
              >
                {getFieldDecorator('fechaDeRegistro')(<DatePicker.RangePicker format={CONSTANTS_APP.FORMAT_DATE} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="Estado siniestro"
                validateStatus={estadoSiniestroError ? 'error' : ''}
                help={estadoSiniestroError || ''}
              >
                {getFieldDecorator('estadoSiniestro')(
                  <Select maxLength={58} placeholder="Seleccione estado">
                    {stateSinisterItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Producto" validateStatus={productoError ? 'error' : ''} help={productoError || ''}>
                {getFieldDecorator('producto')(
                  <Select
                    showSearch
                    loading={this.props.loadingProducto}
                    placeholder="Ingrese c&oacute;digo - producto"
                    optionFilterProp="children"
                    filterOption={(inputValue, option) =>
                      option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                  >
                    {productoItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item label="Equipo" validateStatus={equipoError ? 'error' : ''} help={equipoError || ''}>
                {getFieldDecorator('equipo')(
                  <Select loading={this.props.loadingTeams} placeholder="Seleccione equipo">
                    {teamsItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="N&uacute;mero siniestro l&iacute;der"
                validateStatus={siniestroLiderError ? 'error' : ''}
                help={siniestroLiderError || ''}
              >
                {getFieldDecorator('siniestroLider', {
                  rules: [{ type: 'string', message: 'No válido / mínimo 4 dígitos', pattern: /^\d{4,}$/ }]
                })(<Input placeholder="Ingrese n&uacute;mero de siniestro l&iacute;der" maxLength={50} />)}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6} xl={6}>
              <Form.Item
                label="N&uacute;mero de planilla"
                validateStatus={numeroPlanillaError ? 'error' : ''}
                help={numeroPlanillaError || ''}
              >
                {getFieldDecorator('numeroPlanilla', {
                  rules: [{ type: 'string', message: 'No válido / mínimo 4 dígitos', pattern: /^\d{4,}$/ }]
                })(<Input placeholder="Ingrese n&uacute;mero de planilla" maxLength={8} />)}
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Col span={24} style={{ textAlign: 'right', marginBottom: '15px' }}>
              <Button
                onClick={this.handleSearch}
                htmlType="submit"
                type="primary"
                disabled={this.handleButton(
                  isFieldsTouched(),
                  hasErrors(getFieldsError()),
                  hasValues(getFieldsValue())
                )}
              >
                Buscar
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
                {' '}
                Limpiar{' '}
              </Button>
              <Button
                onClick={this.onClickExportExcel}
                disabled={!(this.props.lengthData > 0)}
                loading={this.props.loadingExportSinister}
              >
                Exportar
              </Button>
              {this.state.dataExp.length > 0 && (
                <ExcelFile
                  filename={`Consulta Siniestros ${moment().format(CONSTANTS_APP.FORMAT_DATE_HOUR)}`}
                  hideElement
                >
                  <ExcelSheet dataSet={exportExcelDocument} name="Consulta siniestros" />
                </ExcelFile>
              )}
            </Col>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const producto = state.scenes.data.producto;
  const stateSinister = state.scenes.query.data.stateSinister;
  const teams = state.scenes.data.teams;
  const exportSinister = getSearchSinister(state);
  return {
    producto: producto.producto,
    loadingProducto: producto.isLoading,
    errorProducto: producto.error,

    stateSinister: stateSinister.stateSinister,
    loadingStateSinister: stateSinister.isLoading,
    errorStateSinister: stateSinister.error,

    teams: teams.teams,
    loadingTeams: teams.isLoading,
    errorTeams: teams.error,

    userClaims: state.services.user.userClaims,

    exportSinister,
    loadingExportSinister: exportSinister.loadingExportSinister,
    errorExportSinister: exportSinister.error
  };
}

export default connect(mapStateToProps)(Form.create()(QuerySinisterForm));
