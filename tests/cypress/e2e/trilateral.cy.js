// cypress/e2e/stac_endpoints.cy.js

const DEFAULT_ENDPOINT = 'https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json';
const TRILATERAL_ENDPOINT = 'https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json?doesnotlikeequal=placeholder';

describe('Eodash with Trilateral STAC Endpoint', () => {
  beforeEach(() => {
    // Intercept the default STAC endpoint and redirect to Cerulean
    cy.intercept(
      {
        method: 'GET',
        url: DEFAULT_ENDPOINT, // Intercept the default endpoint
      },
      (req) => {
        req.redirect(TRILATERAL_ENDPOINT); // Redirect to trilateral endpoint
      }
    ).as('redirectToTrilateral');

    cy.visit('http://localhost:5173');
    cy.wait('@redirectToTrilateral'); // Ensure the redirect happened
  });

  it('locations', function() {
  
    cy.get('#tools-light path[d="M2,5V19H8V5H2M9,5V10H15V5H9M16,5V14H22V5H16M9,11V19H15V11H9M16,15V19H22V15H16Z"]').click();
    cy.get('#Tools span.v-btn__content').click();
    cy.get('eox-itemfilter.fill-height').shadow().find('#N3a2_chl_concentration_tri_jaxa img.image').click();
    // wait for map to load
    cy.wait(5000);
    cy.get('#main').shadow().find('#map div.ol-viewport').click(8, 279);
    cy.wait(5000);
    cy.get('.map-buttons > :nth-child(6)').click();
    // cy.get('#expert-datepicker div[aria-label="Saturday, Aug 16, 2025"]').click();
    // cy.get('#bg-widget button:nth-child(6)').click();
    // cy.get('#main').shadow().find('#map div.ol-viewport').click();

  });

});



