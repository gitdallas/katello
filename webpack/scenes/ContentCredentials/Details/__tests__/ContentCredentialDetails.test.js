import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ContentCredentialDetails from '../ContentCredentialDetails';

const mockStore = configureStore([]);

const mockContentCredential = {
  id: 1,
  name: 'Test GPG Key',
  content_type: 'gpg_key',
  content: '-----BEGIN PGP PUBLIC KEY BLOCK-----\nTest content\n-----END PGP PUBLIC KEY BLOCK-----',
  gpg_key_products: [],
  ssl_ca_products: [],
  ssl_client_products: [],
  ssl_key_products: [],
  gpg_key_repos: [],
  ssl_ca_root_repos: [],
  ssl_client_root_repos: [],
  ssl_key_root_repos: [],
};

const renderComponent = (store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ContentCredentialDetails />
      </BrowserRouter>
    </Provider>
  );
};

describe('ContentCredentialDetails', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      API: {
        CONTENT_CREDENTIAL_DETAILS: {
          response: mockContentCredential,
          status: 'RESOLVED',
        },
      },
    });
  });

  it('renders content credential details', () => {
    renderComponent(store);
    
    expect(screen.getByText('Test GPG Key')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Repositories')).toBeInTheDocument();
    expect(screen.getByText('Alternate Content Sources')).toBeInTheDocument();
  });

  it('displays content credential information', () => {
    renderComponent(store);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('GPG Key')).toBeInTheDocument();
  });

  it('shows remove button', () => {
    renderComponent(store);
    
    expect(screen.getByText('Remove Content Credential')).toBeInTheDocument();
  });
});
