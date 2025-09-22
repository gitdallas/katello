import {
  selectAPIStatus,
  selectAPIResponse,
  selectAPIError,
} from 'foremanReact/redux/API/APISelectors';
import { STATUS } from 'foremanReact/constants';

import { 
  GET_CONTENT_CREDENTIALS_KEY,
  GET_CONTENT_CREDENTIAL_KEY,
  UPDATE_CONTENT_CREDENTIAL_KEY,
  DELETE_CONTENT_CREDENTIAL_KEY 
} from './ContentCredentialConstants';

export const selectContentCredentials = (state) => {
  const response = selectAPIResponse(state, GET_CONTENT_CREDENTIALS_KEY);
  return response.results;
};

export const selectContentCredentialsResponse = (state) => {
  return selectAPIResponse(state, GET_CONTENT_CREDENTIALS_KEY);
};

export const selectContentCredentialsStatus = state =>
  selectAPIStatus(state, GET_CONTENT_CREDENTIALS_KEY) || STATUS.PENDING;

export const selectContentCredentialsError = state =>
  selectAPIError(state, GET_CONTENT_CREDENTIALS_KEY);

// Individual content credential selectors
export const selectContentCredential = (state) => {
  const response = selectAPIResponse(state, GET_CONTENT_CREDENTIAL_KEY);
  return response;
};

export const selectContentCredentialStatus = state =>
  selectAPIStatus(state, GET_CONTENT_CREDENTIAL_KEY) || STATUS.PENDING;

export const selectContentCredentialError = state =>
  selectAPIError(state, GET_CONTENT_CREDENTIAL_KEY);

export const selectUpdateContentCredentialStatus = state =>
  selectAPIStatus(state, UPDATE_CONTENT_CREDENTIAL_KEY);

export const selectUpdateContentCredentialError = state =>
  selectAPIError(state, UPDATE_CONTENT_CREDENTIAL_KEY);

export const selectDeleteContentCredentialStatus = state =>
  selectAPIStatus(state, DELETE_CONTENT_CREDENTIAL_KEY);

export const selectDeleteContentCredentialError = state =>
  selectAPIError(state, DELETE_CONTENT_CREDENTIAL_KEY);
