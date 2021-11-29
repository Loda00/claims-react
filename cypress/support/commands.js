import 'cypress-file-upload';
import Amplify, { Auth } from 'aws-amplify';
import awsexports from '../../src/aws-exports';

const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

Cypress.Commands.add('login', (username, password) => {
  Amplify.configure(awsexports);
  const oauth = {
    domain: 'rimac-com-pe-desa.auth.us-east-2.amazoncognito.com',
    scope: [
      'phone',
      'email',
      'profile',
      'openid',
      'aws.cognito.signin.user.admin'
    ],
    redirectSignIn: 'http://localhost:3000',
    redirectSignOut: 'http://localhost:3000',
    responseType: 'code'
  };
  Auth.configure({ oauth });
  return Auth.signIn(username, password);
});

Cypress.Commands.add('seleccionarTercero', () => {
    // selecciona tercero
    // click boton modal
    cy.get('#modal_tercero_input_boton_buscar').click();

    // click por tipo doc
    cy.get('.ant-tabs-tab')
      .contains('Por tipo de documento')
      .click();

    cy.get('#modal_tercero_tipoDocumento').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('R.U.C.')
      .click();

    cy.get('#modal_tercero_numeroDocumento').type('20811464725');

    // click buscar tercero
    cy.get('#modal_tercero_tipoDocumento_boton_buscar').click();

    // click radio seleccionar
    cy.get(
      '.modal_tercero tr.ant-table-row-level-0 > td > span > label > span > input'
    ).click();

    // click boton seleccionar
    cy.get('#modal_tercero_boton_seleccionar').click();
    // fin selecciona tercero
});

Cypress.Commands.add('cargaStubUsuarioEjecutivo', () => {
  cy.fixture('usuario/usuario.json').as('usuarioJSON');
  cy.route('POST', `${apiUrl}/obtusuario`, '@usuarioJSON').as('getUsuario');
});

Cypress.Commands.add('cargaStubUsuarioAjustador', () => {
  cy.fixture('usuario/usuario_ajustador.json').as('usuarioJSON');
  cy.route('POST', `${apiUrl}/obtusuario`, '@usuarioJSON').as('getUsuario');
});

Cypress.Commands.add('fixtureCargaInicialTareas', () => {
  // servicios genericos
  cy.fixture('general/tasa1.json').as('tasa1JSON');
  cy.fixture('general/tasa2.json').as('tasa2JSON');
  cy.fixture('general/productos.json').as('productosJSON');
  cy.fixture('general/estados_siniestro.json').as('estadosSinistroJSON');
  cy.fixture('general/equipos.json').as('equiposJSON');
  cy.fixture('general/listas/params_bandeja.json').as('paramsBandejaJSON');
  cy.fixture('general/listas/motivos_reapertura.json').as(
    'motivosReaperturaJSON'
  );
  cy.fixture('general/listas/motivos_anulacion.json').as(
    'motivosAnulacionJSON'
  );
  cy.fixture('general/listas/cpto_pago.json').as('cptoPagoJSON');
  cy.fixture('general/listas/reg_tipo_siniestro.json').as(
    'regTipoSiniestreJSON'
  );
  cy.fixture('general/listas/motivos_rechazo_sbs.json').as(
    'motivosRechazoSBSJSON'
  );
  cy.fixture('general/listas/motivos_rechazo.json').as('motivosRechazoJSON');
  cy.fixture('general/tipos_documentos.json').as('tiposDocumentosJSON');
  cy.fixture('general/tipos_tarea.json').as('tiposTareaJSON');
  cy.fixture('general/listas/tipo_flujo.json').as('tipoFlujoJSON');
  cy.fixture('general/listas/incoterm.json').as('incotermJSON');
  cy.fixture('general/listas/naturaleza_embarque.json').as(
    'naturalezaEmbarqueJSON'
  );
  cy.fixture('general/listas/motivo_cierre.json').as('motivoCierreJSON');
  cy.fixture('general/listas/tipos_pago.json').as('tiposPagoJSON');
  cy.fixture('general/listas/tipos_moneda.json').as('tiposMonedaJSON');
  cy.fixture('general/listas/tipos_cobro.json').as('tiposCobroJSON');
  cy.fixture('general/listas/tipos_doc_pago.json').as('tiposDocPagoJSON');
  cy.fixture('general/listas/tipos_doc_ident.json').as('tiposDocIndentJSON');
  cy.fixture('general/buscar_tercero.json').as('buscarTerceroJSON');

  // define llamada a stubs
  cy.route('POST', `${apiUrl}/tasacambio1`, '@tasa1JSON');
  cy.route('POST', `${apiUrl}/tasacambio2`, '@tasa2JSON');
  cy.route('POST', `${apiUrl}/lstproductos`, '@productosJSON');
  cy.route('POST', `${apiUrl}/lstestadossiniestro`, '@estadosSinistroJSON');
  cy.route('POST', `${apiUrl}/lstequipos`, '@equiposJSON');
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_syn_tareas`,
    '@paramsBandejaJSON'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_lval_motreanu`,
    '@motivosReaperturaJSON'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_lval_moanus`,
    '@motivosAnulacionJSON'
  );
  cy.route('POST', `${apiUrl}/bsctareas`, '@tiposTareaJSON');
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_reg_tipo_siniestro`,
    '@regTipoSiniestreJSON'
  ).as('obtenerlista-crg_reg_tipo_siniestro');
  cy.route('POST', `${apiUrl}/obtenerlista-crg_cpto_pago`, '@cptoPagoJSON').as(
    'obtenerlista-crg_cpto_pago'
  );
  cy.route('POST', `${apiUrl}/lsttipodocumentos`, '@tiposDocumentosJSON').as(
    'lsttipodocumentos'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_mot_rechazo_sbs`,
    '@motivosRechazoSBSJSON'
  ).as('obtenerlista-crg_mot_rechazo_sbs');
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_mot_rechazo`,
    '@motivosRechazoJSON'
  ).as('obtenerlista-crg_mot_rechazo');
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_tflujo_sin`,
    '@tipoFlujoJSON'
  ).as('obtenerlista-crg_tflujo_sin');


  cy.route('POST', `${apiUrl}/obtenerlista-crg_incoterm`, '@incotermJSON').as(
    'obtenerlista-crg_incoterm'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_tnaturaleza_embarque`,
    '@naturalezaEmbarqueJSON'
  ).as('obtenerlista-crg_tnaturaleza_embarque');
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_mot_cierre`,
    '@motivoCierreJSON'
  ).as('obtenerlista-crg_mot_cierre');
  // cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@tiposDocumentosJSON');
  cy.route('POST', `${apiUrl}/obtenerlista-crg_tpago`, '@tiposPagoJSON').as(
    'obtenerlista-crg_tpago'
  );
  cy.route('POST', `${apiUrl}/obtenerlista-crg_tmoneda`, '@tiposMonedaJSON').as(
    'obtenerlista-crg_tmoneda'
  );
  cy.route('POST', `${apiUrl}/obtenerlista-crg_tcobro`, '@tiposCobroJSON').as(
    'obtenerlista-crg_tcobro'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_tdoc_pago`,
    '@tiposDocPagoJSON'
  ).as('obtenerlista-crg_tdoc_pago');
  cy.route(
    'POST',
    `${apiUrl}/obtenerlista-crg_tdocident`,
    '@tiposDocIndentJSON'
  );
  cy.route('POST', `${apiUrl}/buscartercero`, '@buscarTerceroJSON');

  cy.fixture('general/listas/obtenerlista-crg_syn_general.json').as('crg_syn_generalJSON');
  cy.route('POST', `${apiUrl}/obtenerlista-crg_syn_general`, '@crg_syn_generalJSON');

});

Cypress.Commands.add('fixtureCargaInicialAnalizarSiniestro', () => {
  // servicios necesarios para la tarea analizar siniestro
  // luego podran redefinirse para las demas tareas
  cy.fixture('usuario/usuario.json').as('usuarioJSON');
  cy.route('POST', `${apiUrl}/obtusuario`, '@usuarioJSON').as('getUsuario');

  cy.fixture('tareas/tarea_3625.json').as('tareaJSON');
  cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

  cy.fixture('tareas/analizar_siniestro/documentos_solicitados.json').as(
    'docsSolicitadosJSON'
  );
  cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitadosJSON').as(
    'obtdocssolicitados'
  );

  cy.fixture('tareas/analizar_siniestro/detalle_siniestro.json').as(
    'detalleSiniestroJSON'
  );
  cy.route('POST', `${apiUrl}/obtdetallesiniestro`, '@detalleSiniestroJSON').as(
    'obtdetallesiniestro'
  );

  cy.fixture('tareas/analizar_siniestro/ramos_coberturas.json').as(
    'ramosCoberturasJSON'
  );
  cy.route('POST', `${apiUrl}/lstramoscoberturas`, '@ramosCoberturasJSON').as(
    'lstramoscoberturas'
  );

  cy.fixture('tareas/analizar_siniestro/lista_pagos.json').as('listaPagosJSON');
  cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

  cy.fixture('tareas/analizar_siniestro/coordenada_bancaria.json').as(
    'coordenadaBancariaJSON'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtcoordenadabancaria`,
    '@coordenadaBancariaJSON'
  ).as('obtcoordenadabancaria');

  cy.fixture('tareas/analizar_siniestro/datos_informe.json').as(
    'datosInformeJSON'
  );
  cy.route('POST', `${apiUrl}/obtdatosinforme`, '@datosInformeJSON').as(
    'obtdatosinforme'
  );

  cy.fixture('tareas/analizar_siniestro/ramos_coberturas_ajustadores.json').as(
    'ramosCoberturasAjustadoresJSON'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtramoscoberturasajustadores`,
    '@ramosCoberturasAjustadoresJSON'
  ).as('obtramoscoberturasajustadores');

  cy.fixture('tareas/analizar_siniestro/detalle_poliza.json').as(
    'detallePolizaJSON'
  );
  cy.route('POST', `${apiUrl}/obtdetallepolizaclaims`, '@detallePolizaJSON').as(
    'obtdetallepolizaclaims'
  );

  cy.fixture('tareas/analizar_siniestro/detalle_certificado.json').as(
    'detalleCertificadoJSON'
  );
  cy.route(
    'POST',
    `${apiUrl}/obtdetallecertificado`,
    '@detalleCertificadoJSON'
  ).as('obtdetallecertificado');


  cy.fixture('general/ajustadores_ramo.json').as('ajustadoresRamoJSON');
  cy.route('POST', `${apiUrl}/lstajustadores`, '@ajustadoresRamoJSON').as(
    'lstajustadores'
  );

  cy.fixture('pagos/mantener_pago.json').as('mantenerPagoJSON');
  cy.route('POST', `${apiUrl}/mantenerpagos`, '@mantenerPagoJSON');

  cy.fixture('tareas/analizar_siniestro/obtbitacoratareas.json').as('obtbitacoratareasJSON');
  cy.route('POST', `${apiUrl}/obtbitacoratareas`, '@obtbitacoratareasJSON');
});
