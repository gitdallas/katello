import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import ContentCredentialsIndex from '../ContentCredentialsIndex';

const mockStore = configureStore([]);

const mockContentCredentials = {
  results: [
    {
      id: 1,
      name: 'Test GPG Key',
      content_type: 'gpg_key',
      organization: { name: 'Test Org' },
      gpg_key_products: [],
      ssl_ca_products: [],
      ssl_client_products: [],
      ssl_key_products: [],
      gpg_key_repos: [],
      ssl_ca_root_repos: [],
      ssl_client_root_repos: [],
      ssl_key_root_repos: [],
      ssl_ca_alternate_content_sources: [],
      ssl_client_alternate_content_sources: [],
      ssl_key_alternate_content_sources: [],
    },
  ],
};

const renderComponent = (store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ContentCredentialsIndex />
      </BrowserRouter>
    </Provider>
  );
};

describe('ContentCredentialsIndex', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      API: {
        CONTENT_CREDENTIALS: {
          response: mockContentCredentials,
          status: 'RESOLVED',
        },
      },
    });
  });

  it('renders content credentials index', () => {
    renderComponent(store);
    
    expect(screen.getByText('Content Credentials')).toBeInTheDocument();
    expect(screen.getByText('Create Content Credential')).toBeInTheDocument();
  });

  it('displays content credential in table', () => {
    renderComponent(store);
    
    expect(screen.getByText('Test GPG Key')).toBeInTheDocument();
    expect(screen.getByText('Test Org')).toBeInTheDocument();
    expect(screen.getByText('GPG Key')).toBeInTheDocument();
  });
});
