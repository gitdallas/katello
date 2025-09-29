import { API_OPERATIONS, APIActions, get, put } from 'foremanReact/redux/API';
import { translate as __ } from 'foremanReact/common/I18n';
import api, { orgId } from '../../services/api';
import { 
  GET_CONTENT_CREDENTIALS_KEY, 
  GET_CONTENT_CREDENTIAL_KEY,
  UPDATE_CONTENT_CREDENTIAL_KEY,
  DELETE_CONTENT_CREDENTIAL_KEY 
} from './ContentCredentialConstants';

export const getContentCredentials = (params = {}) => {
  const defaultParams = {
    organization_id: orgId(),
  };

  return get({
    type: API_OPERATIONS.GET,
    key: GET_CONTENT_CREDENTIALS_KEY,
    url: api.getApiUrl('/content_credentials'),
    params: { ...defaultParams, ...params },
  });
};

export const getContentCredential = (id) => {
  return get({
    type: API_OPERATIONS.GET,
    key: GET_CONTENT_CREDENTIAL_KEY,
    url: api.getApiUrl(`/content_credentials/${id}`),
    params: { organization_id: orgId() },
  });
};

export const updateContentCredential = (id, data, handleSuccess) => {
  return put({
    type: API_OPERATIONS.PUT,
    key: UPDATE_CONTENT_CREDENTIAL_KEY,
    url: api.getApiUrl(`/content_credentials/${id}`),
    params: { organization_id: orgId(), ...data },
    handleSuccess,
    successToast: () => __('Content credential updated'),
    errorToast: error => error?.response?.data?.displayMessage || __('Update failed'),
  });
};

export const deleteContentCredential = (id, handleSuccess) => {
  return APIActions.delete({
    type: API_OPERATIONS.DELETE,
    key: DELETE_CONTENT_CREDENTIAL_KEY,
    url: api.getApiUrl(`/content_credentials/${id}`),
    params: { organization_id: orgId() },
    handleSuccess,
    successToast: () => __('Content credential deleted'),
    errorToast: error => error?.response?.data?.displayMessage || __('Delete failed'),
  });
};

export default getContentCredentials;
