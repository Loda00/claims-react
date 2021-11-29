import React from 'react';
import { connect } from 'react-redux';
import RecuperoTable from 'scenes/TaskTray/components/SectionSalvamentoRecupero/components/RecuperoTable';
import SalvamentoTable from 'scenes/TaskTray/components/SectionSalvamentoRecupero/components/SalvamentoTable';
import { showErrorMessage } from 'util/index';
import { getParamGeneral } from 'services/types/reducer';
import { getListSalvamento } from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listSalvamento/reducer';
import { getListRecovered } from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/reducer';
import * as listRecoveredCreators from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listRecovered/action';
import * as listSalvamentoCreators from 'scenes/TaskTray/components/SectionSalvamentoRecupero/data/listSalvamento/action';

class SalvamentoRecupero extends React.Component {
  async componentDidMount() {
    const promises = [];
    promises.push(
      this.props.dispatch(listRecoveredCreators.fetchListRecovered(this.props.numSiniestro)),
      this.props.dispatch(listSalvamentoCreators.fetchListSalvamento(this.props.numSiniestro))
    );
    // promises.push(this.props.dispatch(listSalvamentoCreators.fetchListSalvamento(this.props.numSiniestro)));
    try {
      await Promise.all(promises);
    } catch (e) {
      showErrorMessage(e);
    }
  }

  render() {
    const { tamanioPaginacion, showScroll } = this.props;

    const listRecovered = this.props.listRecovered.listRecovered;
    const recuperoDataItem = listRecovered.map((item, index) => {
      return {
        key: index,
        fechaRecupero: item.fechaRecupero,
        demandado: item.demandado,
        docDemandado: item.docDemandado,
        numeroLiquidacion: item.numeroLiquidacion,
        montoDolares: item.montoDolares,
        estadoJuridico: item.estadoJuridico,
        ejecutivoLegal: item.ejecutivoLegal,
        recuperoDesistido: item.recuperoDesistido === 'N' || item.recuperoDesistido === 'NO' ? 'NO' : 'SI',
        observacion: item.observacion
      };
    });

    const listSalvamento = this.props.listSalvamento.listSalvamento;
    const salvamentoDataItem = listSalvamento.map((item, index) => {
      return {
        key: index,
        fecVenta: item.fecVenta,
        comprador: item.comprador,
        dniRucComprador: item.dniRucComprador,
        nroLiquidacion: item.nroLiquidacion,
        mtoVentaDolares: item.mtoVentaDolares,
        mtoPrecioDolares: item.mtoPrecioDolares,
        vendedor: item.vendedor,
        ejecutivolegal: item.ejecutivoLegal,
        salvDesistido: item.salvDesistido === 'N' || item.salvDesistido === 'NO' ? 'NO' : 'SI',
        obervacion: item.obervacion
      };
    });

    return (
      <div>
        <h3>Recupero</h3>
        <RecuperoTable
          recuperoDataItem={recuperoDataItem}
          tamanioPaginacion={tamanioPaginacion}
          showScroll={showScroll}
        />
        <h3>Salvamento</h3>
        <SalvamentoTable
          salvamentoDataItem={salvamentoDataItem}
          tamanioPaginacion={tamanioPaginacion}
          showScroll={showScroll}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const listRecovered = getListRecovered(state);
  const listSalvamento = getListSalvamento(state);
  const tamanioPaginacion = getParamGeneral(state, 'TAMANIO_TABLA_PAGINA');
  return {
    showScroll: state.services.device.scrollActivated,

    listRecovered,
    loadingListRecovered: listRecovered.isLoading,

    listSalvamento,
    loadingListSalvamento: listSalvamento.isLoading,

    tamanioPaginacion
  };
}

export default connect(mapStateToProps)(SalvamentoRecupero);
