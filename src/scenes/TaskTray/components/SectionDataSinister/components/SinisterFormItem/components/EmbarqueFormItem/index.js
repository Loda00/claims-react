import React, { Fragment, Component } from 'react';
import { Card, Row, Select, Col, Icon, Form, Button, Popconfirm, Table, Divider } from 'antd';
import EmbarqueModal from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/EmbarqueFormItem/EmbarqueModal';
import { showErrorMessage } from 'util/index';
import { isNullOrUndefined } from 'util';
import currency from 'currency.js';

const initialState = {
  modalVisible: false,
  editEmbarque: null,
  incoterms: [],
  codigoNaturalezaEmbarque: undefined
};

class EmbarqueFormItem extends Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        ...(nextProps.value || {})
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  modificarNaturalezaEmbarque = codigoNaturalezaEmbarque => {
    this.setState(prevState => {
      return {
        ...prevState,
        codigoNaturalezaEmbarque
      };
    });
    this.triggerChange({ codigoNaturalezaEmbarque });
  };

  modificarIncoterms = array => {
    this.setState(prevState => {
      return {
        ...prevState,
        incoterms: array
      };
    });
    this.triggerChange({ incoterms: array });
  };

  manejadorFuncionesHijos = funcionHija => {
    this.validarCamposModal = funcionHija;
  };

  showModal = () => {
    this.validarCamposModal();
    this.setState({ modalVisible: true });
    this.triggerChange({ modalVisible: true });
  };

  hideModal = () => {
    this.setState({ modalVisible: false });
    this.triggerChange({ modalVisible: false });
  };

  modificarEdicionEmbarque = editEmbarque => {
    this.setState(prevState => {
      return {
        ...prevState,
        editEmbarque
      };
    });
    this.triggerChange({ editEmbarque });
  };

  onOkModalHandler = record => {
    const { incoterms } = this.state;
    try {
      let listIncoterms = [...incoterms];
      let validador = null;

      if (record.action === 'N') {
        validador = this.validateBeforeInsert(record, listIncoterms);
        if (validador === null) {
          listIncoterms.push(record);
          this.hideModal();
        } else {
          showErrorMessage(validador);
        }
      } else if (record.action === 'U') {
        validador = this.validateBeforeUpdate(record, listIncoterms);
        if (validador === null) {
          Object.assign(record, { action: record.key ? 'U' : 'N' });
          listIncoterms = listIncoterms.map(item => {
            return item.codigo === record.codigo ? record : item;
          });
          this.hideModal();
        } else {
          showErrorMessage(validador);
        }
      }
      if (validador === null) this.modificarIncoterms(listIncoterms);
    } catch (e) {
      showErrorMessage(e);
    }
  };

  validateBeforeInsert = (record, incoterms) => {
    const { codigo } = record;
    let validator = false;

    validator = incoterms.some(item => item.codigo.toUpperCase() === codigo.toUpperCase() && incoterms.action !== 'D');
    if (validator) return String('valor ya registrado');

    return null;
  };

  validateBeforeUpdate = record => {
    const { valor } = record;
    if (isNullOrUndefined(valor) || valor === '') return String('Valor no puede ser vacío');
    return null;
  };

  onEditModal = async record => {
    await this.modificarEdicionEmbarque(record);
    this.showModal();
  };

  onDeleteHandler = record => {
    const { incoterms } = this.state;
    let lstIncoterms = [...incoterms];
    if (record.key) {
      lstIncoterms = lstIncoterms.map(item => {
        return item.codigo === record.codigo ? { ...record, action: 'D' } : { ...item };
      });
    } else {
      lstIncoterms = lstIncoterms.filter(item => item.codigo !== record.codigo);
    }
    this.modificarIncoterms(lstIncoterms);
  };

  afterCloseModalHandler = () => {
    this.modificarEdicionEmbarque(null);
  };

  render() {
    const { incoterms, modalVisible, editEmbarque, codigoNaturalezaEmbarque } = this.state;
    const {
      constListaIncoterms,
      shipmentNatures: { shipmentNatures },
      showScroll,
      disabledGeneral,
      idTarea,
      esSiniestroPreventivo,
      flagModificar,
      tamanioTablaPagina,
      validacionSelectNaturalezaEmbarque: { habilitarSelectNaturalezaEmbarque },
      validacionBotonAgregarIncoterms: { habilitarBotonAgregarIncoterms, mostrarBotonAgregarIncoterms },
      validacionGrillaIncoterms: { mostrarGrillaIncoterms },
      validacionOpcionGrillaTrasbordoIncoterms: { mostrarOpcionGrillaTrasbordoIncoterms }
    } = this.props;

    // Validacion
    const boolHabilitarSelectNaturalezaEmbarque = habilitarSelectNaturalezaEmbarque({
      idTarea,
      esSiniestroPreventivo
    });

    const boolHabilitarBotonAgregarIncoterms = habilitarBotonAgregarIncoterms({
      esSiniestroPreventivo,
      codigoNaturalezaEmbarque
    });
    const boolMostrarBotonAgregarIncoterms = mostrarBotonAgregarIncoterms({
      idTarea
    });

    const boolMostrarGrillaIncoterms = mostrarGrillaIncoterms({
      idTarea,
      codigoNaturalezaEmbarque,
      flagModificar
    });

    const boolMostrarOpcionGrillaTrasbordoIncoterms = mostrarOpcionGrillaTrasbordoIncoterms({
      idTarea,
      esSiniestroPreventivo
    });
    // Fin validacion

    const columns = [
      {
        title: 'Código',
        dataIndex: 'codigo',
        key: 'codigo',
        render: text => {
          const incoterm = constListaIncoterms.filter(item => item.valor === text)[0];
          return (incoterm && incoterm.descripcion) || '';
        }
      },
      {
        title: 'Valor',
        dataIndex: 'valor',
        key: 'valor',
        render: text => currency(text).format()
      },
      {
        title: 'Acción',
        dataIndex: 'accion',
        key: 'accion',
        className: disabledGeneral || !boolMostrarOpcionGrillaTrasbordoIncoterms ? 'hide' : 'show',
        render: (text, record) =>
          incoterms.length >= 1 ? (
            <span>
              <Icon
                type="edit"
                theme="filled"
                style={{ color: '#E6281E', fontSize: '18px' }}
                onClick={() => this.onEditModal(record)}
              />
              <Divider type="vertical" />
              <Popconfirm
                title="Seguro de eliminar?"
                type="primary"
                okText="Sí"
                cancelText="No"
                onConfirm={() => this.onDeleteHandler(record)}
              >
                <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '17px' }} />
              </Popconfirm>
            </span>
          ) : null
      }
    ];

    const validDataSource = incoterms.filter(item => item.action !== 'D');
    return (
      <Fragment>
        <Row>
          <Card
            title={
              <Col xs={24} sm={8} md={6} lg={6} xl={6}>
                <Form.Item style={{ margin: '0 auto' }}>
                  <Select
                    style={{ width: '100%' }}
                    disabled={disabledGeneral || !boolHabilitarSelectNaturalezaEmbarque}
                    placeholder="Naturaleza embarque"
                    defaultValue={codigoNaturalezaEmbarque}
                    onChange={this.modificarNaturalezaEmbarque}
                  >
                    {shipmentNatures.map(shipmentNature => {
                      return (
                        <Select.Option key={shipmentNature.valor} value={shipmentNature.valor}>
                          {shipmentNature.descripcion}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            }
            extra={
              boolMostrarBotonAgregarIncoterms && (
                <Button disabled={disabledGeneral || !boolHabilitarBotonAgregarIncoterms} onClick={this.showModal}>
                  Agregar Incoterms <Icon type="plus-circle" style={{ fontSize: '15px' }} />
                </Button>
              )
            }
          >
            {boolMostrarGrillaIncoterms && (
              <Fragment>
                <h3>Incoterms</h3>
                {showScroll && (
                  <Table
                    rowKey={record => record.codigo}
                    columns={columns}
                    pagination={{ defaultPageSize: tamanioTablaPagina }}
                    dataSource={validDataSource}
                    size="small"
                    scroll={{ x: '120%' }}
                  />
                )}
                {!showScroll && (
                  <Table
                    rowKey={record => record.codigo}
                    columns={columns}
                    pagination={{ defaultPageSize: tamanioTablaPagina }}
                    dataSource={validDataSource}
                    size="small"
                  />
                )}
              </Fragment>
            )}
          </Card>
        </Row>
        <EmbarqueModal
          editEmbarque={editEmbarque}
          constListaIncoterms={constListaIncoterms}
          visible={modalVisible}
          onCancel={this.hideModal}
          onOkModalHandler={this.onOkModalHandler}
          manejadorFuncionesHijos={this.manejadorFuncionesHijos}
          afterCloseModalHandler={this.afterCloseModalHandler}
        />
      </Fragment>
    );
  }
}

export default EmbarqueFormItem;
