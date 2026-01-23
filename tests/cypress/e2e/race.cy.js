// cypress/e2e/stac_endpoints.cy.js

const DEFAULT_ENDPOINT = 'https://esa-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json';

const RACE_ENDPOINT = 'https://esa-eodashboards.github.io/RACE-catalog/RACE/catalog.json';

describe('Eodash with RACE STAC Endpoint', () => {
  beforeEach(() => {
    // Intercept the default STAC endpoint and redirect to RACE
    cy.intercept(
      {
        method: 'GET',
        url: DEFAULT_ENDPOINT, // Intercept the default endpoint
      },
      (req) => {
        req.redirect(RACE_ENDPOINT); // Redirect to RACE endpoint
      }
    ).as('redirectToRACE');

    cy.visit('http://localhost:5173');
    cy.wait('@redirectToRACE'); // Ensure the redirect happened
  });

  it('should load RACE indicators and allow interaction', () => {
    // 1. Verify RACE catalog loaded
    cy.get('.eodash-itemfilter-results').should('contain', 'RACE Indicator A'); // Placeholder for a known indicator title

    // 2. Navigate indicators/datasets
    cy.get('.eodash-itemfilter-results .indicator-card').first().click();

    // 3. Verify dataset loading
    cy.get('.ol-layer-container').should('be.visible');
    cy.get('.eodash-layer-control-list-item').should('have.length.at.least', 1);

    // 4. Interact with dataset (example: zoom map)
    cy.get('.ol-zoom-in').click();
    cy.get('.ol-zoom-out').click();

    // 5. Assert expected functionality
    cy.get('.ol-layer-container canvas').should('exist');
  });
});

it('locations', function() {
  cy.visit('http://localhost:5173')
  
});
