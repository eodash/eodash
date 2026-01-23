// cypress/e2e/stac_endpoints.cy.js

const DEFAULT_ENDPOINT = 'https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json';
const CERULEAN_ENDPOINT = 'https://gtif-cerulean.github.io/cerulean-catalog/cerulean/catalog.json';

describe('Eodash with Cerulean STAC Endpoint', () => {
  beforeEach(() => {
    // Intercept the default STAC endpoint and redirect to Cerulean
    cy.intercept(
      {
        method: 'GET',
        url: DEFAULT_ENDPOINT, // Intercept the default endpoint
      },
      (req) => {
        req.redirect(CERULEAN_ENDPOINT); // Redirect to Cerulean endpoint
      }
    ).as('redirectToCerulean');

    cy.visit('http://localhost:5173');
    cy.wait('@redirectToCerulean'); // Ensure the redirect happened
    cy.get('.eodash-app-container').should('be.visible');
  });

  it('should load Cerulean indicators and allow interaction', () => {
    // 1. Verify Cerulean catalog loaded
    cy.get('.eodash-itemfilter-results').should('contain', 'Cerulean Indicator X'); // Placeholder for a known indicator title

    // 2. Navigate indicators/datasets
    cy.get('.eodash-itemfilter-results .indicator-card').first().click();

    // 3. Verify dataset loading
    cy.get('.ol-layer-container').should('be.visible');
    cy.get('.eodash-layer-control-list-item').should('have.length.at.least', 1);

    // 4. Assert expected functionality
    // Check for a specific chart element if Cerulean has charts
    cy.get('.eodash-chart-container').should('exist');
  });
});