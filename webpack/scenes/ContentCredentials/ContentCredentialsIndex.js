import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
  Button,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import { APIActions } from 'foremanReact/redux/API';
import { selectAPIResponse } from 'foremanReact/redux/API/APISelectors';
import TableWrapper from '../../components/Table/TableWrapper';
import { TableVariant, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import Loading from '../../components/Loading';

const ContentCredentialsIndex = () => {
  const dispatch = useDispatch();
  
  const contentCredentialsResponse = useSelector(state => 
    selectAPIResponse(state, 'CONTENT_CREDENTIALS')
  );
  const contentCredentialsStatus = useSelector(state => 
    selectAPIResponse(state, 'CONTENT_CREDENTIALS')?.status
  );

  useEffect(() => {
    dispatch(
      APIActions.get({
        url: '/katello/api/v2/content_credentials',
        key: 'CONTENT_CREDENTIALS',
        params: {
          organization_id: window.tfm?.organizationId,
        },
      })
    );
  }, [dispatch]);

  const getContentTypeLabel = (contentType) => {
    const typeMap = {
      'gpg_key': 'GPG Key',
      'ssl_ca': 'SSL CA Certificate',
      'ssl_client_cert': 'SSL Client Certificate',
      'ssl_client_key': 'SSL Client Key',
    };
    return typeMap[contentType] || contentType;
  };

  const getProductCount = (credential) => {
    return (
      (credential.gpg_key_products?.length || 0) +
      (credential.ssl_ca_products?.length || 0) +
      (credential.ssl_client_products?.length || 0) +
      (credential.ssl_key_products?.length || 0)
    );
  };

  const getRepositoryCount = (credential) => {
    return (
      (credential.gpg_key_repos?.length || 0) +
      (credential.ssl_ca_root_repos?.length || 0) +
      (credential.ssl_client_root_repos?.length || 0) +
      (credential.ssl_key_root_repos?.length || 0)
    );
  };

  const getACSCount = (credential) => {
    return (
      (credential.ssl_ca_alternate_content_sources?.length || 0) +
      (credential.ssl_client_alternate_content_sources?.length || 0) +
      (credential.ssl_key_alternate_content_sources?.length || 0)
    );
  };

  if (contentCredentialsStatus === STATUS.PENDING) {
    return <Loading />;
  }

  const { results = [] } = contentCredentialsResponse || {};

  return (
    <Grid>
      <GridItem span={12} className="margin-16-24">
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <TextContent>
              <Text ouiaId="content-credentials-title" component={TextVariants.h1}>
                {__('Content Credentials')}
              </Text>
            </TextContent>
          </FlexItem>
          <FlexItem>
            <Button
              variant="primary"
              component={(props) => <Link to="/content_credentials/new" {...props} />}
              ouiaId="create-content-credential-button"
            >
              {__('Create Content Credential')}
            </Button>
          </FlexItem>
        </Flex>
      </GridItem>

      <GridItem span={12}>
        <TableWrapper
          {...{
            results,
            status: contentCredentialsStatus,
            error: contentCredentialsResponse?.error,
          }}
          ouiaId="content-credentials-table"
          variant={TableVariant.compact}
          emptyContentTitle={__('You currently don\'t have any Content Credential, you can add Content Credentials using the button on the right.')}
          emptySearchTitle={__('Your search returned zero Content Credential.')}
          emptyContentBody={__('Content Credentials will appear here when created.')}
          emptySearchBody={__('Try changing your search settings.')}
        >
          <Thead>
            <Tr ouiaId="content-credentials-table-header">
              <Th>{__('Name')}</Th>
              <Th>{__('Organization')}</Th>
              <Th>{__('Type')}</Th>
              <Th>{__('Products')}</Th>
              <Th>{__('Repositories')}</Th>
              <Th>{__('Alternate Content Sources')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {results.map((credential) => (
              <Tr key={credential.id} ouiaId={`content-credential-${credential.id}-row`}>
                <Td>
                  <Link to={`/content_credentials/${credential.id}`}>
                    {credential.name}
                  </Link>
                </Td>
                <Td>{credential.organization?.name}</Td>
                <Td>{getContentTypeLabel(credential.content_type)}</Td>
                <Td>{getProductCount(credential)}</Td>
                <Td>{getRepositoryCount(credential)}</Td>
                <Td>{getACSCount(credential)}</Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrapper>
      </GridItem>
    </Grid>
  );
};

export default ContentCredentialsIndex;
