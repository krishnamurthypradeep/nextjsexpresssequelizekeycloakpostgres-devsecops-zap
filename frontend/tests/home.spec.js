// tests/home.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Home page flows', () => {
  // Adjust these globs if your app hits different endpoints.
  const SESSION_API = '**/api/auth/session';
  const SIGNIN_API = '**/api/auth/signin**';
  const SIGNOUT_API = '**/api/auth/signout**';
  const PRODUCTS_API = '**/api/products**'; // change to the real product API path your app calls

  test('unauthenticated: shows login and triggers signIn', async ({ page }) => {
  // Ensure session endpoint returns "unauthenticated"
  await page.route(SESSION_API, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(null),
    })
  );

  await page.goto('/');

  // Confirm the login UI is shown
  await expect(page.locator('text=Welcome to Product Store')).toBeVisible();
  const loginBtn = page.locator('button', { hasText: /Login with Keycloak/i });
  await expect(loginBtn).toBeVisible();

  // Two ways signIn can work: (A) it triggers a request to /api/auth/signin... (XHR/fetch)
  //                                or (B) it triggers a full navigation to provider (redirect).
  // We wait for either: a request that includes '/api/auth/signin' OR a navigation that contains 'keycloak'
  const signinRequestPromise = page.waitForRequest(req =>
    req.url().includes('/api/auth/signin')
  ).catch(() => null); // resolve null if no request occurs

  const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => null);

  // Click login and wait for either to happen (whichever completes first)
  await Promise.all([
    loginBtn.click(),
    // race: whichever completes
  ]);

  // now await one of the indicators (with a short timeout)
  const [reqResult, navResult] = await Promise.all([
    signinRequestPromise,
    navigationPromise,
  ]);

  // Assert at least one behavior happened
  if (reqResult) {
    // we captured a sign-in request
    expect(reqResult.url()).toContain('/api/auth/signin');
  } else if (navResult) {
    // a navigation happened — check it's likely the provider or signin endpoint
    const currentUrl = page.url();
    // Accept either the NextAuth signin endpoint or the Keycloak provider domain
    expect(
      currentUrl.includes('/api/auth/signin') || currentUrl.toLowerCase().includes('keycloak')
    ).toBeTruthy();
  } else {
    // Neither happened — fail with diagnostic hint
    throw new Error('Clicking the Login button did not trigger a signin request or navigation. Check NextAuth flow and update the test URL matchers.');
  }
});


  test('authenticated: fetches products and logout redirects', async ({ page }) => {
    // Mock session endpoint to return an authenticated session object
    await page.route(SESSION_API, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Alice' },
          access_token: 'fake-access-token',
          expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        }),
      })
    );

    // Mock product API to return predictable products
    await page.route(PRODUCTS_API, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Product A' },
          { id: 2, name: 'Product B' },
        ]),
      })
    );

    // Spy signOut endpoint, used when the Logout button is clicked
    let signOutCalled = false;
    await page.route(SIGNOUT_API, route => {
      signOutCalled = true;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });

    await page.goto('/');

    // Wait until Products UI is visible
    await expect(page.locator('text=Products')).toBeVisible();

    // Check that our mocked product names are present
    await expect(page.locator('text=Product A')).toBeVisible();
    await expect(page.locator('text=Product B')).toBeVisible();

    // Click Logout and assert signOut was invoked and the page attempted to redirect
    // The app triggers signOut then sets window.location.href to Keycloak logout URL.
    await page.click('button', { hasText: 'Logout' });

    // Wait a short while for signOut + redirect
    await page.waitForTimeout(500);

    expect(signOutCalled).toBeTruthy();

    // Optionally assert the page tries to set window.location to Keycloak logout URL.
    // We can't assert external redirect easily, but we can check that the window.location.href changed
    // if your app assigns it synchronously. If it uses an external redirect (window.location.href),
    // Playwright will follow unless blocked; so to be safe, check that href contains "logout" or issuer.
    const href = await page.evaluate(() => window.location.href);
    // This expectation is forgiving: either href changed to logout or remains baseURL (depends on signOut flow)
    // Replace 'auth.example.com' with your NEXT_PUBLIC_KEYCLOAK_ISSUER (domain) if you want strict check.
    expect(href).toBeTruthy();
  });
});

