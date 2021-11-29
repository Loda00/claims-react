import React, { Component } from 'react';
import currency from 'currency.js';
import { Card } from 'antd';
import Indemnizacion from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Indemnizacion';
import Honorarios from 'scenes/TaskTray/components/SectionPayments/components/PagosFormItem/components/PaymentTabs/components/Honorarios';
import { TITLE_MODAL, TAREAS, TASA_CAMBIO_PRECISION } from 'constants/index';
import { esUsuarioAjustador } from 'util/index';
import OtrosConceptos from './components/OtrosConceptos';
import Reposicion from './components/Reposicion';
import Acreencias from './components/Acreencias';
import Coordenadas from './components/Coordenadas';

class PaymentTabs extends Component {
  state = {
    key: undefined
  };

  onTabChange = (key, type) => {
    this.setState({ [type]: key });
  };

  render() {
    const {
      disabledGeneral,
      numSiniestro,
      pagosElegidos: {
        indemnizaciones,
        honorarios,
        otrosConceptos,
        reposiciones,
        acreencias,
        coordenadas,
        pagosObservados
      },
      setIndemnizaciones,
      setHonorarios,
      setOtrosConceptos,
      setReposiciones,
      setAcreencias,
      setCoordenadas,
      otrosConceptosForm,
      ramosCoberturasForm,
      currentTask,
      analizarForm,
      dataSinister,
      dataSinister: { indCargaMasiva },
      dataCertificate,
      dataPoliza,
      clave,
      tipoConfirmarGestion,
      flagModificar,
      userClaims,
      esDevolver,
      indModalidadPago
    } = this.props;

    const { key } = this.state;

    const esRevisarPagoEjecutivoRechazo =
      currentTask.idTarea === TAREAS.REVISAR_PAGO_EJECUTIVO && tipoConfirmarGestion === 'R';

    const tabList = [];

    if (!esRevisarPagoEjecutivoRechazo) {
      tabList.push({ key: 'indemnizacion', tab: TITLE_MODAL.INDEMNIZACION });

      tabList.push({
        key: 'pagoHonorariosAjustador',
        tab: TITLE_MODAL.PAGOHONORARIO
      });

      if (indCargaMasiva !== 'PT') {
        if (indCargaMasiva !== 'COA') {
          tabList.push({
            key: 'pagoOtrosConceptos',
            tab: TITLE_MODAL.PAGOOTROS
          });

          tabList.push({
            key: 'pagoReposicion',
            tab: TITLE_MODAL.PAGOREPOSICION
          });
        }

        if (!esUsuarioAjustador(userClaims)) {
          tabList.push({
            key: 'acreencia',
            tab: TITLE_MODAL.ACREENCIA
          });
        }
      }

      if (indModalidadPago === 'S') {
        tabList.push({
          key: 'coordenadas',
          tab: TITLE_MODAL.COORDENADASBANCARIOS
        });
      }
    } else {
      tabList.push({ key: 'indemnizacion', tab: TITLE_MODAL.INDEMNIZACION });
      tabList.push({
        key: 'pagoReposicion',
        tab: TITLE_MODAL.PAGOREPOSICION
      });
    }

    // obtiene coberturas
    const coberturasForm = [];
    ramosCoberturasForm.forEach(ramo => {
      ramo.coberturas.forEach((item, i) => {
        const fila = {
          key: i,
          ramo: ramo.codRamo,
          pkRamo: ramo.secRamo,
          cobertura: item.descCobertura || '',
          montoReclamado: item.montoReclamado || '',
          sumaAsegurada: item.sumaAsegurada || '',
          reservaAntesDeducible: item.montoReserva || '',
          mtoReserva: item.montoReserva,
          totalPagosAprobados: item.totalPagosAprobados,
          saldoPendienteCobertura: currency(item.montoReserva, {
            precision: TASA_CAMBIO_PRECISION
          }).subtract(item.totalPagosAprobados, {
            precision: TASA_CAMBIO_PRECISION
          }).value,
          monedaIndemnizacion: item.codMoneda || '',
          causa: item.dscCausa || '',
          consecuencia: item.dscConsecuencia || '',
          siniestroSinCobertura: item.indSinCobertura || '',
          codCausa: item.codCausa,
          codCobert: item.codCobert,
          idCobertura: item.idCobertura,
          dscCobertura: item.descCobertura,
          secCobertura: item.secCobertura,
          codConsecuencia: item.codConsecuencia,
          tipoRes: item.tipo,
          estado: item.estado
        };

        if (fila.siniestroSinCobertura !== 'S') {
          coberturasForm.push(fila);
        }
      });
    });

    const contentList = {
      indemnizacion: (
        <Indemnizacion
          disabledGeneral={disabledGeneral}
          numSiniestro={numSiniestro}
          indemnizaciones={indemnizaciones}
          setIndemnizaciones={setIndemnizaciones}
          coberturasForm={coberturasForm}
          currentTask={currentTask}
          analizarForm={analizarForm}
          dataSinister={dataSinister}
          tipoConfirmarGestion={tipoConfirmarGestion}
          flagModificar={flagModificar}
          esDevolver={esDevolver}
          clave={clave}
          pagosObservados={pagosObservados}
        />
      ),
      pagoHonorariosAjustador: (
        <Honorarios
          disabledGeneral={disabledGeneral}
          numSiniestro={numSiniestro}
          honorarios={honorarios}
          setHonorarios={setHonorarios}
          otrosConceptosForm={otrosConceptosForm}
          analizarForm={analizarForm}
          currentTask={currentTask}
          dataSinister={dataSinister}
          tipoConfirmarGestion={tipoConfirmarGestion}
          flagModificar={flagModificar}
          pagosObservados={pagosObservados}
          clave={clave}
        />
      ),
      pagoOtrosConceptos: (
        <OtrosConceptos
          disabledGeneral={disabledGeneral}
          numSiniestro={numSiniestro}
          otrosConceptos={otrosConceptos}
          setOtrosConceptos={setOtrosConceptos}
          otrosConceptosForm={otrosConceptosForm}
          analizarForm={analizarForm}
          currentTask={currentTask}
          dataSinister={dataSinister}
          tipoConfirmarGestion={tipoConfirmarGestion}
          flagModificar={flagModificar}
          clave={clave}
        />
      ),
      pagoReposicion: (
        <Reposicion
          disabledGeneral={disabledGeneral}
          numSiniestro={numSiniestro}
          reposiciones={reposiciones}
          setReposiciones={setReposiciones}
          coberturasForm={coberturasForm}
          analizarForm={analizarForm}
          currentTask={currentTask}
          dataSinister={dataSinister}
          tipoConfirmarGestion={tipoConfirmarGestion}
          flagModificar={flagModificar}
          esDevolver={esDevolver}
          clave={clave}
        />
      ),
      acreencia: (
        <Acreencias
          disabledGeneral={disabledGeneral}
          numSiniestro={numSiniestro}
          acreencias={acreencias}
          setAcreencias={setAcreencias}
          ramosCoberturasForm={ramosCoberturasForm}
          analizarForm={analizarForm}
          currentTask={currentTask}
          dataSinister={dataSinister}
          tipoConfirmarGestion={tipoConfirmarGestion}
          flagModificar={flagModificar}
        />
      ),
      coordenadas: (
        <Coordenadas
          disabledGeneral={disabledGeneral}
          numSiniestro={numSiniestro}
          coordenadas={coordenadas}
          setCoordenadas={setCoordenadas}
          analizarForm={analizarForm}
          currentTask={currentTask}
          dataSinister={dataSinister}
          dataCertificate={dataCertificate}
          dataPoliza={dataPoliza}
          tipoConfirmarGestion={tipoConfirmarGestion}
          flagModificar={flagModificar}
          indemnizaciones={indemnizaciones}
        />
      )
    };

    return (
      <Card
        tabList={tabList}
        activeTabKey={key || clave}
        onTabChange={localKey => {
          this.onTabChange(localKey, 'key');
        }}
        style={{ marginBottom: '10px' }}
      >
        {contentList[key || clave]}
      </Card>
    );
  }
}

export default PaymentTabs;
