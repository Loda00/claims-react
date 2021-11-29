const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones revisar pago ejecutivo', () => {
  beforeEach(() => {
    cy.server();
    cy.login('mlpaucara@synopsis.ws', 'Rim@cCl4ims');

    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioEjecutivo();

    // servicios necesarios para la tarea
    cy.fixture('tareas/revisar_pago_ejecutivo/obtbandeja.json').as('tareaJSON');
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
      'detallePolizaJSON'
    );
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

  });

  it.only('el ejecutivo devuelve el pago al ajustador', () => {
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

    cy.fixture('tareas/revisar_pago_ejecutivo/mantener_pago.json').as(
      'mantenerPagoJSON'
    );
    cy.route({
      method: 'POST',
      url: `${apiUrl}/mantenerpagos`,
      onRequest(xhr) {
        const { data: { usuarioModificacion, indModificoAjustador } } = xhr.request.body;
        expect(usuarioModificacion).to.equal('mlpaucara@synopsis.ws');
        expect(indModificoAjustador).to.equal('N');
      },
      response: '@mantenerPagoJSON'
    }).as('mantenerpagos');

    cy.fixture(
      'tareas/completaranalizarsiniestro.json'
    ).as('completaranalizarsiniestroJSON');
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completaranalizarsiniestro`,
      onRequest(xhr) {
        const {
          flagAprobacion,
          tipoConfirmarGestion,
          idCargoBpm,
          montoPagar,
          idAjustador,
          tipoPago,
          idPago,
          indCreoAjustador
        } = xhr.request.body;
        expect(flagAprobacion).to.equal('S');
        expect(tipoConfirmarGestion).to.equal('A');
        expect(idCargoBpm).to.equal(7);
        expect(montoPagar).to.equal(5002);
        expect(idAjustador).to.equal(69);
        expect(tipoPago).to.equal('I');
        expect(idPago).to.equal(252);
        expect(indCreoAjustador).to.equal('S');
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');

    // verifica que esten todos los tabs de pagos
    cy.get('.ant-tabs-tab').should('have.length', 6);

    cy.get('[data-cy=boton_devolver_revisar_pago]').should('be.visible');
    cy.get('[data-cy=boton_devolver_revisar_pago]').click();

    cy.get('#revisar_pago_observaciones').should('be.visible');
    cy.get('#revisar_pago_observaciones').type(
      'observacion de ejemplo para generar revisar pago ajustador'
    );

    // devuelve la tarea al ajustador
    cy.get('[data-cy=boton_devolver_revisar_pago]').click();
    cy.get('.ant-modal-content .ant-modal-confirm-title').should(
      'have.text',
      '¿Desea continuar con la atención del siniestro?'
    );

    // redefine ruta para hacer assert en caso de devolucion
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completaranalizarsiniestro`,
      onRequest(xhr) {
        const {
          flagAprobacion,
          tipoConfirmarGestion,
          idCargoBpm,
          montoPagar,
          idAjustador,
          tipoPago,
          idPago,
          indCreoAjustador
        } = xhr.request.body;
        expect(flagAprobacion).to.equal('N');
        expect(tipoConfirmarGestion).to.equal('A');
        expect(idCargoBpm).to.equal(7);
        expect(montoPagar).to.equal(5002);
        expect(idAjustador).to.equal(69);
        expect(tipoPago).to.equal('I');
        expect(idPago).to.equal(252);
        expect(indCreoAjustador).to.equal('S');
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');

    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.wait('@completaranalizarsiniestro');
  });

  it('el ejecutivo modifica el pago y completa tarea', () => {
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

    cy.fixture('tareas/revisar_pago_ejecutivo/mantener_pago.json').as(
      'mantenerPagoJSON'
    );
    cy.route({
      method: 'POST',
      url: `${apiUrl}/mantenerpagos`,
      onRequest(xhr) {
        const { data: { usuarioModificacion, indModificoAjustador } } = xhr.request.body;
        expect(usuarioModificacion).to.equal('mlpaucara@synopsis.ws');
        expect(indModificoAjustador).to.equal('N');
      },
      response: '@mantenerPagoJSON'
    }).as('mantenerpagos');

    cy.fixture(
      'tareas/completaranalizarsiniestro.json'
    ).as('completaranalizarsiniestroJSON');
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completaranalizarsiniestro`,
      onRequest(xhr) {
        const {
          flagAprobacion,
          tipoConfirmarGestion,
          idCargoBpm,
          montoPagar,
          idAjustador,
          tipoPago,
          idPago,
          indCreoAjustador
        } = xhr.request.body;
        expect(flagAprobacion).to.equal('S');
        expect(tipoConfirmarGestion).to.equal('A');
        expect(idCargoBpm).to.equal(7);
        expect(montoPagar).to.equal(5002);
        expect(idAjustador).to.equal(69);
        expect(tipoPago).to.equal('I');
        expect(idPago).to.equal(252);
        expect(indCreoAjustador).to.equal('S');
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');

    // verifica que esten todos los tabs de pagos
    cy.get('.ant-tabs-tab').should('have.length', 6);

    // intenta completar la tarea
    cy.get('[data-cy=boton_completar_revisar_pago]').should('be.visible');
    cy.get('[data-cy=boton_completar_revisar_pago]').click();

    // muestra validacion
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
    cy.get('#indemnizacion_modal_indemnizacionBruta').type('5002');

    cy.get('[data-cy=boton_grabar_indemnizacion]').click();
    cy.get('.ant-modal-content').should('not.exist');

    // verifica que el boton devolver desapareza una vez modificado el pago
    cy.get('[data-cy=boton_devolver_revisar_pago]').should('not.exist');

    // completa tarea
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

  it('validaciones caso liquidacion - analizar siniestro', () => {

    cy.fixture('tareas/revisar_pago_ejecutivo/obtdetallesiniestro_liquidacion_as.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

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

    cy.fixture('tareas/revisar_pago_ejecutivo/mantener_pago.json').as(
      'mantenerPagoJSON'
    );
    cy.route({
      method: 'POST',
      url: `${apiUrl}/mantenerpagos`,
      onRequest(xhr) {
        const { data: { usuarioModificacion, indModificoAjustador } } = xhr.request.body;
        expect(usuarioModificacion).to.equal('mlpaucara@synopsis.ws');
        expect(indModificoAjustador).to.equal('N');
      },
      response: '@mantenerPagoJSON'
    }).as('mantenerpagos');

    cy.fixture(
      'tareas/completaranalizarsiniestro.json'
    ).as('completaranalizarsiniestroJSON');
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completaranalizarsiniestro`,
      onRequest(xhr) {
        const {
          flagAprobacion,
          tipoConfirmarGestion,
          idCargoBpm,
          montoPagar,
          idAjustador,
          tipoPago,
          idPago,
          indCreoAjustador
        } = xhr.request.body;
        expect(flagAprobacion).to.equal('S');
        expect(tipoConfirmarGestion).to.equal('A');
        expect(idCargoBpm).to.equal(7);
        expect(montoPagar).to.equal(74999);
        expect(idAjustador).to.equal(69);
        expect(tipoPago).to.equal('I');
        expect(idPago).to.equal(252);
        expect(indCreoAjustador).to.equal('S');
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');
    // verifica que esten todos los tabs de pagos
    cy.get('.ant-tabs-tab').should('have.length', 6);

    // intenta completar la tarea
    cy.get('[data-cy=boton_completar_revisar_pago]').should('be.visible');
    cy.get('[data-cy=boton_completar_revisar_pago]').click();

    // muestra validacion
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
    cy.get('#indemnizacion_modal_indemnizacionBruta').type('5002');

    cy.get('[data-cy=boton_grabar_indemnizacion]').click();
    cy.get('.ant-modal-content').should('not.exist');

    // verifica que el boton devolver desapareza una vez modificado el pago
    cy.get('[data-cy=boton_devolver_revisar_pago]').should('not.exist');

    // muestra validacion saldo coberturas
    cy.get('[data-cy=boton_completar_revisar_pago]').click();
    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'No debe haber saldo pendiente en coberturas para poder completar la tarea'
    );
    cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
    cy.get('.ant-modal-content').should('not.exist');

    // edita pago
    cy.get(
      '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
    ).click();

    cy.get('#indemnizacion_modal_indemnizacionBruta').clear();
    cy.get('#indemnizacion_modal_indemnizacionBruta').type('74999');

    cy.get('[data-cy=boton_grabar_indemnizacion]').click();
    cy.get('.ant-modal-content').should('not.exist');

    // completa tarea
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

  it('validaciones caso liquidacion - revisar informe', () => {

    cy.fixture('tareas/revisar_pago_ejecutivo/obtdetallesiniestro_liquidacion_ri.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

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

    cy.fixture('tareas/revisar_pago_ejecutivo/mantener_pago.json').as(
      'mantenerPagoJSON'
    );
    cy.route({
      method: 'POST',
      url: `${apiUrl}/mantenerpagos`,
      onRequest(xhr) {
        const { data: { usuarioModificacion, indModificoAjustador } } = xhr.request.body;
        expect(usuarioModificacion).to.equal('mlpaucara@synopsis.ws');
        expect(indModificoAjustador).to.equal('N');
      },
      response: '@mantenerPagoJSON'
    }).as('mantenerpagos');

    cy.fixture(
      'tareas/completaranalizarsiniestro.json'
    ).as('completaranalizarsiniestroJSON');
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completaranalizarsiniestro`,
      onRequest(xhr) {
        const {
          flagAprobacion,
          tipoConfirmarGestion,
          idCargoBpm,
          montoPagar,
          idAjustador,
          tipoPago,
          idPago,
          indCreoAjustador
        } = xhr.request.body;
        expect(flagAprobacion).to.equal('S');
        expect(tipoConfirmarGestion).to.equal('A');
        expect(idCargoBpm).to.equal(7);
        expect(montoPagar).to.equal(74999);
        expect(idAjustador).to.equal(69);
        expect(tipoPago).to.equal('I');
        expect(idPago).to.equal(252);
        expect(indCreoAjustador).to.equal('S');
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');
    // verifica que esten todos los tabs de pagos
    cy.get('.ant-tabs-tab').should('have.length', 6);

    // intenta completar la tarea
    cy.get('[data-cy=boton_completar_revisar_pago]').should('be.visible');
    cy.get('[data-cy=boton_completar_revisar_pago]').click();

    // muestra validacion
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
    cy.get('#indemnizacion_modal_indemnizacionBruta').type('5002');

    cy.get('[data-cy=boton_grabar_indemnizacion]').click();
    cy.get('.ant-modal-content').should('not.exist');

    // verifica que el boton devolver desapareza una vez modificado el pago
    cy.get('[data-cy=boton_devolver_revisar_pago]').should('not.exist');

    // muestra validacion saldo coberturas
    cy.get('[data-cy=boton_completar_revisar_pago]').click();
    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'No debe haber saldo pendiente en coberturas para poder completar la tarea'
    );
    cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
    cy.get('.ant-modal-content').should('not.exist');

    // edita pago
    cy.get(
      '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
    ).click();

    cy.get('#indemnizacion_modal_indemnizacionBruta').clear();
    cy.get('#indemnizacion_modal_indemnizacionBruta').type('74999');

    cy.get('[data-cy=boton_grabar_indemnizacion]').click();
    cy.get('.ant-modal-content').should('not.exist');


    // completa tarea
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
});
