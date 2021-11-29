const apiUrl = 'https://dkj6kit9eb.execute-api.us-east-2.amazonaws.com/desa/v1';

describe('validaciones de completar datos', () => {
  beforeEach(() => {
    cy.server();
    cy.login('mlpaucara@synopsis.ws', 'Rim@cCl4ims');
    cy.fixtureCargaInicialTareas();
    cy.cargaStubUsuarioEjecutivo();

    cy.visit('http://localhost:8000');

    cy.wait('@getUsuario');

    // servicios necesarios para la tarea
    cy.fixture('tareas/completar_datos/obtbandeja.json').as('tareaJSON');
    cy.route('POST', `${apiUrl}/obtbandeja`, '@tareaJSON');

    cy.get('a[href="/tareas"]').click({ force: true });
    cy.contains('h1', 'Bandeja de Tareas');

    cy.fixture('general/listas/obtenerlista-crg_tmedio_transporte').as(
      'crg_tmedio_transporteJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtenerlista-crg_tmedio_transporte`,
      '@crg_tmedio_transporteJSON'
    ).as('obtenerlista-crg_tmedio_transporte');

    cy.fixture('general/listas/obtenerlista-crg_tevento').as('crg_teventoJSON');
    cy.route(
      'POST',
      `${apiUrl}/obtenerlista-crg_tevento`,
      '@crg_teventoJSON'
    ).as('obtenerlista-crg_tevento');

    cy.fixture('general/listas/obtenerlista-crg_tperdida').as(
      'crg_tperdidaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtenerlista-crg_tperdida`,
      '@crg_tperdidaJSON'
    ).as('obtenerlista-crg_tperdida');

    cy.fixture('general/listas/obtenerlista-crg_tvalor_factura').as(
      'obtenerlista-crg_tvalor_facturaJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/obtenerlista-crg_tvalor_factura`,
      '@obtenerlista-crg_tvalor_facturaJSON'
    ).as('obtenerlista-crg_tvalor_factura');

    cy.fixture('tareas/completar_datos/bsccertificado.json').as(
      'bsccertificadoJSON'
    );
    cy.route('POST', `${apiUrl}/bsccertificado`, '@bsccertificadoJSON').as(
      'bsccertificado'
    );

    cy.fixture('tareas/completar_datos/bscpoliza.json').as('bscpolizaJSON');
    cy.route('POST', `${apiUrl}/bscpoliza`, '@bscpolizaJSON').as('bscpoliza');

    cy.fixture('tareas/completar_datos/lstajustadores.json').as(
      'lstajustadoresJSON'
    );
    cy.route('POST', `${apiUrl}/lstajustadores`, '@lstajustadoresJSON').as(
      'lstajustadores'
    );

    cy.fixture('tareas/completar_datos/lstcausas.json').as('lstcausasJSON');
    cy.route('POST', `${apiUrl}/lstcausas`, '@lstcausasJSON').as('lstcausas');

    cy.fixture('tareas/completar_datos/lstconsecuencias.json').as(
      'lstconsecuenciasJSON'
    );
    cy.route('POST', `${apiUrl}/lstconsecuencias`, '@lstconsecuenciasJSON').as(
      'lstconsecuencias'
    );

    cy.fixture('tareas/completar_datos/lstramoscoberturas.json').as(
      'lstramoscoberturasJSON'
    );
    cy.route(
      'POST',
      `${apiUrl}/lstramoscoberturas`,
      '@lstramoscoberturasJSON'
    ).as('lstconsecuencias');

    cy.fixture('tareas/completar_datos/obtsiniestro.json').as(
      'obtsiniestroJSON'
    );
    cy.route('POST', `${apiUrl}/obtsiniestro`, '@obtsiniestroJSON').as(
      'obtsiniestro'
    );

    cy.get('table>tbody>tr>td.claims-rrgg-table-task>a').click();
  });

  it('editar cobertura', () => {
    cy.wait([
      '@obtsiniestro',
      '@obtenerlista-crg_tmedio_transporte',
      '@obtenerlista-crg_tevento',
      '@obtenerlista-crg_tperdida',
      '@bsccertificado',
      '@bscpoliza',
      '@lstajustadores'
    ]);
  });
});
