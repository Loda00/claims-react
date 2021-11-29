const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones revisar informe basico', () => {
  beforeEach(() => {
    cy.server();
    cy.login('mlpaucara@synopsis.ws', 'Rim@cCl4ims');

    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioEjecutivo();
    // servicios necesarios para la tarea
    cy.fixture('tareas/revisar_informe_basico/obtbandeja.json').as('tareaJSON');
    cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

    cy.fixture('tareas/revisar_informe_basico/obtdetallesiniestro.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    cy.fixture('tareas/revisar_informe_basico/lstramoscoberturas.json').as(
      'ramosCoberturasJSON'
    );
    cy.route('POST', `${apiUrl}/lstramoscoberturas`, '@ramosCoberturasJSON').as(
      'lstramoscoberturas'
    );

    cy.fixture('tareas/revisar_informe_basico/lstpagos.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    cy.fixture('tareas/revisar_informe_basico/obtcoordenadabancaria.json').as(
      'coordenadaBancariaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtcoordenadabancaria`,
      '@coordenadaBancariaJSON'
    ).as('obtcoordenadabancaria');

    cy.fixture('tareas/revisar_informe_basico/obtdatosinforme.json').as(
      'datosInformeJSON'
    );
    cy.route('POST', `${apiUrl}/obtdatosinforme`, '@datosInformeJSON').as(
      'obtdatosinforme'
    );

    cy.fixture(
      'tareas/revisar_informe_basico/obtramoscoberturasajustadores.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    cy.fixture('tareas/revisar_informe_basico/obtdetallepolizaclaims.json').as(
      'detallePolizaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallepolizaclaims`,
      '@detallePolizaJSON'
    ).as('obtdetallepolizaclaims');

    cy.fixture('tareas/revisar_informe_basico/obtdetallecertificado.json').as(
      'detalleCertificadoJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallecertificado`,
      '@detalleCertificadoJSON'
    ).as('obtdetallecertificado');

    cy.fixture('tareas/revisar_informe_basico/obtdocssolicitados.json').as(
      'docsSolicitadosJSON'
    );
    cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitadosJSON').as(
      'obtdocssolicitados'
    );

    cy.fixture('tareas/revisar_informe_basico/lstajustadores.json').as(
      'ajustadoresRamoJSON'
    );
    cy.route('POST', `${apiUrl}/lstajustadores`, '@ajustadoresRamoJSON').as(
      'lstajustadores'
    );

    cy.visit('http://localhost:8000');

    cy.wait('@getUsuario');

    cy.get('a[href="/tareas"]').click({ force: true });
    cy.contains('h1', 'Bandeja de Tareas');
  });

  it('verifica modal cambiar estado cobertura: indemnizacion', () => {
    // stub obtramoscoberturasajustadores con estado PENDIENTE
    cy.fixture(
      'tareas/revisar_informe_basico/obtramoscoberturasajustadores_pendiente.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    // stub tiene el pago en estado PENDIENTE
    cy.fixture('tareas/revisar_informe_basico/lstpagos_pendiente.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    // click en tarea
    cy.get('table>tbody>tr>td.claims-rrgg-table-task>a').click();
    cy.wait([
      '@obtenerlista-crg_reg_tipo_siniestro',
      '@obtenerlista-crg_cpto_pago',
      '@obtdocssolicitados',
      '@lsttipodocumentos',
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
      '@obtenerlista-crg_mot_cierre'
    ]);

    // stub procesarpago
    cy.fixture('tareas/completaranalizarsiniestro.json').as(
      'completaranalizarsiniestroJSON'
    );

    cy.route(
      'POST',
      `${apiUrl}/procesarpago`,
      '@completaranalizarsiniestroJSON'
    ).as('procesarpago');

    // stub actualizarreservacobertura
    cy.fixture(
      'tareas/revisar_informe_basico/actualizarreservacobertura.json'
    ).as('actualizarreservacoberturaJSON');
    cy.route(
      'POST',
      `${apiUrl}/actualizarreservacobertura`,
      '@actualizarreservacoberturaJSON'
    ).as('actualizarreservacobertura');

    // stub causas
    cy.fixture('tareas/revisar_pago_ejecutivo_rechazo/lstcausas.json').as(
      'lstcausasJSON'
    );
    cy.route('POST', `${apiUrl}/lstcausas`, '@lstcausasJSON').as('lstcausas');

    // stub consecuencias
    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/lstconsecuencias.json'
    ).as('lstconsecuenciasJSON');
    cy.route('POST', `${apiUrl}/lstconsecuencias`, '@lstconsecuenciasJSON').as(
      'lstconsecuencias'
    );

    // stub obthistorialreserva
    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obthistorialreserva.json'
    ).as('obthistorialreservaJSON');
    cy.route(
      'POST',
      `${apiUrl}/obthistorialreserva`,
      '@obthistorialreservaJSON'
    ).as('obthistorialreserva');

    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();

    // intenta enviar el pago
    cy.get(
      '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();

    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'La cobertura correspondiente está pendiente. Primero debe editar y grabar la cobertura para poder enviar el pago.'
    );
    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.get('.ant-modal-content').should('not.exist');

    // click seccion coberturas
    cy.get('.ant-collapse-item:nth-of-type(4)').click();
    // devuelve a REGISTRADO la cobertura
    cy.get('#tabla_coberturas td:nth-child(3)>span').click();
    cy.get('[data-cy=boton_aceptar_editar_cobertura]').click();

    // intenta enviar el pago: se debe poder
    cy.get(
      '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();

  });

  it('verifica modal cambiar estado cobertura: reposicion', () => {
    // stub obtramoscoberturasajustadores con estado PENDIENTE
    cy.fixture(
      'tareas/revisar_informe_basico/obtramoscoberturasajustadores_pendiente.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    // stub tiene el pago en estado PENDIENTE
    cy.fixture('tareas/revisar_informe_basico/lstpagos_pendiente.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    // click en tarea
    cy.get('table>tbody>tr>td.claims-rrgg-table-task>a').click();
    cy.wait([
      '@obtenerlista-crg_reg_tipo_siniestro',
      '@obtenerlista-crg_cpto_pago',
      '@obtdocssolicitados',
      '@lsttipodocumentos',
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
      '@obtenerlista-crg_mot_cierre'
    ]);

    // stub procesarpago
    cy.fixture('tareas/completaranalizarsiniestro.json').as(
      'completaranalizarsiniestroJSON'
    );

    cy.route(
      'POST',
      `${apiUrl}/procesarpago`,
      '@completaranalizarsiniestroJSON'
    ).as('procesarpago');

    // stub actualizarreservacobertura
    cy.fixture(
      'tareas/revisar_informe_basico/actualizarreservacobertura.json'
    ).as('actualizarreservacoberturaJSON');
    cy.route(
      'POST',
      `${apiUrl}/actualizarreservacobertura`,
      '@actualizarreservacoberturaJSON'
    ).as('actualizarreservacobertura');

    // stub causas
    cy.fixture('tareas/revisar_pago_ejecutivo_rechazo/lstcausas.json').as(
      'lstcausasJSON'
    );
    cy.route('POST', `${apiUrl}/lstcausas`, '@lstcausasJSON').as('lstcausas');

    // stub consecuencias
    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/lstconsecuencias.json'
    ).as('lstconsecuenciasJSON');
    cy.route('POST', `${apiUrl}/lstconsecuencias`, '@lstconsecuenciasJSON').as(
      'lstconsecuencias'
    );

    // stub obthistorialreserva
    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obthistorialreserva.json'
    ).as('obthistorialreservaJSON');
    cy.route(
      'POST',
      `${apiUrl}/obthistorialreserva`,
      '@obthistorialreservaJSON'
    ).as('obthistorialreserva');

    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // click tab reposicion
    cy.get('.ant-tabs-tab:nth-of-type(4)').click();

    // intenta enviar el pago
    cy.get(
      '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();

    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'La cobertura correspondiente está pendiente. Primero debe editar y grabar la cobertura para poder enviar el pago.'
    );
    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.get('.ant-modal-content').should('not.exist');

    // click seccion coberturas
    cy.get('.ant-collapse-item:nth-of-type(4)').click();
    // devuelve a REGISTRADO la cobertura
    cy.get('#tabla_coberturas td:nth-child(3)>span').click();
    cy.get('[data-cy=boton_aceptar_editar_cobertura]').click();

    // intenta enviar el pago: se debe poder
    cy.get(
      '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();

  });

  it('verifica modal cambiar estado cobertura: honorarios', () => {

    // stub obtdetallesiniestro con estado PENDIENTE
    cy.fixture('tareas/revisar_informe_basico/obtdetallesiniestro_pendiente.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    // stub obtramoscoberturasajustadores con estado PENDIENTE
    cy.fixture(
      'tareas/revisar_informe_basico/obtramoscoberturasajustadores_pendiente.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    // stub tiene el pago en estado PENDIENTE
    cy.fixture('tareas/revisar_informe_basico/lstpagos_pendiente.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    // click en tarea
    cy.get('table>tbody>tr>td.claims-rrgg-table-task>a').click();
    cy.wait([
      '@obtenerlista-crg_reg_tipo_siniestro',
      '@obtenerlista-crg_cpto_pago',
      '@obtdocssolicitados',
      '@lsttipodocumentos',
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
      '@obtenerlista-crg_mot_cierre'
    ]);

    // stub procesarpago
    cy.fixture('tareas/completaranalizarsiniestro.json').as(
      'completaranalizarsiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/procesarpago`,
      '@completaranalizarsiniestroJSON'
    ).as('procesarpago');

    // stub mantenerotrosconceptos
    cy.fixture('tareas/revisar_informe_basico/mantenerotrosconceptos.json').as(
      'mantenerotrosconceptosJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/mantenerotrosconceptos`,
      '@mantenerotrosconceptosJSON'
    ).as('mantenerotrosconceptos');

    // stub obthistorialreserva
    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obthistorialreserva.json'
    ).as('obthistorialreservaJSON');
    cy.route(
      'POST',
      `${apiUrl}/obthistorialreserva`,
      '@obthistorialreservaJSON'
    ).as('obthistorialreserva');

    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // click tab honorarios
    cy.get('.ant-tabs-tab:nth-of-type(2)').click();

    // intenta enviar el pago
    cy.get(
      '#tabla_pagos_honorarios .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();

    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'La reserva otros conceptos correspondiente está pendiente. Primero debe editar y grabar la reserva para poder enviar el pago.'
    );
    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.get('.ant-modal-content').should('not.exist');

    // click seccion siniestro
    cy.get('.ant-collapse-item:nth-of-type(3)').click();
    // devuelve a REGISTRADO concepto ajustador
    cy.get('#tabla_otros_conceptos tr:nth-child(1)>td:nth-child(3)>a').click();
    cy.get('[data-cy=boton_aceptar_editar_concepto]').click();

    cy.get('.ant-modal-content .ant-modal-confirm-title').should(
      'have.text',
      'Los cambios se enviarán directo al core. ¿Desea continuar con la operación?'
    );
    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.wait('@mantenerotrosconceptos');
    cy.get('.ant-modal-content').should('not.exist');
    // intenta enviar el pago: se debe poder
    cy.get(
      '#tabla_pagos_honorarios .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();
  });

  it('verifica modal cambiar estado concepto: otrosConceptos', () => {

    // stub obtdetallesiniestro con estado PENDIENTE
    cy.fixture('tareas/revisar_informe_basico/obtdetallesiniestro_pendiente.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    // stub obtramoscoberturasajustadores con estado PENDIENTE
    cy.fixture(
      'tareas/revisar_informe_basico/obtramoscoberturasajustadores_pendiente.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    // stub tiene el pago en estado PENDIENTE
    cy.fixture('tareas/revisar_informe_basico/lstpagos_pendiente.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    // click en tarea
    cy.get('table>tbody>tr>td.claims-rrgg-table-task>a').click();
    cy.wait([
      '@obtenerlista-crg_reg_tipo_siniestro',
      '@obtenerlista-crg_cpto_pago',
      '@obtdocssolicitados',
      '@lsttipodocumentos',
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
      '@obtenerlista-crg_mot_cierre'
    ]);

    // stub procesarpago
    cy.fixture('tareas/completaranalizarsiniestro.json').as(
      'completaranalizarsiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/procesarpago`,
      '@completaranalizarsiniestroJSON'
    ).as('procesarpago');

    // stub mantenerotrosconceptos
    cy.fixture('tareas/revisar_informe_basico/mantenerotrosconceptos.json').as(
      'mantenerotrosconceptosJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/mantenerotrosconceptos`,
      '@mantenerotrosconceptosJSON'
    ).as('mantenerotrosconceptos');

    // stub obthistorialreserva
    cy.fixture(
      'tareas/revisar_pago_ejecutivo_rechazo/obthistorialreserva.json'
    ).as('obthistorialreservaJSON');
    cy.route(
      'POST',
      `${apiUrl}/obthistorialreserva`,
      '@obthistorialreservaJSON'
    ).as('obthistorialreserva');

    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // click tab otros conceptos
    cy.get('.ant-tabs-tab:nth-of-type(3)').click();

    // intenta enviar el pago
    cy.get(
      '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();

    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'La reserva otros conceptos correspondiente está pendiente. Primero debe editar y grabar la reserva para poder enviar el pago.'
    );
    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.get('.ant-modal-content').should('not.exist');

    // click seccion siniestro
    cy.get('.ant-collapse-item:nth-of-type(3)').click();
    // devuelve a REGISTRADO concepto ajustador
    cy.get('#tabla_otros_conceptos tr:nth-child(2)>td:nth-child(3)>a').click();
    cy.get('[data-cy=boton_aceptar_editar_concepto]').click();

    cy.get('.ant-modal-content .ant-modal-confirm-title').should(
      'have.text',
      'Los cambios se enviarán directo al core. ¿Desea continuar con la operación?'
    );
    cy.get(
      '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    ).click();
    cy.wait('@mantenerotrosconceptos');
    cy.get('.ant-modal-content').should('not.exist');
    // intenta enviar el pago: se debe poder
    cy.get(
      '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).click();

  });

  describe('prueba completar', () => {
    beforeEach(() => {
      // click en tarea
      cy.get('table>tbody>tr>td.claims-rrgg-table-task>a').click();
      cy.wait([
        '@obtenerlista-crg_reg_tipo_siniestro',
        '@obtenerlista-crg_cpto_pago',
        '@obtdocssolicitados',
        '@lsttipodocumentos',
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
        '@obtenerlista-crg_mot_cierre'
      ]);
      cy.fixture('tareas/generar_informe_basico/mantener_pago.json').as(
        'mantenerPagoJSON'
      );
      cy.route({
        method: 'POST',
        url: `${apiUrl}/mantenerpagos`,
        onRequest(xhr) {
          const {
            data: {
              usuarioModificacion,
              indCreoAjustador,
              indModificoAjustador
            }
          } = xhr.request.body;
          expect(usuarioModificacion).to.equal('faalfaro@synopsis.ws');
          expect(indCreoAjustador).to.equal('S');
          expect(indModificoAjustador).to.equal('S');
        },
        response: '@mantenerPagoJSON'
      }).as('mantenerpagos');
    });

    it.skip('aprueba tarea', () => {
      // cy.fixture('tareas/completaranalizarsiniestro.json').as(
      //   'completaranalizarsiniestroJSON'
      // );

      // // stub procesarpago
      // cy.route('POST', `${apiUrl}/procesarpago`, '@completaranalizarsiniestroJSON').as(
      //   'procesarpago'
      // );

      // stub completar tarea
      cy.fixture('tareas/completaranalizarsiniestro.json').as(
        'completaranalizarsiniestroJSON'
      );
      cy.route({
        method: 'POST',
        url: `${apiUrl}/completaranalizarsiniestro`,
        onRequest(xhr) {
          const {
            indAprobacionInforme,
            siniestro: {
              indTercerAfectado,
              indRecupero,
              indSalvamento,
              indRegCoaseguro,
              indRegReaseguro
            } = {},
            auditoria: { usuario } = {},
            idCase,
            codTarea,
            informe: {
              ajustador: { idUsuarioBPM } = {},
              indInformeBasico,
              indReqNuevoAjustador
            } = {}
          } = xhr.request.body;
          expect(indAprobacionInforme).to.equal('S');
          expect(indTercerAfectado).to.equal('N');
          expect(indRecupero).to.equal('N');
          expect(indSalvamento).to.equal('N');
          expect(indRegCoaseguro).to.equal('N');
          expect(indRegReaseguro).to.equal('S');
          expect(usuario).to.equal('mlpaucara@synopsis.ws');
          expect(idCase).to.equal(20566);
          expect(codTarea).to.equal('162');
          expect(idUsuarioBPM).to.equal(69);
          expect(indInformeBasico).to.equal('N');
          expect(indReqNuevoAjustador).to.equal('N');
        },
        response: '@completaranalizarsiniestroJSON'
      }).as('completaranalizarsiniestro');

      // click seccion pagos
      cy.get('.ant-collapse-item:nth-of-type(9)').click();

      // verifica que el pago en estado PENDIENTE con CODPROCESO
      // no tenga los botones de accion
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-delete'
      ).should('not.be.visible');
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
      ).should('not.be.visible');
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
      ).should('not.be.visible');

      // intenta completar tarea
      // debe pasar porque el unico pago en estado pendiente
      // tiene codProceso
      cy.get('[data-cy=boton_aprobar_revisar_informe]').click();
      cy.get('.ant-modal-content .ant-modal-confirm-title').should(
        'have.text',
        '¿Desea continuar con la atención del siniestro?'
      );
      cy.get(
        '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
      ).click();
      cy.wait('@completaranalizarsiniestro');

      // cy.get('[data-cy=boton_aprobar_revisar_informe_basico]').click();
      // cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      //   'have.text',
      //   'No debe tener pagos de indemnización en estado pendiente'
      // );
      // cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
      // cy.get('.ant-modal-content').should('not.exist');

      // // click seccion pagos
      // cy.get('.ant-collapse-item:nth-of-type(9)').click();

      // // envia pago
      // cy.get(
      //   '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
      // ).click();

      // cy.wait('@procesarpago');

      // cy.get('[data-cy=boton_aprobar_revisar_informe_basico]').should(
      //   'be.enabled'
      // );
      // cy.get('[data-cy=boton_aprobar_revisar_informe_basico]').click();
      // cy.get('.ant-modal-content .ant-modal-confirm-title').should(
      //   'have.text',
      //   '¿Desea continuar con la atención del siniestro?'
      // );
      // cy.get(
      //   '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
      // ).click();
      // cy.wait('@completaranalizarsiniestro');
    });

    it.skip('devuelve tarea', () => {
      // stub completar tarea
      cy.fixture('tareas/completaranalizarsiniestro.json').as(
        'completaranalizarsiniestroJSON'
      );
      cy.route({
        method: 'POST',
        url: `${apiUrl}/completaranalizarsiniestro`,
        onRequest(xhr) {
          const {
            indAprobacionInforme,
            siniestro: {
              indTercerAfectado,
              indRecupero,
              indSalvamento,
              indRegCoaseguro,
              indRegReaseguro
            } = {},
            auditoria: { usuario } = {},
            idCase,
            codTarea,
            informe: {
              ajustador: { idUsuarioBPM } = {},
              indInformeBasico,
              indReqNuevoAjustador
            } = {}
          } = xhr.request.body;
          expect(indAprobacionInforme).to.equal('N');
          expect(indTercerAfectado).to.equal('N');
          expect(indRecupero).to.equal('N');
          expect(indSalvamento).to.equal('N');
          expect(indRegCoaseguro).to.equal('N');
          expect(indRegReaseguro).to.equal('S');
          expect(usuario).to.equal('mlpaucara@synopsis.ws');
          expect(idCase).to.equal(20566);
          expect(codTarea).to.equal('162');
          expect(idUsuarioBPM).to.equal(69);
          expect(indInformeBasico).to.equal('N');
          expect(indReqNuevoAjustador).to.equal('N');
        },
        response: '@completaranalizarsiniestroJSON'
      }).as('completaranalizarsiniestro');

      // click seccion pagos
      cy.get('.ant-collapse-item:nth-of-type(9)').click();

      // verifica que el pago en estado PENDIENTE con CODPROCESO
      // no tenga los botones de accion
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-delete'
      ).should('not.be.visible');
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
      ).should('not.be.visible');
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
      ).should('not.be.visible');

      // intenta completar tarea
      // debe pasar porque el unico pago en estado pendiente
      // tiene codProceso
      cy.get('[data-cy=boton_devolver_revisar_informe]').click();

      // ingresa observaciones
      cy.get('#analizarInformeBasico_observaciones').should('be.visible');
      cy.get('#analizarInformeBasico_observaciones').type(
        'observacion de ejemplo devolver en revisar informe basico'
      );

      cy.get('[data-cy=boton_devolver_revisar_informe]').click();
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
});
