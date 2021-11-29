const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones generar informe basico', () => {
  beforeEach(() => {
    cy.server();
    cy.login('klrojas@synopsis.ws', 'Synops1s!');

    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioAjustador();
    // servicios necesarios para la tarea

    // redefine fixtures necesarios para tarea generar informe basico
    cy.fixture('tareas/generar_informe_basico/obtbandeja.json').as('tareaJSON');
    cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

    cy.fixture('tareas/generar_informe_basico/obtdetallesiniestro.json').as(
      'detalleSiniestroJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallesiniestro`,
      '@detalleSiniestroJSON'
    ).as('obtdetallesiniestro');

    cy.fixture('tareas/generar_informe_basico/lstramoscoberturas.json').as(
      'ramosCoberturasJSON'
    );
    cy.route('POST', `${apiUrl}/lstramoscoberturas`, '@ramosCoberturasJSON').as(
      'lstramoscoberturas'
    );

    cy.fixture('tareas/generar_informe_basico/lstpagos.json').as(
      'listaPagosJSON'
    );
    cy.route('POST', `${apiUrl}/obtpagos`, '@listaPagosJSON').as('obtpagos');

    cy.fixture('tareas/generar_informe_basico/obtcoordenadabancaria.json').as(
      'coordenadaBancariaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtcoordenadabancaria`,
      '@coordenadaBancariaJSON'
    ).as('obtcoordenadabancaria');

    cy.fixture('tareas/generar_informe_basico/obtdatosinforme.json').as(
      'datosInformeJSON'
    );
    cy.route('POST', `${apiUrl}/obtdatosinforme`, '@datosInformeJSON').as(
      'obtdatosinforme'
    );

    cy.fixture(
      'tareas/generar_informe_basico/obtramoscoberturasajustadores.json'
    ).as('ramosCoberturasAjustadoresJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtramoscoberturasajustadores`,
      '@ramosCoberturasAjustadoresJSON'
    ).as('obtramoscoberturasajustadores');

    cy.fixture('tareas/generar_informe_basico/obtdetallepolizaclaims.json').as(
      'detallePolizaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallepolizaclaims`,
      '@detallePolizaJSON'
    ).as('obtdetallepolizaclaims');

    cy.fixture('tareas/generar_informe_basico/obtdetallecertificado.json').as(
      'detalleCertificadoJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtdetallecertificado`,
      '@detalleCertificadoJSON'
    ).as('obtdetallecertificado');

    cy.fixture('tareas/generar_informe_basico/obtdocssolicitados.json').as(
      'docsSolicitadosJSON'
    );
    cy.route('POST', `${apiUrl}/obtdocssolicitados`, '@docsSolicitadosJSON').as(
      'obtdocssolicitados'
    );

    cy.fixture('tareas/generar_informe_basico/lstajustadores.json').as(
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

  it('valida pagos para ajustador: indemnizacion', () => {
    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();

    // agrega un pago de indemnizacion
    cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.enabled');
    cy.get('[data-cy=boton_agregar_indemnizaciones]').click();

    cy.get('#indemnizacion_modal_tipoPago').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('PAGO PARCIAL')
      .click();

    cy.get('#indemnizacion_modal_indemnizacionBruta').type('100');
    cy.get('#indemnizacion_modal_deducible').type('0');

    cy.get('#indemnizacion_modal_tipoCobro').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('VIA PLANILLA')
      .click();

    cy.get('[data-cy=boton_grabar_indemnizacion]').click();
    // cy.get('.ant-modal-close').click();

    // verifica que no pueda enviar pagos
    cy.wait('@mantenerpagos');
    cy.get(
      '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).should('not.exist');
  });

  it('valida pagos para ajustador: honorarios', () => {
    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // click tab honorarios
    cy.get('.ant-tabs-tab:nth-of-type(2)').click();

    cy.get('[data-cy=boton_agregar_honorarios]').should('be.enabled');
    cy.get('[data-cy=boton_agregar_honorarios]').click();

    // valida que no exista el tooltip del honorario calculado
    cy.get('svg[data-icon="exclamation-circle"]').should('not.exist');

    // selecciona tipo documento
    cy.get('#honorarios_modal_codTipoDocumento').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('FACTURA')
      .click();

    // ingresa serie
    cy.get('#honorarios_modal_codSerie').type('123');
    // ingresa numero de documento
    cy.get('#honorarios_modal_numComprobante').type('123');

    // se deja seleccionada la moneda del certificado y fecha de emision

    // ingresa gastos
    cy.get('#honorarios_modal_mtoGastos').type('100');
    // ingresa honorarios
    cy.get('#honorarios_modal_mtoHonorarios').type('100');
    // ingresa importe
    // cy.get('#honorarios_modal_mtoImporte').type('100');

    // selecciona tipo cobro
    cy.get('#honorarios_modal_codTipoCobro').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('VIA PLANILLA')
      .click();

    cy.get('[data-cy=boton_grabar_honorarios]').click();
    // cy.get('.ant-modal-close').click();

    // verifica que no pueda enviar pagos
    cy.wait('@mantenerpagos');
    cy.get(
      '#tabla_pagos_honorarios .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).should('not.exist');
  });

  it('valida pagos para ajustador: otrosConceptos', () => {
    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // click tab otros conceptos
    cy.get('.ant-tabs-tab:nth-of-type(3)').click();

    cy.get('[data-cy=boton_agregar_otros_conceptos]').should('be.enabled');
    cy.get('[data-cy=boton_agregar_otros_conceptos]').click();

    cy.seleccionarTercero();

    cy.get('#OtrosConceptosModal_modal_codConcepto').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('RESERVAS TECNICAS')
      .click();

    cy.get('#OtrosConceptosModal_modal_codTipoDocumento').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('FACTURA')
      .click();

    cy.get('#OtrosConceptosModal_modal_numSerie').type('123');
    cy.get('#OtrosConceptosModal_modal_numDocumento').type('123');

    cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');
    // realiza un pago por 10000 en la moneda USD
    cy.get('#OtrosConceptosModal_modal_mtoImporte').type('10000');

    // selecciona tipo cobro
    cy.get('#OtrosConceptosModal_modal_codTipoCobro').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('VIA PLANILLA')
      .click();

    // click boton grabar
    cy.get('#modal_otros_conceptos_grabar').click();

    // verifica que no pueda enviar pagos
    cy.wait('@mantenerpagos');
    cy.get(
      '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).should('not.exist');
  });

  it('valida pagos para ajustador: reposicion', () => {
    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // click tab reposicion
    cy.get('.ant-tabs-tab:nth-of-type(4)').click();

    cy.get('[data-cy=boton_agregar_reposicion]').should('be.enabled');
    cy.get('[data-cy=boton_agregar_reposicion]').click();

    cy.seleccionarTercero();

    cy.get('#reposiciones_modal_codTipoDocumento').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('FACTURA')
      .click();

    cy.get('#reposiciones_modal_numSerie').type('123');
    cy.get('#reposiciones_modal_numDocumento').type('123');

    cy.get('[data-cy=saldo_pendiente]').should('contain', '5,000.00');
    // realiza un pago por 1000 en la moneda USD
    cy.get('#reposiciones_modal_mtoImporte').type('1000');

    // selecciona tipo cobro
    cy.get('#reposiciones_modal_codTipoCobro').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('VIA PLANILLA')
      .click();

    // click boton grabar
    cy.get('#modal_reposiciones_grabar').click();

    // verifica que no pueda enviar pagos
    cy.wait('@mantenerpagos');
    cy.get(
      '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).should('not.exist');
  });

  // it('valida pagos para ajustador: acreencias', () => {
  //   // click seccion pagos
  //   cy.get('.ant-collapse-item:nth-of-type(9)').click();
  //   // click tab acreencias
  //   cy.get('.ant-tabs-tab:nth-of-type(5)').click();

  //   cy.get('[data-cy=boton_agregar_acreencias]').should('be.enabled');
  //   cy.get('[data-cy=boton_agregar_acreencias]').click();

  //   cy.get('#acreencias_modal_dscMotivos').type('motivo de prueba');

  //   // realiza un pago por 1000 en la moneda USD
  //   cy.get('#acreencias_modal_mtoSinIgv').type('1000');

  //   // click boton grabar
  //   cy.get('#modal_acreencias_grabar').click();

  //   // verifica que no pueda enviar pagos
  //   cy.wait('@mantenerpagos');
  //   cy.get(
  //     '#tabla_pagos_acreencias .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
  //   ).should('not.exist');
  // });

  it('valida pagos para ajustador: coordenadas', () => {
    cy.fixture('general/listas/obtenerlista-crg_tctab.json').as(
      'listaTiposCuentaJSON'
    );

    cy.fixture('general/lstentidadfinanciera.json').as(
      'lstentidadfinancieraJSON'
    );

    cy.fixture('pagos/mantenercoordenadabancaria.json').as(
      'mantenerCoordenadaJSON'
    );

    cy.route(
      'POST',
      `${apiUrl}/obtenerlista-crg_tctab`,
      '@listaTiposCuentaJSON'
    ).as('getTiposCuenta');
    cy.route(
      'POST',
      `${apiUrl}/lstentidadfinanciera`,
      '@lstentidadfinancieraJSON'
    ).as('getLstentidadfinanciera');

    cy.route({
      method: 'POST',
      url: `${apiUrl}/mantenercoordenadabancaria`,
      onRequest(xhr) {
        const {
          data: { usuarioModificacion }
        } = xhr.request.body;
        expect(usuarioModificacion).to.equal('faalfaro@synopsis.ws');
      },
      response: '@mantenerCoordenadaJSON'
    }).as('mantenercoordenadabancaria');

    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();
    // click tab coordenadas
    cy.get('.ant-tabs-tab:nth-of-type(5)').click();

    cy.get('[data-cy=boton_agregar_coordenadas]').should('be.enabled');
    cy.get('[data-cy=boton_agregar_coordenadas]').click();

    cy.wait(['@getTiposCuenta', '@getLstentidadfinanciera']);

    // selecciona entidad financiera
    cy.get('#coordenadas_modal_codEntidadFinanciera').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('BANCO CONTINENTAL')
      .click();

    // selecciona tipo cuenta
    cy.get('#coordenadas_modal_codTipoCuenta').click();
    cy.get('.ant-select-dropdown-menu-item-active')
      .contains('CUENTA DE AHORROS')
      .click();

    // realiza un pago por 1000 en la moneda USD
    cy.get('#coordenadas_modal_nroCuenta').type('123456546874654588');

    // click boton grabar
    cy.get('#modal_coordenadas_grabar').click();

    // verifica que no pueda enviar pagos
    cy.wait('@mantenercoordenadabancaria');
    cy.get(
      '#tabla_pagos_coordenadas .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
    ).should('not.exist');
  });

  it.only('valida completar tarea', () => {
    // stub lista de tidos de documento informe
    cy.fixture('general/lstsubtipodocumentos_informe.json').as(
      'subtiposInformeJSON'
    );
    cy.route('POST', `${apiUrl}/lstsubtipodocumentos`, '@subtiposInformeJSON');

    // stub completar tarea
    cy.fixture('tareas/completaranalizarsiniestro.json').as(
      'completaranalizarsiniestroJSON'
    );
    cy.route({
      method: 'POST',
      url: `${apiUrl}/completaranalizarsiniestro`,
      response: '@completaranalizarsiniestroJSON'
    }).as('completaranalizarsiniestro');
  
    // click seccion pagos
    cy.get('.ant-collapse-item:nth-of-type(9)').click();

    cy.get('.ant-tabs-tab').should('not.contain', 'Acreencia');

    cy.get('[data-cy=boton_completar_generar_informe]').should(
      'be.enabled'
    );
    cy.get('[data-cy=boton_completar_generar_informe]').click();

    cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      'have.text',
      'Debe cargar el documento: informe básico español'
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
      .contains('INFORME BASICO')
      .click();

    // ingresa descripcion
    cy.get('#generarInfomeBasico_descripcion').type('HOLA');

    // carga archivo informe basico
    cy.fixture('cy.png', 'base64').then(fileContent => {
      cy.get('#cargar-archivo').upload(
        { fileContent, fileName: 'cy.png', mimeType: 'image/png' },
        { subjectType: 'input' }
      ).then(() => {
        cy.get('[data-cy=boton_completar_generar_informe]').click();
        cy.get(
          '.ant-modal-content .ant-modal-confirm-btns button.ant-btn-primary'
        ).click();
        cy.wait('@completaranalizarsiniestro');
      });
    });

  });
});
