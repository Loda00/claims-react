const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones de Analizar Siniestro', () => {
  beforeEach(() => {
    cy.server();
    cy.login('mlpaucara@synopsis.ws', 'Rim@cCl4ims');
    cy.fixtureCargaInicialTareas();
    cy.fixtureCargaInicialAnalizarSiniestro();
  });

  describe('Moneda certificado es USD', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8000');

      cy.wait('@getUsuario');

      cy.get('a[href="/tareas"]').click({ force: true });
      cy.contains('h1', 'Bandeja de Tareas');

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
    });

    it.skip('pago honorarios', () => {
      cy.get('.ant-collapse-item:nth-of-type(5)').click();
      cy.get(
        '#analyzeSinister_ajustadorRequerido .ant-radio-checked>input'
      ).should('have.value', 'S');

      // click seccion pagos
      cy.get('.ant-collapse-item:nth-of-type(9)').click();

      // click tab honorarios
      cy.get('.ant-tabs-tab:nth-of-type(2)').click();

      cy.get('[data-cy=boton_agregar_honorarios]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_honorarios]').click();

      cy.get('svg[data-icon="exclamation-circle"]').should('be.visible');
      cy.get('.ant-modal-close').click();

      cy.get('#analyzeSinister_ajustadorRequerido [type=radio]').check('N');
      cy.get('[data-cy=boton_agregar_honorarios]').should('be.disabled');
    });

    it.skip('realiza pago en USD: otrosConceptos', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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

      cy.get('#OtrosConceptosModal_modal_numSerie').type('123');

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');
      // realiza un pago por 10000 en la moneda USD
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('10000');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '11,800.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '48,200.00');

      // edita el pago conservando la misma moneda ( USD ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // cambia monto de 10 000 a 20 000
      cy.get('#OtrosConceptosModal_modal_mtoImporte').clear();
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('20000');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '23,600.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '36,400.00');

      // elimina pago
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });

    it.skip('realiza pago en SOL: otrosConceptos', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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
      // cy.pause();
      // selecciona SOL
      cy.get('#OtrosConceptosModal_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('SOL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // realiza un pago por 10000 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('10000.56');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '3,575.96');
      // assert saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '56,424.04');

      // cy.pause();
      // edita el pago conservando la misma moneda ( SOL ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // cambia monto de 10 000.56 a 20 000.56
      cy.get('#OtrosConceptosModal_modal_mtoImporte').clear();
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('20000.56');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '7,151.72');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '52,848.28');

      // elimina pago
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });

    it.skip('realiza pago en SOL tipo cambio 3.31: otrosConceptos', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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
      // cy.pause();
      // selecciona SOL
      cy.get('#OtrosConceptosModal_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('SOL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,600.00');

      // realiza un pago por 10000 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('10000.56');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '3,021.32');
      // assert saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '56,978.68');

      // edita el pago conservando la misma moneda ( SOL ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,600.00');

      // cambia monto de 10 000.56 a 20 000.56
      cy.get('#OtrosConceptosModal_modal_mtoImporte').clear();
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('20000.56');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '6,042.47');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '53,957.53');

      // elimina pago
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });

    it.skip('realiza pago en SOL tipo cambio 3.356: otrosConceptos', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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
      // cy.pause();
      // selecciona SOL
      cy.get('#OtrosConceptosModal_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('SOL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '201,360.00');

      // realiza un pago por 10000 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('10000.56');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '2,979.90');
      // assert saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '57,020.1');

      // edita el pago conservando la misma moneda ( SOL ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '201,360.00');

      // cambia monto de 10 000.56 a 20 000.56
      cy.get('#OtrosConceptosModal_modal_mtoImporte').clear();
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('20000.56');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '5,959.64');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '54,040.36');

      // elimina pago
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });

    it.skip('realiza pago en USD: indemnizacion', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();

      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_indemnizaciones]').click();

      cy.get('#indemnizacion_modal_tipoPago').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('PAGO PARCIAL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // realiza un pago por 10000 en la moneda USD
      cy.get('#indemnizacion_modal_indemnizacionBruta').type('10000');
      cy.get('#indemnizacion_modal_deducible').type('0');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_indemnizacion]').click();

      // despliega DATOS DE COBERTURA
      cy.get('.ant-collapse-header')
        .contains('DATOS DE LA COBERTURA')
        .click();

      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should(
        'contain',
        '10,000.00'
      );
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '50,000.00'
      );

      // edita el pago conservando la misma moneda ( USD ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // cambia monto de 10 000 a 20 000
      cy.get('#indemnizacion_modal_indemnizacionBruta').clear();
      cy.get('#indemnizacion_modal_indemnizacionBruta').type('20000');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_indemnizacion]').click();

      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should(
        'contain',
        '20,000.00'
      );
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '40,000.00'
      );

      // elimina pago
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '0.00');
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '60,000.00'
      );
    });

    it.skip('realiza pago en SOL: indemnizacion', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();

      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_indemnizaciones]').click();

      cy.get('#indemnizacion_modal_tipoPago').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('PAGO PARCIAL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // selecciona SOL
      cy.get('#indemnizacion_modal_monedaPago').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('SOL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // realiza un pago por 10 000 en la moneda SOL
      cy.get('#indemnizacion_modal_indemnizacionBruta').type('10000');
      cy.get('#indemnizacion_modal_deducible').type('0');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_indemnizacion]').click();

      // despliega DATOS DE COBERTURA
      cy.get('.ant-collapse-header')
        .contains('DATOS DE LA COBERTURA')
        .click();

      // assert total pagos
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '3,030.30');
      // assert saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '56,969.70'
      );

      // edita el pago conservando la misma moneda ( SOL ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // cambia monto de 10 000 a 20 000
      cy.get('#indemnizacion_modal_indemnizacionBruta').clear();
      cy.get('#indemnizacion_modal_indemnizacionBruta').type('20000');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_indemnizacion]').click();

      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '6,060.61');
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '53,939.39'
      );

      // elimina pago
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '0.00');
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '60,000.00'
      );
    });

    it('realiza pago en USD: honorarios', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
      // click tab honorarios
      cy.get('.ant-tabs-tab:nth-of-type(2)').click();

      cy.get('[data-cy=boton_agregar_honorarios]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_honorarios]').click();

      // selecciona tipo documento
      cy.get('#honorarios_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // ingresa serie
      cy.get('#honorarios_modal_codSerie').type('123');
      // ingresa numero de documento
      cy.get('#honorarios_modal_numComprobante').type('123');

      // realiza un pago por 10000 en la moneda USD
      // ingresa gastos
      cy.get('#honorarios_modal_mtoGastos').type('0');
      // ingresa honorarios
      cy.get('#honorarios_modal_mtoHonorarios').type('10000');

      // // click boton grabar
      cy.get('[data-cy=boton_grabar_honorarios]').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(5)'
      ).should('contain', '11,800.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(6)'
      ).should('contain', '48,200.00');

      // // edita el pago conservando la misma moneda ( USD ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_honorarios .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // cambia monto de 10 000 a 20 000
      // ingresa honorarios
      cy.get('#honorarios_modal_mtoHonorarios').clear();
      cy.get('#honorarios_modal_mtoHonorarios').type('20000');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_honorarios]').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(5)'
      ).should('contain', '23,600.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(6)'
      ).should('contain', '36,400.00');

      // elimina pago
      cy.get(
        '#tabla_pagos_honorarios .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });

    it('realiza pago en SOL: honorarios', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
      cy.get('.ant-tabs-tab:nth-of-type(2)').click();

      cy.get('[data-cy=boton_agregar_honorarios]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_honorarios]').click();

      // selecciona tipo documento
      cy.get('#honorarios_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // ingresa serie
      cy.get('#honorarios_modal_codSerie').type('123');
      // ingresa numero de documento
      cy.get('#honorarios_modal_numComprobante').type('123');

      // selecciona SOL
      cy.get('#honorarios_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('SOL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // realiza un pago por 10000 en la moneda SOL
      cy.get('#honorarios_modal_mtoGastos').type('0');
      cy.get('#honorarios_modal_mtoHonorarios').type('10000');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_honorarios]').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(5)'
      ).should('contain', '3,575.76');
      // assert saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(6)'
      ).should('contain', '56,424.24');

      // edita el pago conservando la misma moneda ( SOL ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_honorarios .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // cambia monto de 10 000.00 a 20 000.00
      cy.get('#honorarios_modal_mtoHonorarios').clear();
      cy.get('#honorarios_modal_mtoHonorarios').type('20000.00');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_honorarios]').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(5)'
      ).should('contain', '7,151.52');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(6)'
      ).should('contain', '52,848.48');

      // elimina pago
      cy.get(
        '#tabla_pagos_honorarios .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(1) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });

    it('realiza pago en USD: reposicion', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
      // click tab reposicion
      cy.get('.ant-tabs-tab:nth-of-type(4)').click();

      cy.get('[data-cy=boton_agregar_reposicion]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_reposicion]').click();

      cy.seleccionarTercero();
      // selecciona tipo documento
      cy.get('#reposiciones_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      cy.get('#reposiciones_modal_numSerie').type('123');
      cy.get('#reposiciones_modal_numDocumento').type('123');

      // realiza un pago por 10 000 en la moneda USD
      cy.get('#reposiciones_modal_mtoImporte').type('10000');

      // // click boton grabar
      cy.get('#modal_reposiciones_grabar').click();

      // despliega DATOS DE COBERTURA
      cy.get('.ant-collapse-header')
        .contains('DATOS DE LA COBERTURA')
        .click();

      // // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should(
        'contain',
        '11,800.00'
      );
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '48,200.00'
      );

      // // edita el pago conservando la misma moneda ( USD ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // cambia monto de 10 000 a 20 000
      cy.get('#reposiciones_modal_mtoImporte').clear();
      cy.get('#reposiciones_modal_mtoImporte').type('20000');

      // click boton grabar
      cy.get('#modal_reposiciones_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should(
        'contain',
        '23,600.00'
      );
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '36,400.00'
      );

      // elimina pago
      cy.get(
        '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '0.00');
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '60,000.00'
      );
    });

    it('realiza pago en SOL: reposicion', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
      cy.get('.ant-tabs-tab:nth-of-type(4)').click();

      cy.get('[data-cy=boton_agregar_reposicion]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_reposicion]').click();

      cy.seleccionarTercero();
      // selecciona tipo documento
      cy.get('#reposiciones_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      cy.get('#reposiciones_modal_numSerie').type('123');
      cy.get('#reposiciones_modal_numDocumento').type('123');

      // selecciona SOL
      cy.get('#reposiciones_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('SOL')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // realiza un pago por 10000 en la moneda SOL
      cy.get('#reposiciones_modal_mtoImporte').type('10000');

      // click boton grabar
      cy.get('#modal_reposiciones_grabar').click();

      // despliega DATOS DE COBERTURA
      cy.get('.ant-collapse-header')
        .contains('DATOS DE LA COBERTURA')
        .click();

      // assert total pagos
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '3,575.76');
      // assert saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '56,424.24'
      );

      // edita el pago conservando la misma moneda ( SOL ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '198,000.00');

      // cambia monto de 10 000.00 a 20 000.00
      cy.get('#reposiciones_modal_mtoImporte').clear();
      cy.get('#reposiciones_modal_mtoImporte').type('20000.00');

      // click boton grabar
      cy.get('#modal_reposiciones_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '7,151.52');
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '52,848.48'
      );

      // elimina pago
      cy.get(
        '#tabla_pagos_reposiciones .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should('contain', '0.00');
      cy.get('#tabla_coberturas td:nth-child(7)').should(
        'contain',
        '60,000.00'
      );
    });

    it('pago reposicion debe validar saldo 0', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
      // click tab reposicion
      cy.get('.ant-tabs-tab:nth-of-type(4)').click();

      cy.get('[data-cy=boton_agregar_reposicion]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_reposicion]').click();

      cy.seleccionarTercero();
      // selecciona tipo documento
      cy.get('#reposiciones_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      cy.get('#reposiciones_modal_numSerie').type('123');
      cy.get('#reposiciones_modal_numDocumento').type('123');

      // realiza un pago por 10 000 en la moneda USD
      cy.get('#reposiciones_modal_mtoImporte').type('50847.46');

      // // click boton grabar
      cy.get('#modal_reposiciones_grabar').click();

      // despliega DATOS DE COBERTURA
      cy.get('.ant-collapse-header')
        .contains('DATOS DE LA COBERTURA')
        .click();

      // // assert total pagos y saldo pendiente
      cy.get('#tabla_coberturas td:nth-child(8)').should(
        'contain',
        '60,000.00'
      );
      cy.get('#tabla_coberturas td:nth-child(7)').should('contain', '0.00');

      // adiciona nuevo pago con monto 10 000
      cy.get('[data-cy=boton_agregar_reposicion]').click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '0.00');

      cy.seleccionarTercero();
      // selecciona tipo documento
      cy.get('#reposiciones_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('#reposiciones_modal_numSerie').type('123');
      cy.get('#reposiciones_modal_numDocumento').type('123');

      // realiza un pago por 10 000 en la moneda USD
      cy.get('#reposiciones_modal_mtoImporte').type('50847.46');

      // click boton grabar
      cy.get('#modal_reposiciones_grabar').should('be.disabled');
    });

    it('pago acreencia registra y envia', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();
      // click tab reposicion
      cy.get('.ant-tabs-tab:nth-of-type(5)').click();

      cy.get('[data-cy=boton_agregar_acreencias]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_acreencias]').click();

      cy.get('#acreencias_modal_dscMotivos').type('motivo de prueba');

      // realiza un pago por 1000 en la moneda USD
      cy.get('#acreencias_modal_mtoSinIgv').type('1000');

      // click boton grabar
      cy.get('#modal_acreencias_grabar').click();

      // stub procesarpago
      cy.fixture('tareas/completaranalizarsiniestro.json').as(
        'completaranalizarsiniestroJSON'
      );
      cy.route({
        method: 'POST',
        url: `${apiUrl}/procesarpago`,
        onRequest(xhr) {
          const {
            numSiniestro,
            paymentType,
            id,
            ideCase,
            ideCasePadre,
            usuario,
            codRamo,
            codProd,
            ideSin,
            mtoDed,
            ideCobert,
            numIdUsr,
            indCreoAjustador,
            indModificoAjustador,
            auditoria: { usuario: usuarioAuditoria } = {}
          } = xhr.request.body;
          expect(numSiniestro).to.equal('RG19003625');
          expect(paymentType).to.equal('A');
          expect(id).to.equal(60);
          expect(ideCase).to.equal(undefined);
          expect(ideCasePadre).to.equal(undefined);
          expect(usuario).to.equal('106225');
          expect(codRamo).to.equal('TRAN');
          expect(codProd).to.equal('3001');
          expect(ideSin).to.equal(302403);
          expect(mtoDed).to.equal('1000');
          expect(ideCobert).to.equal(1085116);
          expect(numIdUsr).to.equal(56782);
          expect(indCreoAjustador).to.equal('N');
          expect(indModificoAjustador).to.equal('N');
          expect(usuarioAuditoria).to.equal('mlpaucara@synopsis.ws');
        },
        response: '@completaranalizarsiniestroJSON'
      }).as('completaranalizarsiniestro');

      cy.get(
        '#tabla_pagos_acreencias .ant-table-fixed-right tbody>tr>td:last-child>span i.anticon-right'
      ).click();
    });

    it('realiza pago indemnizacion valida formato deducible', () => {
      cy.get('.ant-collapse-item:nth-of-type(9)').click();

      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_indemnizaciones]').click();

      cy.get('#indemnizacion_modal_tipoPago').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('PAGO PARCIAL')
        .click();

      // realiza un pago por 10000 en la moneda USD
      cy.get('#indemnizacion_modal_indemnizacionBruta').type('10000');
      cy.get('#indemnizacion_modal_deducible').type('.');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_indemnizacion]').should('be.disabled');
    });

    it('liquida con un solo pago de indemnizacion', () => {
      // no requiere ajustador
      cy.get('.ant-collapse-item:nth-of-type(5)').click();

      cy.get('#analyzeSinister_ajustadorRequerido [type=radio]').check('N');

      // agrego pago de indemnizacion
      cy.get('.ant-collapse-item:nth-of-type(9)').click();

      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.enabled');
      cy.get('[data-cy=boton_agregar_indemnizaciones]').click();

      cy.get('#indemnizacion_modal_tipoPago').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('PAGO PARCIAL')
        .click();

      // realiza un pago por 10000 en la moneda USD
      cy.get('#indemnizacion_modal_indemnizacionBruta').type('10000');
      cy.get('#indemnizacion_modal_deducible').type('0');

      // click boton grabar
      cy.get('[data-cy=boton_grabar_indemnizacion]').click();

      // click tab reposicion
      cy.get('.ant-tabs-tab:nth-of-type(4)').click();
      cy.get('[data-cy=boton_agregar_reposicion]').should('be.disabled');

      cy.get('.ant-tabs-tab:nth-of-type(1)').click();
      // elimina pago
      cy.get(
        '#tabla_pagos_indemnizacion .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();

      cy.get('.ant-tabs-tab:nth-of-type(4)').click();
      cy.get('[data-cy=boton_agregar_reposicion]').click();
      cy.seleccionarTercero();

      cy.get('#reposiciones_modal_codTipoDocumento').click();
      cy.get('.ant-select-dropdown-menu-item-active')
        .contains('FACTURA')
        .click();

      cy.get('#reposiciones_modal_numSerie').type('123');
      cy.get('#reposiciones_modal_numDocumento').type('123');

      // realiza un pago por 100 en la moneda USD
      cy.get('#reposiciones_modal_mtoImporte').type('100');

      cy.get('#modal_reposiciones_grabar').click();
      cy.get('.ant-tabs-tab:nth-of-type(1)').click();
      cy.get('[data-cy=boton_agregar_indemnizaciones]').should('be.disabled');
    });
  });

  describe('Moneda certificado es SOL', () => {
    beforeEach(() => {
      // redefine detalle certificado para tener moneda SOL
      cy.fixture(
        'tareas/analizar_siniestro/detalle_certificado_moneda_sol.json'
      ).as('detalleCertificadoJSON');
      cy.route(
        'POST',
        `${apiUrl}/obtdetallecertificado`,
        '@detalleCertificadoJSON'
      ).as('obtdetallecertificado');
    });

    it('realiza pago en SOL', () => {
      cy.visit('http://localhost:8000');

      cy.wait('@getUsuario');

      cy.get('a[href="/tareas"]').click({ force: true });
      cy.contains('h1', 'Bandeja de Tareas');

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

      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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
      // realiza un pago por 10000 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('10000');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '11,800.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '48,200.00');

      // cy.pause();
      // edita el pago conservando la misma moneda ( SOL ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '60,000.00');

      // cambia monto de 10 000 a 20 000
      cy.get('#OtrosConceptosModal_modal_mtoImporte').clear();
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('20000');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '23,600.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '36,400.00');

      // elimina pago
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });

    it('realiza pago en SOL: issue #105', () => {
      cy.fixture(
        'tareas/analizar_siniestro/detalle_siniestro_monto105.json'
      ).as('detalleSiniestroJSON');
      cy.route(
        'POST',
        `${apiUrl}/obtdetallesiniestro`,
        '@detalleSiniestroJSON'
      ).as('obtdetallesiniestro');

      cy.visit('http://localhost:8000');

      cy.wait('@getUsuario');

      cy.get('a[href="/tareas"]').click({ force: true });
      cy.contains('h1', 'Bandeja de Tareas');

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

      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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
      cy.get('[data-cy=saldo_pendiente]').should('contain', '45,665,656.62');
      // realiza un pago por 45665656.12 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('38699708.58');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '45,665,656.12');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '0.50');

      // ingresa nuevo pago por toda la reserva
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

      cy.get('[data-cy=saldo_pendiente]').should('contain', '0.50');
      // realiza un pago por 0.50 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('0.42');
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '45,665,656.62');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '0.00');

      // edita el pago cambiando moneda a USD
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr:nth-child(2)>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '0.50');

      // selecciona USD
      cy.get('#OtrosConceptosModal_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('DOLARES AMERICANOS')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '0.15');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').should('be.disabled');
    });

    it.only('realiza pago en SOL: issue #105 2do caso', () => {
      cy.fixture(
        'tareas/analizar_siniestro/detalle_siniestro_monto105_2.json'
      ).as('detalleSiniestroJSON');
      cy.route(
        'POST',
        `${apiUrl}/obtdetallesiniestro`,
        '@detalleSiniestroJSON'
      ).as('obtdetallesiniestro');

      cy.visit('http://localhost:8000');

      cy.wait('@getUsuario');

      cy.get('a[href="/tareas"]').click({ force: true });
      cy.contains('h1', 'Bandeja de Tareas');

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

      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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
      cy.get('[data-cy=saldo_pendiente]').should('contain', '562,761.56');
      // realiza un pago por 45665656.12 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('476914.86');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '562,759.53');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '2.03');

      // ingresa nuevo pago por toda la reserva
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

      cy.get('[data-cy=saldo_pendiente]').should('contain', '2.03');
      // realiza un pago por 0.61 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('0.52');

      cy.fixture('pagos/mantener_pago_2.json').as('mantenerPagoJSON');
      cy.route('POST', `${apiUrl}/mantenerpagos`, '@mantenerPagoJSON');
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '562,760.14');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '1.42');

      // edita el pago cambiando moneda a USD
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr:nth-child(2)>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '2.03');

      // selecciona USD
      cy.get('#OtrosConceptosModal_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('DOLARES AMERICANOS')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '0.62');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '562,761.54');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '0.02');

      // ingresa nuevo pago por toda la reserva
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

      cy.get('[data-cy=saldo_pendiente]').should('contain', '0.02');

      // selecciona USD
      cy.get('#OtrosConceptosModal_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('DOLARES AMERICANOS')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '0.01');
      // realiza un pago por 0.61 en la moneda SOL
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('0.01');

      cy.fixture('pagos/mantener_pago_3.json').as('mantenerPagoJSON');
      cy.route('POST', `${apiUrl}/mantenerpagos`, '@mantenerPagoJSON');
      // cy.get('#modal_otros_conceptos_grabar').click();
      // cy.get('.ant-modal-content .ant-modal-confirm-content').should(
      //   'have.text',
      //   'El saldo pendiente será negativo, por favor elegir un monto menor o trabajar con la moneda del certificado.'
      // );

      // assert total pagos y saldo pendiente
      // cy.get(
      //   '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      // ).should('contain', '562,761.58');
      // cy.get(
      //   '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      // ).should('contain', '-0.02');
    });

    it('realiza pago en USD', () => {
      cy.visit('http://localhost:8000');

      cy.wait('@getUsuario');

      cy.get('a[href="/tareas"]').click({ force: true });
      cy.contains('h1', 'Bandeja de Tareas');

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

      cy.get('.ant-collapse-item:nth-of-type(9)').click();
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
      // selecciona USD
      cy.get('#OtrosConceptosModal_modal_codMoneda').click();
      cy.get('.ant-select-dropdown-menu-item')
        .contains('DOLARES AMERICANOS')
        .click();

      cy.get('[data-cy=saldo_pendiente]').should('contain', '18,181.82');

      // realiza un pago por 10000 en la moneda USD
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('10000');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // despliega DATOS DEL SINIESTRO
      cy.get('.ant-collapse-header')
        .contains('DATOS DEL SINIESTRO')
        .click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '38,940.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '21,060.00');

      // edita el pago conservando la misma moneda ( USD ) de 10 000 a 20 000
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-edit'
      ).click();
      cy.get('[data-cy=saldo_pendiente]').should('contain', '18,181.82');

      // cambia monto de 10 000 a 20 000
      cy.get('#OtrosConceptosModal_modal_mtoImporte').clear();
      cy.get('#OtrosConceptosModal_modal_mtoImporte').type('15000');

      // click boton grabar
      cy.get('#modal_otros_conceptos_grabar').click();

      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '58,410.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '1,590.00');

      // elimina pago
      cy.get(
        '#tabla_pagos_otros_conceptos .ant-table-fixed-right tbody>tr>td:last-child i.anticon-delete'
      ).click();
      cy.get('#confirmar-eliminar-pago button.ant-btn-primary').click();
      // assert total pagos y saldo pendiente
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(5)'
      ).should('contain', '0.00');
      cy.get(
        '#tabla_otros_conceptos tbody > tr:nth-child(2) > td:nth-child(6)'
      ).should('contain', '60,000.00');
    });
  });
});
