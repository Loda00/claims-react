const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones revisar pago ejecutivo rechazo', () => {
  beforeEach(() => {
    cy.server();
    cy.login('mlpaucara@synopsis.ws', 'Rim@cCl4ims');

    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioEjecutivo();

    // servicios necesarios para la tarea
    cy.fixture('tareas/revisar_pago_ejecutivo_rechazo/obtbandeja.json').as(
      'tareaJSON'
    );
    cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obtdetallesiniestro.json'
    ).as('detalleSiniestroJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/lstramoscoberturas.json'
    ).as('ramosCoberturasJSON');
    cy.route('POST', `${apiUrl}/lstramoscoberturas`, '@ramosCoberturasJSON').as(
      'lstramoscoberturas'
    );

    cy.fixture('tareas/revisar_pago_ejecutivo_rechazo/lstpagos.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obtcoordenadabancaria.json'
    ).as('coordenadaBancariaJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtcoordenadabancaria`,
      '@coordenadaBancariaJSON'
    ).as('obtcoordenadabancaria');

    cy.fixture('tareas/revisar_pago_ejecutivo_rechazo/obtdatosinforme.json').as(
      'datosInformeJSON'
    );
    cy.route('POST', `${apiUrl}/obtdatosinforme`, '@datosInformeJSON').as(
      'obtdatosinforme'
    );

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obtramoscoberturasajustadores.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obtdetallepolizaclaims.json'
    ).as('detallePolizaJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtdetallepolizaclaims`,
      '@detallePolizaJSON'
    ).as('obtdetallepolizaclaims');

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obtdetallecertificado.json'
    ).as('detalleCertificadoJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtdetallecertificado`,
      '@detalleCertificadoJSON'
    ).as('obtdetallecertificado');

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obtdocssolicitados.json'
    ).as('docsSolicitadosJSON');
    cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitadosJSON').as(
      'obtdocssolicitados'
    );

    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obtestadoprocesopago.json'
    ).as('estadoprocesopagoJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtestadoprocesopago`,
      '@estadoprocesopagoJSON'
    ).as('obtestadoprocesopago');

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
      // '@obtpagos',
      // '@obtcoordenadabancaria',
      '@obtdatosinforme',
      '@obtenerlista-crg_tflujo_sin',
      '@obtramoscoberturasajustadores',
      '@obtdetallepolizaclaims',
      '@obtenerlista-crg_incoterm',
      '@obtenerlista-crg_tnaturaleza_embarque',
      '@obtenerlista-crg_mot_cierre',
      '@obtestadoprocesopago'
    ]);
    // stub completaranalizarsiniestro
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
        expect(flagAprobacion).to.equal(true);
        expect(tipoConfirmarGestion).to.equal('A');
        expect(idCargoSolicitante).to.equal(7);
        expect(montoPagar).to.equal(5002);
        expect(idAjustador).to.equal(69);
        expect(tipoPago).to.equal('I');
        expect(idPago).to.equal(1);
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');
  });

  it('completa tarea sin corregir', () => {
    // redefine stub completaranalizarsiniestro
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
        expect(flagAprobacion).to.equal(true);
        expect(tipoConfirmarGestion).to.equal('A');
        expect(idCargoSolicitante).to.equal(7);
        expect(montoPagar).to.equal(undefined);
        expect(idAjustador).to.equal(69);
        expect(tipoPago).to.equal(undefined);
        expect(idPago).to.equal(undefined);
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');
    cy.get('[data-cy=boton_completar_revisar_pago]').click();
    cy.get('.ant-modal-content .ant-modal-confirm-title').should(
      'have.text',
      '¿Desea continuar con la atención del siniestro?'
    );
    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.wait('@completaranalizarsiniestro');
  });

  describe('corrige registrando un pago', () => {
    beforeEach(() => {
      // stub causas
      cy.fixture('tareas/revisar_pago_ejecutivo_rechazo/lstcausas.json').as(
        'lstcausasJSON'
      );
      cy.route('POST', `${apiUrl}/lstcausas`, '@lstcausasJSON').as('lstcausas');

      // stub consecuencias
      cy.fixture(
        'tareas/revisar_pago_ejecutivo_rechazo/lstconsecuencias.json'
      ).as('lstconsecuenciasJSON');
      cy.route(
        'POST',
        `${apiUrl}/lstconsecuencias`,
        '@lstconsecuenciasJSON'
      ).as('lstconsecuencias');

      // stub actualizarreservacobertura
      cy.fixture(
        'tareas/revisar_pago_ejecutivo_rechazo/actualizarreservacobertura.json'
      ).as('actualizarreservacoberturaJSON');
      cy.route(
        'POST',
        `${apiUrl}/actualizarreservacobertura`,
        '@actualizarreservacoberturaJSON'
      ).as('actualizarreservacobertura');

      // stub obthistorialreserva
      cy.fixture(
        'tareas/revisar_pago_ejecutivo_rechazo/obthistorialreserva.json'
      ).as('obthistorialreservaJSON');
      cy.route(
        'POST',
        `${apiUrl}/obthistorialreserva`,
        '@obthistorialreservaJSON'
      ).as('obthistorialreserva');

      // stub mantenerpagos
      cy.fixture('tareas/revisar_pago_ejecutivo_rechazo/mantener_pago.json').as(
        'mantenerPagoJSON'
      );
      cy.route({
        method: 'POST',
        url: `${apiUrl}/mantenerpagos`,
        onRequest(xhr) {
          const {
            data: { usuarioModificacion, indModificoAjustador, idTareaBitacora }
          } = xhr.request.body;
          expect(usuarioModificacion).to.equal('mlpaucara@synopsis.ws');
          expect(indModificoAjustador).to.equal('N');
          expect(idTareaBitacora).to.equal(1292);
        },
        response: '@mantenerPagoJSON'
      }).as('mantenerpagos');

      // stub completaranalizarsiniestro
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
          expect(flagAprobacion).to.equal(true);
          expect(tipoConfirmarGestion).to.equal('A');
          expect(idCargoSolicitante).to.equal(7);
          expect(montoPagar).to.equal(62360.74);
          expect(idAjustador).to.equal(69);
          expect(tipoPago).to.equal('I');
          expect(idPago).to.equal(1);
        },
        response: '@completaranalizarsiniestroJSON'
      }).as('completaranalizarsiniestro');
    });

    it('corrige registrando un pago de indemnizacion', () => {
      // verifica que solo se muestre pagos de indemnizacion y reposicion
      cy.get('.ant-tabs-tab').should('have.length', 2);
      cy.get('.ant-tabs-tab:nth-of-type(1)').should(
        'have.text',
        'Indemnización'
      );
      cy.get('.ant-tabs-tab:nth-of-type(2)').should('have.text', 'Reposición');

      // quita check siniestro sin cobertura
      cy.get('#tabla_coberturas td:nth-child(3)>span').click();
      cy.wait(['@lstcausas', '@lstconsecuencias']);
      cy.get('.ant-modal-content [type="checkbox"]').should('be.checked');
      cy.get('.ant-modal-content [type="checkbox"]').uncheck();

      cy.get('[data-cy=boton_aceptar_editar_cobertura]').click();

      // muestra validacion
      cy.get('[data-cy=boton_completar_revisar_pago]').click();
      cy.get('.ant-modal-content .ant-modal-confirm-content').should(
        'have.text',
        'No debe haber saldo pendiente en coberturas para el pago de una cobertura previamente rechazada'
      );
      cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
      cy.get('.ant-modal-content').should('not.exist');

      // agrega un pago de indemnizacion
      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_indemnizaciones]').click();

      cy.get('#indemnizacion_modal_tipoPago').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('PAGO PARCIAL')
        .click();

      cy.get('#indemnizacion_modal_indemnizacionBruta').type('100');
      cy.get('#indemnizacion_modal_deducible').type('0');

      cy.get('[data-cy=boton_grabar_indemnizacion]').click();
      cy.wait('@mantenerpagos');

      // verifica que no pueda agregar pagos
      cy.get('.ant-modal-content').should('not.exist');
      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.disabled');

      // verifica que reposicion este deshabilitado
      cy.get('.ant-tabs-tab:nth-of-type(2)').click();
      cy.get('[data-cy=boton_agregar_reposicion]').should('be.disabled');

      // intenta completar valida error por saldo !== 0
      cy.get('[data-cy=boton_completar_revisar_pago]').click();
      cy.get('.ant-modal-content .ant-modal-confirm-content').should(
        'have.text',
        'No debe haber saldo pendiente en coberturas para el pago de una cobertura previamente rechazada'
      );
      cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
      cy.get('.ant-modal-content').should('not.exist');

      // corrige pago indemnizacion consumiendo todo el saldo 62,260.74
      cy.get('.ant-tabs-tab:nth-of-type(1)').click();
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
      ).click();

      cy.get('#indemnizacion_modal_indemnizacionBruta').clear();
      cy.get('#indemnizacion_modal_indemnizacionBruta').type('62360.74');

      cy.get('[data-cy=boton_grabar_indemnizacion]').click();
      cy.get('.ant-modal-content').should('not.exist');

      // completa tarea
      cy.get('[data-cy=boton_completar_revisar_pago]').click();
      cy.get(
        '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
      ).click();
    });

    it.only('corrige registrando un pago de reposicion', () => {
      // stub completaranalizarsiniestro
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
          expect(flagAprobacion).to.equal(true);
          expect(tipoConfirmarGestion).to.equal('A');
          expect(idCargoSolicitante).to.equal(7);
          expect(montoPagar).to.equal(62360.74);
          expect(idAjustador).to.equal(69);
          expect(tipoPago).to.equal('R');
          expect(idPago).to.equal(1);
        },
        response: '@completaranalizarsiniestroJSON'
      }).as('completaranalizarsiniestro');

      // verifica que solo se muestre pagos de indemnizacion y reposicion
      cy.get('.ant-tabs-tab').should('have.length', 2);
      cy.get('.ant-tabs-tab:nth-of-type(1)').should(
        'have.text',
        'Indemnización'
      );
      cy.get('.ant-tabs-tab:nth-of-type(2)').should('have.text', 'Reposición');

      // quita check siniestro sin cobertura
      cy.get('#tabla_coberturas td:nth-child(3)>span').click();
      cy.wait(['@lstcausas', '@lstconsecuencias']);
      cy.get('.ant-modal-content [type="checkbox"]').should('be.checked');
      cy.get('.ant-modal-content [type="checkbox"]').uncheck();

      cy.get('[data-cy=boton_aceptar_editar_cobertura]').click();

      // muestra validacion
      cy.get('[data-cy=boton_completar_revisar_pago]').click();
      cy.get('.ant-modal-content .ant-modal-confirm-content').should(
        'have.text',
        'No debe haber saldo pendiente en coberturas para el pago de una cobertura previamente rechazada'
      );
      cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
      cy.get('.ant-modal-content').should('not.exist');

      // agrega un pago de reposicion
      cy.get('.ant-tabs-tab:nth-of-type(2)').click();
      cy.get('[data-cy=boton_agregar_reposicion]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_reposicion]').click();

      cy.seleccionarTercero();

      cy.get('#reposiciones_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('#reposiciones_modal_numSerie').type('123');
      cy.get('#reposiciones_modal_numDocumento').type('123');

      cy.get('[data-cy=saldo_pendiente]').should('contain', '62,360.74');
      // realiza un pago por 100 en la moneda USD
      cy.get('#reposiciones_modal_mtoImporte').type('100');

      cy.get('#modal_reposiciones_grabar').click();
      cy.wait('@mantenerpagos');

      // verifica que no pueda agregar pagos
      cy.get('.ant-modal-content').should('not.exist');
      cy.get('[data-cy=boton_agregar_reposicion]').should('be.disabled');

      // verifica que indemnizacioni este deshabilitado
      cy.get('.ant-tabs-tab:nth-of-type(1)').click();
      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.disabled');

      // intenta completar valida error por saldo !== 0
      cy.get('[data-cy=boton_completar_revisar_pago]').click();
      cy.get('.ant-modal-content .ant-modal-confirm-content').should(
        'have.text',
        'No debe haber saldo pendiente en coberturas para el pago de una cobertura previamente rechazada'
      );
      cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
      cy.get('.ant-modal-content').should('not.exist');

      // corrige pago reposicion consumiendo todo el saldo 62,260.74
      cy.get('.ant-tabs-tab:nth-of-type(2)').click();
      cy.get(
        '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
      ).click();

      cy.get('#reposiciones_modal_mtoImporte').clear();
      cy.get('#reposiciones_modal_mtoImporte').type('62360.74');

      cy.get('#modal_reposiciones_grabar').click();
      cy.get('.ant-modal-content').should('not.exist');

      // completa tarea
      cy.get('[data-cy=boton_completar_revisar_pago]').click();
      cy.get(
        '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
      ).click();
    });
  });
});
