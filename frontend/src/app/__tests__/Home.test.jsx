// src/app/__tests__/Home.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Home from '@/app/page'; // use alias @ -> src

// --- mocks ---
const signInMock = vi.fn();
const signOutMock = vi.fn();
const useSessionMock = vi.fn();

vi.mock('next-auth/react', () => ({
  signIn: (...args) => signInMock(...args),
  signOut: (...args) => signOutMock(...args),
  useSession: (...args) => useSessionMock(...args),
}));

vi.mock('@/components/ProductList', () => ({
  ProductsList: ({ products }) =>
    React.createElement(
      'div',
      { 'data-testid': 'products-list' },
      products && products.length
        ? products.map((p, i) =>
            React.createElement(
              'div',
              { key: i, 'data-testid': 'product-item' },
              p.name == null ? `prod-${i}` : p.name
            )
          )
        : 'no-products'
    ),
}));

vi.mock('@/lib/api', () => ({ getProducts: vi.fn() }));

import { useSession, signIn, signOut } from 'next-auth/react';
import { getProducts } from '@/lib/api';

describe('Home (no-JSX test)', () => {
  const origLocation = global.window.location;

  beforeEach(() => {
    vi.resetAllMocks();

    process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER = 'https://auth.example.com/auth/realms/demo';
    process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID = 'demo-client';

    // mock window.location
    delete global.window.location;
    global.window.location = { href: '', origin: 'http://localhost' };
  });

  afterEach(() => {
    global.window.location = origLocation;
  });

  test('renders loading state when session status is loading', () => {
    useSessionMock.mockReturnValue({ data: null, status: 'loading' });

    render(<Home/>);
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
  });

  test('renders login page and calls signIn on click', async () => {
    useSessionMock.mockReturnValue({ data: null, status: 'unauthenticated' });

    render(React.createElement(Home, null));
    expect(screen.getByRole('heading', { name: /Welcome to Product Store/i })).toBeInTheDocument();

    const loginBtn = screen.getByRole('button', { name: /Login with Keycloak/i });
    await userEvent.click(loginBtn);
    expect(signInMock).toHaveBeenCalledWith('keycloak');
  });

  test('fetches products using access_token and renders ProductsList', async () => {
    const fakeProducts = [{ id: 1, name: 'Product A' }, { id: 2, name: 'Product B' }];
    getProducts.mockResolvedValue(fakeProducts);

    useSessionMock.mockReturnValue({ data: { user: { name: 'alice' }, access_token: 'abc-123-token' }, status: 'authenticated' });

    render(<Home/>);
    await waitFor(() => expect(getProducts).toHaveBeenCalledWith('abc-123-token'));

    await waitFor(() => {
      const items = screen.getAllByTestId('product-item');
      expect(items).toHaveLength(fakeProducts.length);
      expect(items[0]).toHaveTextContent('Product A');
    });
  });

  test('logout calls signOut and redirects to Keycloak logout', async () => {
    useSessionMock.mockReturnValue({ data: { user: { name: 'bob' }, access_token: 'xyz-token' }, status: 'authenticated' });
    signOutMock.mockResolvedValue();

    render(React.createElement(Home, null));
    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    await userEvent.click(logoutBtn);

    await waitFor(() => expect(signOutMock).toHaveBeenCalledWith({ redirect: false }));

    const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
    const redirectUri = encodeURIComponent(global.window.location.origin);
    const expectedUrl = `${issuer}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;

    await waitFor(() => expect(global.window.location.href).toBe(expectedUrl));
  });
});
