import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { translate as __ } from 'foremanReact/common/I18n';
import { STATUS } from 'foremanReact/constants';
import {
  Page,
  PageSection,
  Title,
  Button,
  Tabs,
  Tab,
  TabTitleText,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  TextArea,
  TextInput,
  Form,
  FormGroup,
  ActionGroup,
  Alert,
  Spinner,
  Modal,
  ModalVariant,
  Breadcrumb,
  BreadcrumbItem,
} from '@patternfly/react-core';
import { TrashIcon, EditIcon } from '@patternfly/react-icons';

import {
  getContentCredential,
  updateContentCredential,
  deleteContentCredential,
} from '../ContentCredentialActions';
import {
  selectContentCredential,
  selectContentCredentialStatus,
  selectContentCredentialError,
  selectUpdateContentCredentialStatus,
  selectUpdateContentCredentialError,
  selectDeleteContentCredentialStatus,
  selectDeleteContentCredentialError,
} from '../ContentCredentialSelectors';
import Loading from '../../../components/Loading';

const ContentCredentialDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();

  const contentCredential = useSelector(selectContentCredential);
  const contentCredentialStatus = useSelector(selectContentCredentialStatus);
  const contentCredentialError = useSelector(selectContentCredentialError);
  const updateStatus = useSelector(selectUpdateContentCredentialStatus);
  const updateError = useSelector(selectUpdateContentCredentialError);
  const deleteStatus = useSelector(selectDeleteContentCredentialStatus);
  const deleteError = useSelector(selectDeleteContentCredentialError);

  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load content credential on mount
  useEffect(() => {
    if (id) {
      dispatch(getContentCredential(id));
    }
  }, [dispatch, id]);

  // Initialize edit data when content credential loads
  useEffect(() => {
    if (contentCredential) {
      setEditData({
        name: contentCredential.name || '',
        content: contentCredential.content || '',
      });
    }
  }, [contentCredential]);

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

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditData({
      name: contentCredential.name || '',
      content: contentCredential.content || '',
    });
  }, [contentCredential]);

  const refreshContentCredential = useCallback(() => {
    dispatch(getContentCredential(id));
  }, [dispatch, id]);

  const handleSave = useCallback(() => {
    console.log('Saving content credential with data:', editData);
    dispatch(updateContentCredential(id, editData, () => {
      setIsEditing(false);
      refreshContentCredential();
    }));
  }, [dispatch, id, editData, refreshContentCredential]);

  const handleDelete = useCallback(() => {
    dispatch(deleteContentCredential(id));
  }, [dispatch, id]);

  const handleDeleteConfirm = useCallback(() => {
    setIsDeleteModalOpen(false);
    handleDelete();
  }, [handleDelete]);

  // Handle update errors (success is handled in callback)
  useEffect(() => {
    if (updateStatus === STATUS.ERROR) {
      console.error('Update failed:', updateError);
    }
  }, [updateStatus, updateError]);

  useEffect(() => {
    if (deleteStatus === STATUS.RESOLVED) {
      history.push('/content_credentials');
    }
  }, [deleteStatus, history]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditData(prev => ({
          ...prev,
          content: e.target.result,
        }));
        setUploading(false);
      };
      reader.readAsText(file);
    }
  }, []);

  // Show loading state
  if (contentCredentialStatus === STATUS.PENDING) {
    return <Loading />;
  }

  // Show error state
  if (contentCredentialStatus === STATUS.ERROR) {
    return (
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1" size="2xl">
            {__('Content Credential Details')}
          </Title>
        </PageSection>
        <PageSection>
          <Alert variant="danger" title={__('Error loading content credential')}>
            {contentCredentialError?.message || __('An error occurred while loading the content credential.')}
          </Alert>
          <Button variant="primary" onClick={() => history.push('/content_credentials')}>
            {__('Back to Content Credentials')}
          </Button>
        </PageSection>
      </Page>
    );
  }

  if (!contentCredential) {
    return (
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1" size="2xl">
            {__('Content Credential Not Found')}
          </Title>
        </PageSection>
        <PageSection>
          <Button variant="primary" onClick={() => history.push('/content_credentials')}>
            {__('Back to Content Credentials')}
          </Button>
        </PageSection>
      </Page>
    );
  }

  const breadcrumbItems = [
    <BreadcrumbItem key="content-credentials" to="/content_credentials">
      {__('Content Credentials')}
    </BreadcrumbItem>,
    <BreadcrumbItem key="current" isActive>
      {contentCredential.name}
    </BreadcrumbItem>,
  ];

  return (
    <Page>
      <PageSection variant="light">
        <Breadcrumb>{breadcrumbItems}</Breadcrumb>
        <Title headingLevel="h1" size="2xl">
          {contentCredential.name}
        </Title>
        <div style={{ marginTop: '1rem' }}>
          <Button
            variant="danger"
            icon={<TrashIcon />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            {__('Remove Content Credential')}
          </Button>
        </div>
      </PageSection>

      <PageSection>
        <Tabs activeKey={activeTab} onSelect={(event, tabIndex) => setActiveTab(tabIndex)}>
          <Tab eventKey={0} title={<TabTitleText>{__('Details')}</TabTitleText>}>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <Button
                  variant="secondary"
                  icon={<EditIcon />}
                  onClick={handleEdit}
                  isDisabled={isEditing}
                >
                  {__('Edit')}
                </Button>
              </div>

              {updateError && (
                <Alert variant="danger" title={__('Update failed')} style={{ marginBottom: '1rem' }}>
                  {updateError.message || __('An error occurred while updating the content credential.')}
                </Alert>
              )}

              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Name')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {isEditing ? (
                      <TextInput
                        value={editData.name}
                        onChange={(_event, value) => setEditData(prev => ({ ...prev, name: value }))}
                        aria-label={__('Content credential name')}
                      />
                    ) : (
                      contentCredential.name
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Type')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {formatContentType(contentCredential.content_type)}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Content')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {isEditing ? (
                      <div>
                        <TextArea
                          value={editData.content}
                          onChange={(_event, value) => setEditData(prev => ({ ...prev, content: value }))}
                          aria-label={__('Content credential content')}
                          rows={10}
                          style={{ fontFamily: 'monospace' }}
                        />
                        <div style={{ marginTop: '1rem' }}>
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pem,.crt,.key,.gpg,.asc"
                            style={{ marginBottom: '1rem' }}
                          />
                          {uploading && <Spinner size="sm" />}
                        </div>
                      </div>
                    ) : (
                      <pre style={{ 
                        fontFamily: 'monospace', 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        maxHeight: '300px',
                        overflow: 'auto',
                        backgroundColor: '#f5f5f5',
                        padding: '1rem',
                        border: '1px solid #ccc'
                      }}>
                        {contentCredential.content}
                      </pre>
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Products')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => setActiveTab(1)}
                    >
                      {calculateCount(contentCredential, 'products')}
                    </Button>
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Repositories')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => setActiveTab(2)}
                    >
                      {calculateCount(contentCredential, 'repositories')}
                    </Button>
                  </DescriptionListDescription>
                </DescriptionListGroup>

                <DescriptionListGroup>
                  <DescriptionListTerm>{__('Alternate Content Sources')}</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Button
                      variant="link"
                      isInline
                      onClick={() => setActiveTab(3)}
                    >
                      {calculateCount(contentCredential, 'alternateContentSources')}
                    </Button>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              </DescriptionList>

              {isEditing && (
                <ActionGroup style={{ marginTop: '1rem' }}>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    isLoading={updateStatus === STATUS.PENDING}
                    isDisabled={updateStatus === STATUS.PENDING}
                  >
                    {updateStatus === STATUS.PENDING ? __('Saving...') : __('Save')}
                  </Button>
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    {__('Cancel')}
                  </Button>
                </ActionGroup>
              )}
            </div>
          </Tab>

          <Tab eventKey={1} title={<TabTitleText>{__('Products')}</TabTitleText>}>
            <div style={{ marginTop: '1rem' }}>
              <p>
                {__('Products using this content credential:')} {calculateCount(contentCredential, 'products')}
              </p>
              {/* TODO: Implement products list */}
              <Alert variant="info" title={__('Coming Soon')}>
                {__('Product details will be implemented here.')}
              </Alert>
            </div>
          </Tab>

          <Tab eventKey={2} title={<TabTitleText>{__('Repositories')}</TabTitleText>}>
            <div style={{ marginTop: '1rem' }}>
              <p>
                {__('Repositories using this content credential:')} {calculateCount(contentCredential, 'repositories')}
              </p>
              {/* TODO: Implement repositories list */}
              <Alert variant="info" title={__('Coming Soon')}>
                {__('Repository details will be implemented here.')}
              </Alert>
            </div>
          </Tab>

          <Tab eventKey={3} title={<TabTitleText>{__('Alternate Content Sources')}</TabTitleText>}>
            <div style={{ marginTop: '1rem' }}>
              <p>
                {__('Alternate Content Sources using this content credential:')} {calculateCount(contentCredential, 'alternateContentSources')}
              </p>
              {/* TODO: Implement ACS list */}
              <Alert variant="info" title={__('Coming Soon')}>
                {__('Alternate Content Source details will be implemented here.')}
              </Alert>
            </div>
          </Tab>
        </Tabs>
      </PageSection>

      {/* Delete Confirmation Modal */}
      <Modal
        variant={ModalVariant.small}
        title={`${__('Remove Content Credential')} ${contentCredential.name}`}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        actions={[
          <Button
            key="confirm"
            variant="danger"
            onClick={handleDeleteConfirm}
            isLoading={deleteStatus === STATUS.PENDING}
          >
            {__('Remove')}
          </Button>,
          <Button
            key="cancel"
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            {__('Cancel')}
          </Button>,
        ]}
      >
        {deleteError && (
          <Alert variant="danger" title={__('Delete failed')} style={{ marginBottom: '1rem' }}>
            {deleteError.message || __('An error occurred while deleting the content credential.')}
          </Alert>
        )}
{`${__('Are you sure you want to remove Content Credential')} ${contentCredential.name}?`}
      </Modal>
    </Page>
  );
};

export default ContentCredentialDetails;
