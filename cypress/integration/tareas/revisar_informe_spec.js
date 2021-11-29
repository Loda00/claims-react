
const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones revisar informe', () => {
  beforeEach(() => {
    cy.server();
    cy.login('mlpaucara@synopsis.ws', 'Rim@cCl4ims');

    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioEjecutivo();
    // servicios necesarios para la tarea
    cy.fixture('tareas/revisar_informe/obtbandeja.json').as('tareaJSON');
    cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

    cy.fixture('tareas/revisar_informe/obtdetallesiniestro.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    cy.fixture('tareas/revisar_informe/lstramoscoberturas.json').as(
      'ramosCoberturasJSON'
    );
    cy.route('POST', `${apiUrl}/lstramoscoberturas`, '@ramosCoberturasJSON').as(
      'lstramoscoberturas'
    );

    cy.fixture('tareas/revisar_informe/lstpagos.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    cy.fixture('tareas/revisar_informe/obtcoordenadabancaria.json').as(
      'coordenadaBancariaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtcoordenadabancaria`,
      '@coordenadaBancariaJSON'
    ).as('obtcoordenadabancaria');

    cy.fixture('tareas/revisar_informe/obtdatosinforme.json').as(
      'datosInformeJSON'
    );
    cy.route('POST', `${apiUrl}/obtdatosinforme`, '@datosInformeJSON').as(
      'obtdatosinforme'
    );

    cy.fixture(
      'tareas/revisar_informe/obtramoscoberturasajustadores.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    cy.fixture('tareas/revisar_informe/obtdetallepolizaclaims.json').as(
      'detallePolizaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallepolizaclaims`,
      '@detallePolizaJSON'
    ).as('obtdetallepolizaclaims');

    cy.fixture('tareas/revisar_informe/obtdetallecertificado.json').as(
      'detalleCertificadoJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallecertificado`,
      '@detalleCertificadoJSON'
    ).as('obtdetallecertificado');

    cy.fixture('tareas/revisar_informe/obtdocssolicitados.json').as(
      'docsSolicitadosJSON'
    );
    cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitadosJSON').as(
      'obtdocssolicitados'
    );

    cy.fixture('tareas/revisar_informe/lstajustadores.json').as(
      'ajustadoresRamoJSON'
    );
    cy.route('POST', `${apiUrl}/lstajustadores`, '@ajustadoresRamoJSON').as(
      'lstajustadores'
    );

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
          data: { usuarioModificacion, indCreoAjustador, indModificoAjustador }
        } = xhr.request.body;
        expect(usuarioModificacion).to.equal('faalfaro@synopsis.ws');
        expect(indCreoAjustador).to.equal('S');
        expect(indModificoAjustador).to.equal('S');
      },
      response: '@mantenerPagoJSON'
    }).as('mantenerpagos');
  });

  it('aprueba tarea', () => {
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
          idCase,
          codTarea,
          informe: {
            ajustador: { idUsuarioBPM } = {},
            indReqNuevoAjustador,
            indInformeFinal
          } = {}
        } = xhr.request.body;
        expect(indAprobacionInforme).to.equal('S');
        expect(indTercerAfectado).to.equal('N');
        expect(indRecupero).to.equal('N');
        expect(indSalvamento).to.equal('N');
        expect(indRegCoaseguro).to.equal('N');
        expect(indRegReaseguro).to.equal('S');
        expect(idCase).to.equal(20566);
        expect(codTarea).to.equal('115');
        expect(idUsuarioBPM).to.equal(69);
        expect(indInformeFinal).to.equal('N');
        expect(indReqNuevoAjustador).to.equal('N');
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');

    // // click seccion pagos
    // cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // 
    // // verifica que el pago en estado PENDIENTE con CODPROCESO
    // // no tenga los botones de accion
    // cy.get(
    //   '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-delete'
    // ).should('not.be.visible');
    // cy.get(
    //   '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-edit'
    // ).should('not.be.visible');
    // cy.get(
    //   '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    // ).should('not.be.visible');


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

    // // cy.get('[data-cy=boton_aprobar_revisar_informe]').click();
    // // cy.get('.ant-modal-content .ant-modal-confirm-content').should(
    // //   'have.text',
    // //   'No debe tener pagos de indemnización en estado pendiente'
    // // );
    // // cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
    // // cy.get('.ant-modal-content').should('not.exist');

    // // // click seccion pagos
    // // cy.get('.ant-collapse-item:nth-of-type(9)').click();

    // // // envia pago
    // // cy.get(
    // //   '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    // // ).click();

    // // cy.wait('@procesarpago');

    // // cy.get('[data-cy=boton_aprobar_revisar_informe]').should(
    // //   'be.enabled'
    // // );
    // // cy.get('[data-cy=boton_aprobar_revisar_informe]').click();
    // // cy.get('.ant-modal-content .ant-modal-confirm-title').should(
    // //   'have.text',
    // //   '¿Desea continuar con la atención del siniestro?'
    // // );
    // // cy.get(
    // //   '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    // // ).click();
    // // cy.wait('@completaranalizarsiniestro');
  });

  it('devuelve tarea', () => {
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
          idCase,
          codTarea,
          informe: {
            ajustador: { idUsuarioBPM } = {},
            indReqNuevoAjustador,
            indInformeFinal
          } = {}
        } = xhr.request.body;
        expect(indAprobacionInforme).to.equal('N');
        expect(indTercerAfectado).to.equal('N');
        expect(indRecupero).to.equal('N');
        expect(indSalvamento).to.equal('N');
        expect(indRegCoaseguro).to.equal('N');
        expect(indRegReaseguro).to.equal('S');
        expect(idCase).to.equal(20566);
        expect(codTarea).to.equal('115');
        expect(idUsuarioBPM).to.equal(69);
        expect(indInformeFinal).to.equal('N');
        expect(indReqNuevoAjustador).to.equal('N');
      },
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');

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
