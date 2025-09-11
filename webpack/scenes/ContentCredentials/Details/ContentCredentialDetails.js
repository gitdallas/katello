import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Grid,
  GridItem,
  TextContent,
  Text,
  TextVariants,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Modal,
  ModalVariant,
  Icon,
  Title,
  Tabs,
  Tab,
  TabTitleText,
  TabContent,
  TabContentBody,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  TextArea,
  FileUpload,
  Alert,
  AlertVariant,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import { APIActions } from 'foremanReact/redux/API';
import { selectAPIResponse } from 'foremanReact/redux/API/APISelectors';
import Loading from '../../../components/Loading';

const ContentCredentialDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const contentCredentialId = Number(id);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const contentCredentialResponse = useSelector(state => 
    selectAPIResponse(state, 'CONTENT_CREDENTIAL_DETAILS')
  );
  const contentCredentialStatus = useSelector(state => 
    selectAPIResponse(state, 'CONTENT_CREDENTIAL_DETAILS')?.status
  );

  useEffect(() => {
    dispatch(
      APIActions.get({
        url: `/katello/api/v2/content_credentials/${contentCredentialId}`,
        key: 'CONTENT_CREDENTIAL_DETAILS',
      })
    );
  }, [dispatch, contentCredentialId]);

  const handleDelete = () => {
    dispatch(
      APIActions.delete({
        url: `/katello/api/v2/content_credentials/${contentCredentialId}`,
        key: 'DELETE_CONTENT_CREDENTIAL',
        successToast: () => __('Content credential was successfully deleted'),
        errorToast: ({ message }) => message,
        handleSuccess: () => navigate('/content_credentials'),
      })
    );
    setIsDeleteModalOpen(false);
  };

  const handleSave = () => {
    dispatch(
      APIActions.put({
        url: `/katello/api/v2/content_credentials/${contentCredentialId}`,
        key: 'UPDATE_CONTENT_CREDENTIAL',
        params: {
          name: contentCredentialResponse.name,
          content: editedContent,
        },
        successToast: () => __('Content credential updated'),
        errorToast: ({ message }) => message,
        handleSuccess: () => {
          setIsEditing(false);
          dispatch(
            APIActions.get({
              url: `/katello/api/v2/content_credentials/${contentCredentialId}`,
              key: 'CONTENT_CREDENTIAL_DETAILS',
            })
          );
        },
      })
    );
  };

  const handleUpload = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('content', file);

    setIsUploading(true);
    setUploadStatus(null);

    fetch(`/katello/api/v2/content_credentials/${contentCredentialId}/content`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          setUploadStatus({ type: AlertVariant.success, message: __('Content Credential successfully uploaded') });
          dispatch(
            APIActions.get({
              url: `/katello/api/v2/content_credentials/${contentCredentialId}`,
              key: 'CONTENT_CREDENTIAL_DETAILS',
            })
          );
        } else {
          setUploadStatus({ type: AlertVariant.danger, message: data.displayMessage });
        }
      })
      .catch(error => {
        setUploadStatus({ 
          type: AlertVariant.danger, 
          message: __('Error during upload: ') + error.message 
        });
      })
      .finally(() => {
        setIsUploading(false);
        setFile(null);
      });
  };

  const getContentTypeLabel = (contentType) => {
    const typeMap = {
      'gpg_key': 'GPG Key',
      'ssl_ca': 'SSL CA Certificate',
      'ssl_client_cert': 'SSL Client Certificate',
      'ssl_client_key': 'SSL Client Key',
    };
    return typeMap[contentType] || contentType;
  };

  const getProductCount = () => {
    if (!contentCredentialResponse) return 0;
    return (
      (contentCredentialResponse.gpg_key_products?.length || 0) +
      (contentCredentialResponse.ssl_ca_products?.length || 0) +
      (contentCredentialResponse.ssl_client_products?.length || 0) +
      (contentCredentialResponse.ssl_key_products?.length || 0)
    );
  };

  const getRepositoryCount = () => {
    if (!contentCredentialResponse) return 0;
    return (
      (contentCredentialResponse.gpg_key_repos?.length || 0) +
      (contentCredentialResponse.ssl_ca_root_repos?.length || 0) +
      (contentCredentialResponse.ssl_client_root_repos?.length || 0) +
      (contentCredentialResponse.ssl_key_root_repos?.length || 0)
    );
  };

  if (contentCredentialStatus === STATUS.PENDING) {
    return <Loading />;
  }

  if (!contentCredentialResponse) {
    return null;
  }

  const tabs = [
    {
      title: __('Details'),
      content: (
        <TabContentBody>
          <Grid>
            <GridItem span={12}>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Name')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {contentCredentialResponse.name}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                
                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Type')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {getContentTypeLabel(contentCredentialResponse.content_type)}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                
                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Content')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {uploadStatus && (
                      <Alert
                        variant={uploadStatus.type}
                        title={uploadStatus.message}
                        className="margin-bottom-16"
                      />
                    )}
                    
                    {isEditing ? (
                      <div>
                        <TextArea
                          value={editedContent}
                          onChange={setEditedContent}
                          aria-label="content"
                          className="margin-bottom-16"
                          style={{ fontFamily: 'monospace' }}
                        />
                        <div className="margin-bottom-16">
                          <FileUpload
                            id="content-file-upload"
                            value={file}
                            filename={file?.name}
                            onChange={setFile}
                            browseButtonText={__('Browse')}
                            clearButtonText={__('Clear')}
                            aria-label="content file upload"
                          />
                        </div>
                        <div>
                          <Button
                            variant="primary"
                            onClick={handleSave}
                            className="margin-right-8"
                          >
                            {__('Save')}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setIsEditing(false);
                              setEditedContent('');
                              setFile(null);
                            }}
                          >
                            {__('Cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {contentCredentialResponse.content || __('No content')}
                        </pre>
                        <div className="margin-top-16">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setIsEditing(true);
                              setEditedContent(contentCredentialResponse.content || '');
                            }}
                          >
                            {__('Edit')}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleUpload}
                            isLoading={isUploading}
                            isDisabled={!file}
                            className="margin-left-8"
                          >
                            {isUploading ? __('Uploading...') : __('Upload')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                
                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Products')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Link to={`/content_credentials/${contentCredentialId}/products`}>
                      {getProductCount()}
                    </Link>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                
                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Repositories')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Link to={`/content_credentials/${contentCredentialId}/repositories`}>
                      {getRepositoryCount()}
                    </Link>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>
            </GridItem>
          </Grid>
        </TabContentBody>
      ),
    },
    {
      title: __('Products'),
      content: (
        <TabContentBody>
          <div>Products content will be implemented here</div>
        </TabContentBody>
      ),
    },
    {
      title: __('Repositories'),
      content: (
        <TabContentBody>
          <div>Repositories content will be implemented here</div>
        </TabContentBody>
      ),
    },
    {
      title: __('Alternate Content Sources'),
      content: (
        <TabContentBody>
          <div>Alternate Content Sources content will be implemented here</div>
        </TabContentBody>
      ),
    },
  ];

  return (
    <>
      <Grid>
        <GridItem span={12} className="margin-16-24">
          <Breadcrumb ouiaId="content-credential-details-breadcrumb">
            <BreadcrumbItem
              aria-label="content_credentials_breadcrumb"
              render={() => (<Link to="/content_credentials">{__('Content Credentials')}</Link>)}
            />
            <BreadcrumbItem
              aria-label="content_credential_breadcrumb"
              isActive
            >
              {contentCredentialResponse.name}
            </BreadcrumbItem>
          </Breadcrumb>
          
          <GridItem span={12} className="margin-top-24">
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <FlexItem>
                <TextContent>
                  <Text ouiaId="content-credential-details-text" component={TextVariants.h1}>
                    {contentCredentialResponse.name}
                  </Text>
                </TextContent>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="danger"
                  onClick={() => setIsDeleteModalOpen(true)}
                  ouiaId="remove-content-credential-button"
                >
                  {__('Remove Content Credential')}
                </Button>
              </FlexItem>
            </Flex>
          </GridItem>
        </GridItem>
        
        <GridItem span={12}>
          <Tabs
            activeKey={activeTab}
            onSelect={(event, tabIndex) => setActiveTab(tabIndex)}
            ouiaId="content-credential-tabs"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                eventKey={index}
                title={<TabTitleText>{tab.title}</TabTitleText>}
                ouiaId={`content-credential-tab-${index}`}
              />
            ))}
          </Tabs>
          
          <TabContent
            id="content-credential-tab-content"
            activeKey={activeTab}
            ouiaId="content-credential-tab-content"
          >
            {tabs[activeTab].content}
          </TabContent>
        </GridItem>
      </Grid>

      <Modal
        ouiaId="delete-content-credential-modal"
        variant={ModalVariant.small}
        title={[
          <Flex key="delete-modal-header">
            <Icon status="warning" key="exclamation-triangle">
              <ExclamationTriangleIcon />
            </Icon>
            <Title ouiaId="delete-content-credential-header" key="delete-title" headingLevel="h5" size="2xl">
              {__('Remove Content Credential')} {contentCredentialResponse.name}
            </Title>
          </Flex>,
        ]}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        actions={[
          <Button ouiaId="delete-button" key="delete" variant="danger" onClick={handleDelete}>
            {__('Delete')}
          </Button>,
          <Button ouiaId="cancel-button" key="cancel" variant="link" onClick={() => setIsDeleteModalOpen(false)}>
            {__('Cancel')}
          </Button>,
        ]}
      >
        {__('Are you sure you want to remove Content Credential')} {contentCredentialResponse.name}?
      </Modal>
    </>
  );
};

export default ContentCredentialDetails;
