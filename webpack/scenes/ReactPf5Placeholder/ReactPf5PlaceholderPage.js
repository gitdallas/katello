import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import {
  Page,
  PageSection,
  Title,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  TextInput,
  InputGroup,
  InputGroupItem,
  Flex,
  FlexItem,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@patternfly/react-table';
import { PlusIcon, SearchIcon } from '@patternfly/react-icons';

import getContentCredentials from '../ContentCredentials/ContentCredentialActions';
import {
  selectContentCredentials,
  selectContentCredentialsResponse,
  selectContentCredentialsStatus,
  selectContentCredentialsError,
} from '../ContentCredentials/ContentCredentialSelectors';
import Loading from '../../components/Loading';

const ReactPf5PlaceholderPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const contentCredentials = useSelector(selectContentCredentials) || [];
  const contentCredentialsResponse = useSelector(selectContentCredentialsResponse) || {};
  const contentCredentialsStatus = useSelector(selectContentCredentialsStatus);
  const contentCredentialsError = useSelector(selectContentCredentialsError);
  
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Actual applied search
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Load content credentials on component mount
  useEffect(() => {
    dispatch(getContentCredentials({
      page,
      per_page: perPage,
      search: searchQuery,
    }));
  }, [dispatch, page, perPage, searchQuery]);

  // For pagination, we'll use the API response data
  const paginatedData = contentCredentials;

  const onSearchInputChange = useCallback((value) => {
    setSearchValue(value);
  }, []);

  const onSearch = useCallback(() => {
    // Trigger API call with search query
    setSearchQuery(searchValue);
    setPage(1); // Reset to first page when searching
  }, [searchValue]);

  const onSearchClear = useCallback(() => {
    setSearchValue('');
    setSearchQuery('');
    setPage(1);
  }, []);

  const onSearchKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  const onPageChange = useCallback((_event, newPage) => {
    setPage(newPage);
  }, []);

  const onPerPageSelect = useCallback((_event, newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  }, []);

  // Get pagination metadata from API response
  const totalCount = contentCredentialsResponse.subtotal || contentCredentials.length;

  const formatContentType = (type) => {
    switch (type) {
      case 'gpg_key':
        return __('GPG Key');
      case 'ssl_ca_cert':
        return __('SSL CA Certificate');
      case 'ssl_client_cert':
        return __('SSL Client Certificate');
      case 'ssl_client_key':
        return __('SSL Client Key');
      default:
        return type;
    }
  };

  // Helper function to calculate product/repo counts
  const calculateCount = (credential, type) => {
    if (!credential) return 0;
    
    const countFields = {
      products: [
        'gpg_key_products',
        'ssl_ca_products', 
        'ssl_client_products',
        'ssl_key_products'
      ],
      repositories: [
        'gpg_key_repos',
        'ssl_ca_root_repos',
        'ssl_client_root_repos', 
        'ssl_key_root_repos'
      ],
      alternateContentSources: [
        'ssl_ca_alternate_content_sources',
        'ssl_client_alternate_content_sources',
        'ssl_key_alternate_content_sources'
      ]
    };

    const fields = countFields[type] || [];
    return fields.reduce((total, field) => {
      const value = credential[field];
      return total + (Array.isArray(value) ? value.length : 0);
    }, 0);
  };

  // Show loading state
  if (contentCredentialsStatus === STATUS.PENDING) {
    return <Loading />;
  }

  // Show error state
  if (contentCredentialsStatus === STATUS.ERROR) {
    return (
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1" size="2xl">
            {__('Content Credentials')}
          </Title>
        </PageSection>
        <PageSection>
          <EmptyState variant={EmptyStateVariant.lg}>
            <EmptyStateIcon icon={SearchIcon} />
            <Title headingLevel="h4" size="lg">
              {__('Unable to load Content Credentials')}
            </Title>
            <EmptyStateBody>
              {contentCredentialsError?.message || __('An error occurred while loading content credentials.')}
            </EmptyStateBody>
            <Button 
              variant="primary" 
              onClick={() => dispatch(getContentCredentials({
                page,
                per_page: perPage,
                search: searchQuery,
              }))}
            >
              {__('Retry')}
            </Button>
          </EmptyState>
        </PageSection>
      </Page>
    );
  }

  const columnNames = {
    name: __('Name'),
    organization: __('Organization'),
    type: __('Type'),
    products: __('Products'),
    repositories: __('Repositories'),
    alternateContentSources: __('Alternate Content Sources'),
  };

  return (
    <Page>
      <PageSection variant="light">
        <Title headingLevel="h1" size="2xl">
          {__('Content Credentials')}
        </Title>
      </PageSection>

      <PageSection>
        <Toolbar id="content-credentials-toolbar">
          <ToolbarContent>
            <ToolbarItem variant="search-filter">
              <InputGroup>
                <InputGroupItem isFill>
                  <TextInput
                    aria-label={__('Search content credentials')}
                    placeholder={__('Filter...')}
                    value={searchValue}
                    onChange={(_event, value) => onSearchInputChange(value)}
                    onKeyPress={onSearchKeyPress}
                  />
                </InputGroupItem>
                <InputGroupItem>
                  <Button
                    variant="control"
                    onClick={onSearch}
                    aria-label={__('Search')}
                  >
                    {__('Search')}
                  </Button>
                </InputGroupItem>
                {searchQuery && (
                  <InputGroupItem>
                    <Button
                      variant="control"
                      onClick={onSearchClear}
                      aria-label={__('Clear search')}
                    >
                      ✕
                    </Button>
                  </InputGroupItem>
                )}
              </InputGroup>
            </ToolbarItem>
            <ToolbarItem align={{ default: 'alignRight' }}>
              <Button
                variant="primary"
                icon={<PlusIcon />}
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert(__('Create Content Credential functionality would be implemented here'));
                }}
              >
                {__('Create Content Credential')}
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        {paginatedData.length > 0 ? (
          <Table aria-label={__('Content Credentials table')} variant="compact">
            <Thead>
              <Tr>
                <Th>{columnNames.name}</Th>
                <Th>{columnNames.organization}</Th>
                <Th>{columnNames.type}</Th>
                <Th modifier="center">{columnNames.products}</Th>
                <Th modifier="center">{columnNames.repositories}</Th>
                <Th modifier="center">{columnNames.alternateContentSources}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedData.map((credential) => (
                <Tr key={credential.id}>
                   <Td dataLabel={columnNames.name}>
                     <Button
                       variant="link"
                       isInline
                       onClick={() => history.push(`/content_credentials/${credential.id}`)}
                     >
                       {credential.name}
                     </Button>
                   </Td>
                  <Td dataLabel={columnNames.organization}>
                    {credential.organization.name}
                  </Td>
                  <Td dataLabel={columnNames.type}>
                    {formatContentType(credential.content_type)}
                  </Td>
                  <Td dataLabel={columnNames.products} modifier="center">
                    {calculateCount(credential, 'products')}
                  </Td>
                  <Td dataLabel={columnNames.repositories} modifier="center">
                    {calculateCount(credential, 'repositories')}
                  </Td>
                  <Td dataLabel={columnNames.alternateContentSources} modifier="center">
                    {calculateCount(credential, 'alternateContentSources')}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <EmptyState variant={EmptyStateVariant.lg}>
            <EmptyStateIcon icon={SearchIcon} />
            <Title headingLevel="h4" size="lg">
              {searchQuery
                ? __('Your search returned zero Content Credential.')
                : __("You currently don't have any Content Credential, you can add Content Credentials using the button above.")}
            </Title>
            <EmptyStateBody>
              {searchQuery
                ? __('Try changing your search settings.')
                : __('Content Credentials will appear here when created.')}
            </EmptyStateBody>
            {searchQuery && (
              <Button variant="link" onClick={onSearchClear}>
                {__('Clear search')}
              </Button>
            )}
          </EmptyState>
        )}

        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
          <FlexItem>
            <Pagination
              itemCount={totalCount}
              widgetId="content-credentials-pagination-bottom"
              perPage={perPage}
              page={page}
              variant={PaginationVariant.bottom}
              onSetPage={onPageChange}
              onPerPageSelect={onPerPageSelect}
            />
          </FlexItem>
        </Flex>
      </PageSection>
    </Page>
  );
};

export default ReactPf5PlaceholderPage;
