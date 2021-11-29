import React, { Fragment, Component } from 'react';
import { Card, Checkbox, Button, Icon, Divider, Table, Popconfirm, Modal } from 'antd';
import TransbordoModal from 'scenes/TaskTray/components/SectionDataSinister/components/SinisterFormItem/components/TransbordoFormItem/TransbordoModal';
import { isNullOrUndefined } from 'util';
import { showErrorMessage } from 'util/index';
import { TITLE_MODAL_TRASBORDO } from 'constants/index';

const initialState = {
  modalVisible: false,
  editTrasbordo: null,
  trasbordos: [],
  indTrasbordo: false
};

class TrasbordoFormItem extends Component {
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

  // setea el estado del indice de trasbordo, este indica si el check es true o false
  onChangeCheckedTrasbordo = e => {
    const { trasbordos } = this.state;

    if (!e.target.checked) {
      const trasbordosNoEliminados = trasbordos.filter(item => item.action !== 'D');
      if (trasbordosNoEliminados.length) {
        Modal.warning({
          title: 'Se van a eliminar todos los trasbordos al Guardar o Completar la tarea.',
          content: 'Si desea revertir los cambios vuelva a marcar la casilla "Trasbordo"'
        });
      }
    }

    this.setState(state => ({
      ...state,
      indTrasbordo: e.target.checked
    }));
    this.triggerChange({
      indTrasbordo: e.target.checked
    });
  };

  // setea el estado de trasbordos, este array contiene los trasbordos
  asignarTrasbordo = array => {
    this.setState(state => ({
      ...state,
      trasbordos: array
    }));
    this.triggerChange({
      trasbordos: array
    });
  };

  // setea el modal a  visible
  setModalVisible = () => {
    this.validarCamposModal();
    this.setState({ modalVisible: true });
    this.triggerChange({ modalVisible: true });
  };

  // setea el modal a no visible
  onCancelModalHandler = () => {
    this.setState({ modalVisible: false });
    this.triggerChange({ modalVisible: false });
  };

  modificarEdicionTrasbordo = editTrasbordo => {
    this.setState(prevState => {
      return {
        ...prevState,
        editTrasbordo
      };
    });
    this.triggerChange({ editTrasbordo });
  };

  onOkModalHandler = async value => {
    const { trasbordos } = this.state;
    try {
      let tempDataSource = [...trasbordos];
      let validacion = null;

      if (value.action === 'N') {
        Object.assign(value, { rowKey: tempDataSource.length });
        tempDataSource.push(value);
        this.onCancelModalHandler();
      } else if (value.action === 'U') {
        validacion = this.validateBeforeUpdate(value, tempDataSource);
        if (validacion === null) {
          tempDataSource = tempDataSource.map(item => {
            Object.assign(value, {
              action: value.idTrasbordo >= 0 ? 'U' : 'N'
            });

            return item.rowKey === value.rowKey ? value : item;
          });
          this.onCancelModalHandler();
        } else {
          showErrorMessage(validacion);
        }
      }
      /** Después de todo validación será null y se realizará la función asignarTrasbordo
       * y se le pasará como argumento para que a transporte se le setee el array con el
       * elemento agregado (Sucede siempre que hay action) */
      if (validacion === null) this.asignarTrasbordo(tempDataSource);
    } catch (e) {
      showErrorMessage(e);
    }
  };

  validateBeforeInsert = (value, datasource) => {
    const { nombre, lugar } = value;
    let validacionDuplicados = false;
    validacionDuplicados = datasource.some(
      item =>
        item.lugar.toUpperCase() === lugar.toUpperCase() &&
        item.nombre.toUpperCase() === nombre.toUpperCase() &&
        item.action !== 'D'
    );
    if (validacionDuplicados) return String('Valor ya registrado');

    return null;
  };

  validateBeforeUpdate = record => {
    const { nombre, lugar } = record;
    if (isNullOrUndefined(nombre) || nombre === '' || isNullOrUndefined(lugar) || lugar === '')
      return String('Valor no puede ser vacío');
    return null;
  };

  manejadorFuncionesHijos = funcionHija => {
    this.validarCamposModal = funcionHija;
  };

  onEditModalHandler = async record => {
    await this.modificarEdicionTrasbordo(record);
    this.setModalVisible();
  };

  // Validar Eliminacion - Cuando está en  BD o cuando es un registro nuevo.
  // Validar actualizacion - Cuando está en BD o cuando es un registro nuevo.

  onDeleteModalHandler = record => {
    const { trasbordos } = this.state;
    let tempDataSource = [...trasbordos];
    if (record.idTrasbordo) {
      tempDataSource = tempDataSource.map(item => {
        return item.idTrasbordo === record.idTrasbordo ? { ...record, action: 'D' } : { ...item };
      });
    } else {
      tempDataSource = tempDataSource.filter(item => tempDataSource.indexOf(item) !== record.rowKey);
    }
    this.asignarTrasbordo(tempDataSource);
  };

  afterCloseModalHandler = () => {
    this.modificarEdicionTrasbordo(null);
  };

  render() {
    const { indTrasbordo, modalVisible, editTrasbordo, trasbordos } = this.state;
    const {
      disabledGeneral,
      showScroll,
      idTarea,
      esSiniestroPreventivo,
      flagModificar,
      tamanioTablaPagina,
      validacionCheckboxTrasbordos: { habilitarCheckboxTrasbordos },
      validacionBotonAgregarTrasbordo: { habilitarBotonAgregarTrasbordo, mostrarBotonAgregarTrasbordo },
      validacionGrillaTrasbordo: { mostrarGrillaTrasbordo },
      validacionOpcionGrillaTrasbordoIncoterms: { mostrarOpcionGrillaTrasbordoIncoterms }
    } = this.props;

    // Validaciones

    const boolHabilitarCheckboxTrasbordos = habilitarCheckboxTrasbordos({
      idTarea,
      esSiniestroPreventivo
    });
    const boolHabilitarBotonAgregarTrasbordo = habilitarBotonAgregarTrasbordo({
      esSiniestroPreventivo,
      indTrasbordo,
      idTarea
    });
    const boolMostrarBotonAgregarTrasbordo = mostrarBotonAgregarTrasbordo({
      idTarea
    });
    const boolMostrarGrillaTrasbordo = mostrarGrillaTrasbordo({
      idTarea,
      indTrasbordo,
      flagModificar
    });
    const boolMostrarOpcionGrillaTrasbordoIncoterms = mostrarOpcionGrillaTrasbordoIncoterms({
      idTarea,
      esSiniestroPreventivo
    });
    // Fin validaciones

    const columns = [
      {
        title: 'Nombre transporte',
        dataIndex: 'nombre',
        key: 'nombre'
      },
      {
        title: 'Lugar',
        dataIndex: 'lugar',
        key: 'lugar'
      },
      {
        title: 'Acción',
        dataIndex: 'accion',
        key: 'accion',
        className: disabledGeneral || !boolMostrarOpcionGrillaTrasbordoIncoterms ? 'hide' : 'show',
        render: (text, record) => (
          <Fragment>
            <a href="javascript:;">
              <Icon
                type="edit"
                theme="filled"
                style={{ color: '#E6281E', fontSize: '18px' }}
                onClick={() => {
                  this.onEditModalHandler(record);
                }}
                title={TITLE_MODAL_TRASBORDO.ACTUALIZAR}
              />
            </a>
            <Divider type="vertical" />
            <Popconfirm
              title="Seguro de eliminar?"
              type="primary"
              okText="Sí"
              cancelText="No"
              onConfirm={() => this.onDeleteModalHandler(record)}
            >
              <Icon type="delete" theme="filled" style={{ color: 'red', fontSize: '18px' }} />
            </Popconfirm>
          </Fragment>
        )
      }
    ];

    const datasource = trasbordos
      .map((item, index) => {
        return { ...item, rowKey: index };
      })
      .filter(item => item.action !== 'D');

    return (
      <Fragment>
        <Card
          title={
            <Checkbox
              onChange={this.onChangeCheckedTrasbordo}
              disabled={disabledGeneral || !boolHabilitarCheckboxTrasbordos}
              checked={indTrasbordo}
            >
              Trasbordo
            </Checkbox>
          }
          extra={
            (boolMostrarBotonAgregarTrasbordo && (
              <Button disabled={disabledGeneral || !boolHabilitarBotonAgregarTrasbordo} onClick={this.setModalVisible}>
                Agregar trasbordo <Icon type="plus-circle" style={{ fontSize: '15px' }} />
              </Button>
            )) ||
            ''
          }
        >
          {boolMostrarGrillaTrasbordo ? (
            <Fragment>
              {showScroll && (
                <Table
                  rowKey={record => record.rowKey}
                  columns={columns}
                  pagination={{ defaultPageSize: tamanioTablaPagina }}
                  dataSource={datasource}
                  size="small"
                  scroll={{ x: '120%' }}
                />
              )}
              {!showScroll && (
                <Table
                  rowKey={record => record.rowKey}
                  columns={columns}
                  pagination={{ defaultPageSize: tamanioTablaPagina }}
                  dataSource={datasource}
                  size="small"
                />
              )}
            </Fragment>
          ) : (
            <h4
              style={{
                textAlign: 'center',
                color: '#5B5958',
                fontWeight: 'bold'
              }}
            >
              Seleccione Trasbordo para agregar.
            </h4>
          )}
        </Card>
        <TransbordoModal
          visible={modalVisible}
          onCancelModalHandler={this.onCancelModalHandler}
          onOkModalHandler={this.onOkModalHandler}
          editTrasbordo={editTrasbordo}
          manejadorFuncionesHijos={this.manejadorFuncionesHijos}
          afterCloseModalHandler={this.afterCloseModalHandler}
        />
      </Fragment>
    );
  }
}

export default TrasbordoFormItem;
