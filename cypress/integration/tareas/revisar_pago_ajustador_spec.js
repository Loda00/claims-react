
const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones revisar pago ajustador', () => {
  beforeEach(() => {
    cy.server();
    cy.login('klrojas@synopsis.ws', 'Synops1s!');

    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioAjustador();
   
    // servicios necesarios para la tarea
    cy.fixture('tareas/revisar_pago_ajustador/obtbandeja.json').as('tareaJSON');
    cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

    cy.fixture('tareas/revisar_pago_ejecutivo/obtdetallesiniestro.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    cy.fixture('tareas/revisar_pago_ejecutivo/lstramoscoberturas.json').as(
      'ramosCoberturasJSON'
    );
    cy.route('POST', `${apiUrl}/lstramoscoberturas`, '@ramosCoberturasJSON').as(
      'lstramoscoberturas'
    );

    cy.fixture('tareas/revisar_pago_ejecutivo/lstpagos.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    cy.fixture('tareas/revisar_pago_ejecutivo/obtcoordenadabancaria.json').as(
      'coordenadaBancariaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtcoordenadabancaria`,
      '@coordenadaBancariaJSON'
    ).as('obtcoordenadabancaria');

    cy.fixture('tareas/revisar_pago_ejecutivo/obtdatosinforme.json').as(
      'datosInformeJSON'
    );
    cy.route('POST', `${apiUrl}/obtdatosinforme`, '@datosInformeJSON').as(
      'obtdatosinforme'
    );

    cy.fixture(
      'tareas/revisar_pago_ejecutivo/obtramoscoberturasajustadores.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    cy.fixture('tareas/revisar_pago_ejecutivo/obtdetallepolizaclaims.json').as(
      'detallePolizaJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtdetallepolizaclaims`,
      '@detallePolizaJSON'
    ).as('obtdetallepolizaclaims');

    cy.fixture('tareas/revisar_pago_ejecutivo/obtdetallecertificado.json').as(
      'detalleCertificadoJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallecertificado`,
      '@detalleCertificadoJSON'
    ).as('obtdetallecertificado');

    cy.fixture('tareas/revisar_pago_ejecutivo/obtdocssolicitados.json').as(
      'docsSolicitadosJSON'
    );
    cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitadosJSON').as(
      'obtdocssolicitados'
    );

    cy.fixture('tareas/revisar_pago_ejecutivo/obtestadoprocesopago.json').as(
      'estadoprocesopagoJSON'
    );
    cy.route('POST', `${apiUrl}/obtestadoprocesopago`, '@estadoprocesopagoJSON').as(
      'obtestadoprocesopago'
    );

    // carga la aplicacion
    cy.visit('http://localhost:8000');
    cy.wait('@getUsuario');
    cy.get('a[href="/tareas"]').click({ force: true });
    cy.contains('h1', 'Bandeja de Tareas');


    // click en tarea
    cy.get('table>tbody>tr>td.claims-rrgg-table-task>a').click();
    cy.wait([
      '@obtenerlista-crg_reg_tipo_siniestro',
      '@obtenerlista-crg_cpto_pago',
      '@obtdocssolicitados',
      '@obtdetallesiniestro',
      '@lstramoscoberturas',
      '@obtenerlista-crg_mot_rechazo_sbs',
      '@obtenerlista-crg_mot_rechazo',
      '@obtpagos',
      '@obtcoordenadabancaria',
      '@obtdatosinforme',
      '@obtenerlista-crg_tflujo_sin',
      '@obtramoscoberturasajustadores',
      '@obtdetallepolizaclaims',
      '@obtenerlista-crg_incoterm',
      '@obtenerlista-crg_tnaturaleza_embarque',
      '@obtenerlista-crg_mot_cierre',
      '@obtestadoprocesopago'
    ]);

    cy.fixture('tareas/revisar_pago_ajustador/mantener_pago.json').as(
      'mantenerPagoJSON'
    );
    cy.route({
      method: 'POST',
      url: `${apiUrl}/mantenerpagos`,
      onRequest(xhr) {
        const { data: { usuarioModificacion, indModificoAjustador } } = xhr.request.body;
        expect(usuarioModificacion).to.equal('faalfaro@synopsis.ws');
        expect(indModificoAjustador).to.equal('S');
      },
      response: '@mantenerPagoJSON'
    }).as('mantenerpagos');

    cy.fixture('tareas/completaranalizarsiniestro.json').as(
      'completaranalizarsiniestroJSON'
    );
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completaranalizarsiniestro`,
      onRequest(xhr) {
        const {
          flagAprobacion,
          tipoConfirmarGestion,
          idCargoSolicitante,
          montoPagar,
          idAjustador,
          tipoPago,
          idPago
        } = xhr.request.body;
        expect(flagAprobacion).to.be.undefined;
        expect(tipoConfirmarGestion).to.be.undefined;
        expect(montoPagar).to.be.undefined;
        expect(idAjustador).to.be.undefined;
        expect(tipoPago).to.be.undefined;
        expect(idPago).to.be.undefined;
        expect(idCargoSolicitante).to.be.undefined;
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');
  });

  it('debe validar completar tarea revisar pago ajustador', () => {
    cy.get('[data-cy=boton_devolver_revisar_pago]').should('not.exist');
    cy.get(
      '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
    ).should('be.visible');

    cy.get('[data-cy=boton_completar_revisar_pago]').click();
    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'No debe tener pagos de indemnización en estado observado'
    );
    cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
    cy.get('.ant-modal-content').should('not.exist');

    // edita pago 
    cy.get(
      '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
    ).click();

    cy.get('#indemnizacion_modal_indemnizacionBruta').clear();
    cy.get('#indemnizacion_modal_indemnizacionBruta').type('5003');

    cy.get('[data-cy=boton_grabar_indemnizacion]').click();
    cy.get('.ant-modal-content').should('not.exist');
    cy.get('[data-cy=boton_completar_revisar_pago]').click();

    cy.get('.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary').click();

    cy.wait('@completaranalizarsiniestro');
  })
});
