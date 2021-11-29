const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones generar informe', () => {
  beforeEach(() => {
    cy.server();
    cy.login('klrojas@synopsis.ws', 'Synops1s!');

    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioAjustador();
    // servicios necesarios para la tarea
    cy.fixture('tareas/generar_informe/obtbandeja.json').as('tareaJSON');
    cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

    cy.fixture('tareas/generar_informe/obtdetallesiniestro.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    cy.fixture('tareas/generar_informe/lstramoscoberturas.json').as(
      'ramosCoberturasJSON'
    );
    cy.route('POST', `${apiUrl}/lstramoscoberturas`, '@ramosCoberturasJSON').as(
      'lstramoscoberturas'
    );

    cy.fixture('tareas/generar_informe/lstpagos.json').as('listaPagosJSON');
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    cy.fixture('tareas/generar_informe/obtcoordenadabancaria.json').as(
      'coordenadaBancariaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtcoordenadabancaria`,
      '@coordenadaBancariaJSON'
    ).as('obtcoordenadabancaria');

    cy.fixture('tareas/generar_informe/obtdatosinforme.json').as(
      'datosInformeJSON'
    );
    cy.route('POST', `${apiUrl}/obtdatosinforme`, '@datosInformeJSON').as(
      'obtdatosinforme'
    );

    cy.fixture('tareas/generar_informe/obtramoscoberturasajustadores.json').as(
      'ramosCoberturasAjustadoresJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    cy.fixture('tareas/generar_informe/obtdetallepolizaclaims.json').as(
      'detallePolizaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallepolizaclaims`,
      '@detallePolizaJSON'
    ).as('obtdetallepolizaclaims');

    cy.fixture('tareas/generar_informe/obtdetallecertificado.json').as(
      'detalleCertificadoJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallecertificado`,
      '@detalleCertificadoJSON'
    ).as('obtdetallecertificado');

    cy.fixture('tareas/generar_informe/obtdocssolicitados.json').as(
      'docsSolicitadosJSON'
    );
    cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitadosJSON').as(
      'obtdocssolicitados'
    );

    cy.fixture('tareas/generar_informe/lstajustadores.json').as(
      'ajustadoresRamoJSON'
    );
    cy.route('POST', `${apiUrl}/lstajustadores`, '@ajustadoresRamoJSON').as(
      'lstajustadores'
    );

    cy.fixture('tareas/generar_informe/obtbitacoratareas.json').as('obtbitacoratareasJSON');
    cy.route('POST', `${apiUrl}/obtbitacoratareas`, '@obtbitacoratareasJSON').as('obtbitacoratareas');

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
      '@obtenerlista-crg_mot_cierre',
      '@obtbitacoratareas'
    ]);
    cy.fixture('tareas/generar_informe/mantener_pago.json').as(
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

  it('completa tarea', () => {
    cy.fixture('tareas/completaranalizarsiniestro.json').as(
      'completartareaJSON'
    );

    // stub procesarpago
    cy.route(
      'POST',
      `${apiUrl}/procesarpago`,
      '@completartareaJSON'
    ).as('procesarpago');


    cy.fixture('tareas/generar_informe/subirdocumentos.json').as('subirdocumentosJSON');
    cy.route('POST', `${apiUrl}/subirdocumentos`, '@subirdocumentosJSON').as('subirdocumentos');;

    
    // stub completar tarea timeout
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completartarea`,
      status: 504,
      response: '@completartareaJSON'
    }).as('completartareatimeout');

    // stub lista de tidos de documento informe
    cy.fixture('general/lstsubtipodocumentos_informe.json').as(
      'subtiposInformeJSON'
    );
    cy.route('POST', `${apiUrl}/lstsubtipodocumentos`, '@subtiposInformeJSON');

    // intenta completar tarea
    cy.get('[data-cy=boton_completar_generar_informe]').click();
    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'Debe cargar y enviar el documento:  Informe preliminar o complementario español.'
    );
    cy.get('.ant-modal-content .ant-modal-confirm-btns button').click();
    cy.get('.ant-modal-content').should('not.exist');

    // click seccion cargar documentos
    cy.get('.ant-collapse-item:nth-of-type(7)').click();
    // selecciona tipo documento
    cy.get('#generarInfomeBasico_tipoDocumento').click();
    cy.get('.ant-select-dropdown-menu-item')
      .contains('INFORMES')
      .click();
    // selecciona sub tipo documento
    cy.get('#generarInfomeBasico_subTipoDocumento').click();
    cy.get('.ant-select-dropdown-menu-item')
      .contains('INFORME PRELIMINAR O INFORME COMPLEMENTARIO')
      .click();

    // ingresa descripcion
    cy.get('#generarInfomeBasico_descripcion').type('HOLA');

    // carga archivo informe basico
    cy.fixture('cy.png', 'base64').then(fileContent => {
      cy.get('#cargar-archivo')
        .upload(
          { fileContent, fileName: 'cy.png', mimeType: 'image/png' },
          { subjectType: 'input' }
        )
        .then(() => {

          cy.fixture('tareas/generar_informe/obtdocssolicitados_ipc.json').as(
            'docsSolicitados_ipcJSON'
          );
          cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitados_ipcJSON').as(
            'obtdocssolicitados_ipc'
          );

          // envia documento
          cy.get(
            '#tabla_carga_documentos tbody>tr:nth-child(1)>td:last-child i.anticon-right'
          ).click();
          cy.wait('@subirdocumentos');
          cy.wait('@obtdocssolicitados_ipc');

          
          cy.get('[data-cy=boton_completar_generar_informe]').click();
          cy.get(
            '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
          ).click();
          cy.wait('@completartareatimeout');

          // stub completar tarea ok
          // cy.fixture('tareas/completaranalizarsiniestro.json').as(
          //   'completaranalizarsiniestroJSON'
          // );
          // cy.route({
          //   method: 'POST',
          //   url: `${apiUrl}/completaranalizarsiniestro`,
          //   onRequest(xhr) {
          //     const {
          //       idCase,
          //       codTarea,
          //       informe: { indInformeFinal } = {}
          //     } = xhr.request.body;
          //     expect(idCase).to.equal(20566);
          //     expect(codTarea).to.equal('142');
          //     expect(indInformeFinal).to.equal('N');
          //   },
          //   response: '@completaranalizarsiniestroJSON'
          // }).as('completaranalizarsiniestro');

          // // intenta nuevamente
          // cy.get('[data-cy=boton_completar_generar_informe]').click();
          // cy.get(
          //   '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
          // ).click();
          // cy.wait('@completaranalizarsiniestro');
        });
    });

    // // click seccion pagos
    // cy.get('.ant-collapse-item:nth-of-type(9)').click();

    // // envia pago
    // cy.get(
    //   '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    // ).click();

    // cy.wait('@procesarpago');

    // cy.get('[data-cy=boton_aprobar_generar_informe]').should(
    //   'be.enabled'
    // );
    // cy.get('[data-cy=boton_aprobar_generar_informe]').click();
    // cy.get('.ant-modal-content .ant-modal-confirm-title').should(
    //   'have.text',
    //   '¿Desea continuar con la atención del siniestro?'
    // );
    // cy.get(
    //   '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
    // ).click();
    // cy.wait('@completaranalizarsiniestro');
  });
});
