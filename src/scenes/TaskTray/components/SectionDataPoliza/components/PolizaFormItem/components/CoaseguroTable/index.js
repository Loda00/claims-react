import React from 'react';
import { Table, Input, Form } from 'antd';

class CoaseguroTable extends React.Component {
  obtenerCorreo = (text, record, index) => {
    const {
      idTarea,
      coaseguros,
      validarCorreo,
      disabledGeneral,
      validarEmailSeguros,
      cerrarSiniestroValue,
      esSiniestroPreventivo,
      validacionInputEmailSeguros: { habilitarInputEmailSeguros },
      form: { getFieldDecorator, isFieldTouched, getFieldError }
    } = this.props;

    const formItemLayout = {
      labelCol: {
        span: 1
      },
      wrapperCol: {
        span: 23
      }
    };
    const mostrarErrorFormato =
      (validarEmailSeguros || isFieldTouched(`coaseguro${record.idCoaseguro}`)) &&
      getFieldError(`coaseguro${record.idCoaseguro}`);
    const errorValidacion = (getFieldError(`coaseguro${record.idCoaseguro}`) || [])[0];

    const emailInicial = (coaseguros.filter(coaseguro => coaseguro.idCoaseguro === record.idCoaseguro)[0] || {})
      .dscEmail;

    const boolHabilitarInputEmailSeguros = habilitarInputEmailSeguros({
      idTarea,
      esSiniestroPreventivo,
      cerrarSiniestroValue
    });

    return (
      <Form.Item
        required
        label=" "
        colon={false}
        style={{ margin: '0 auto' }}
        {...formItemLayout}
        help={mostrarErrorFormato ? errorValidacion : ''}
        validateStatus={mostrarErrorFormato ? 'error' : ''}
      >
        {getFieldDecorator(`coaseguro${record.idCoaseguro}`, {
          trigger: 'onBlur',
          valuePropName: 'defaultValue',
          initialValue: emailInicial,
          rules: [{ validator: validarCorreo }]
        })(<Input placeholder="E-mail" disabled={disabledGeneral || !boolHabilitarInputEmailSeguros} />)}
      </Form.Item>
    );
  };

  render() {
    const { coaseguros, indNotifReaCoa, showScroll } = this.props;
    const columns = [
      {
        title: 'Coasegurador',
        dataIndex: 'nomCoaseguro',
        key: 'nomCoaseguro'
      },
      {
        title: 'Participación',
        dataIndex: 'mtoParticipacion',
        key: 'mtoParticipacion',
        align: 'right',
        render: text => <span>{text} %</span>
      },
      {
        title: 'Email',
        dataIndex: 'dscEmail',
        key: 'dscEmail',
        align: 'center',
        render: (text, record, index) => this.obtenerCorreo(text, record, index)
      },
      {
        title: 'Estado',
        dataIndex: 'indNotifReaCoa',
        key: 'indNotifReaCoa',
        align: 'center',
        render: () => (indNotifReaCoa === 'S' && 'Enviado') || '-'
      }
    ];

    const data = coaseguros.map(item => {
      return { ...item, key: item.id };
    });

    return (
      <React.Fragment>
        {showScroll && (
          <Table
            rowKey={item => item.idCoaseguro}
            columns={columns}
            dataSource={data}
            size="small"
            scroll={{ x: '180%', y: coaseguros.length > 10 ? 580 : false }}
          />
        )}
        {!showScroll && (
          <Table
            rowKey={item => item.idCoaseguro}
            columns={columns}
            dataSource={data}
            size="small"
            scroll={{ y: coaseguros.length > 10 ? 580 : false }}
          />
        )}
      </React.Fragment>
    );
  }
}
export default CoaseguroTable;
