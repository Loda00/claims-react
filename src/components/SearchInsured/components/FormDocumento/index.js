import React from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col, Input, Button, Select } from 'antd';
import { TIPO_DOCUMENTO, TIPO_TERCERO } from 'constants/index';
import { showErrorMessage } from 'util/index';
import * as documentTypeActionCreators from 'components/SearchInsured/data/documentTypes/actions';
import * as thirdPartyActionCreators from 'components/SearchInsured/data/thirdparty/actions';
import { ValidationMessage } from 'util/validation';

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class FormDocumento extends React.Component {
  state = {
    selectedDocType: ''
  };

  componentDidMount() {
    this.props.form.validateFields();
    this.props.dispatch(documentTypeActionCreators.fetchDocumentTypes('CRG_TDOCIDENT')).finally(resp => {
      if (this.props.errorDocumentTypes) {
        showErrorMessage(this.props.errorDocumentTypes.message);
      }
    });
  }

  checkNumeroDocumento = (rule, value, callback) => {
    if (typeof value === 'undefined' || value == null) {
      callback();
      return;
    }

    const tipoDocumento = this.state.selectedDocType;
    if (tipoDocumento === TIPO_DOCUMENTO.RUC.CODIGO) {
      if (value.length === 0 || TIPO_DOCUMENTO.RUC.REGEX.test(value)) {
        callback();
        return;
      }
    } else if (tipoDocumento === TIPO_DOCUMENTO.DNI.CODIGO) {
      if (value.length === 0 || TIPO_DOCUMENTO.DNI.REGEX.test(value)) {
        callback();
        return;
      }
    } else if (tipoDocumento === TIPO_DOCUMENTO.CE.CODIGO) {
      if (value.length === 0 || TIPO_DOCUMENTO.CE.REGEX.test(value)) {
        callback();
        return;
      }
    } else if (tipoDocumento === TIPO_DOCUMENTO.PASAPORTE.CODIGO) {
      if (value.length === 0 || TIPO_DOCUMENTO.PASAPORTE.REGEX.test(value)) {
        callback();
        return;
      }
    }

    callback(ValidationMessage.NOT_VALID);
  };

  handleDocumentTypeChange = (value, e) => {
    this.setState(
      {
        selectedDocType: value
      },
      () => {
        this.props.form.validateFields(['numeroDocumento'], { force: true });
      }
    );
  };

  returnPersonType = () => {
    if (this.state.selectedDocType === TIPO_DOCUMENTO.RUC.CODIGO) {
      return TIPO_TERCERO.EMPRESA;
    }
    return TIPO_TERCERO.PRIVADO;
  };

  handleSearch = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props
          .dispatch(thirdPartyActionCreators.fetchThirdParty(values, this.props.roleType, this.returnPersonType()))
          .finally(resp => {
            if (this.props.errorThirdparty) {
              showErrorMessage(this.props.errorThirdparty.message);
            }
          });
      }
    });
  };

  render() {
    const documentTypes = this.props.documentTypes;
    const optionItems = documentTypes.map((documentType, i) => (
      <Select.Option key={i} title={documentType.tooltip} value={documentType.valor}>
        {documentType.descripcion}
      </Select.Option>
    ));

    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
    const tipoDocumentoError = isFieldTouched('tipoDocumento') && getFieldError('tipoDocumento');
    const numeroDocumentoError = isFieldTouched('numeroDocumento') && getFieldError('numeroDocumento');

    return (
      <Col span={24}>
        <Form>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={10} lg={10} xl={10}>
              <Form.Item
                label="Tipo de Documento"
                validateStatus={tipoDocumentoError ? 'error' : ''}
                help={tipoDocumentoError || ''}
              >
                {getFieldDecorator('tipoDocumento', {
                  rules: [{ required: true, message: ValidationMessage.REQUIRED }]
                })(
                  <Select
                    onChange={this.handleDocumentTypeChange}
                    loading={this.props.loadingDocumentTypes}
                    placeholder="Seleccione"
                  >
                    {optionItems}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={14} lg={14} xl={14}>
              <Form.Item
                label="N&ordm; de Documento"
                validateStatus={numeroDocumentoError ? 'error' : ''}
                help={numeroDocumentoError || ''}
              >
                {getFieldDecorator('numeroDocumento', {
                  rules: [
                    { required: true, message: ValidationMessage.REQUIRED },
                    { validator: this.checkNumeroDocumento }
                  ]
                })(<Input placeholder="N&ordm; documento" maxLength={30} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button
                id="modal_tercero_tipoDocumento_boton_buscar"
                style={{ marginLeft: 8 }}
                type="primary"
                key="submit"
                htmlType="submit"
                onClick={this.handleSearch}
                disabled={hasErrors(getFieldsError())}
              >
                Buscar
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>
    );
  }
}

function mapStateToProps(state) {
  const documentTypes = state.components.searchInsured.data.documentTypes;

  return {
    documentTypes: documentTypes.documentTypes,
    loadingDocumentTypes: documentTypes.isLoading,
    errorDocumentTypes: documentTypes.error
  };
}
export default connect(mapStateToProps)(Form.create({ name: 'modal_tercero' })(FormDocumento));
