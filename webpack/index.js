/* eslint import/no-unresolved: [2, { ignore: [foremanReact/*] }] */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */

import componentRegistry from 'foremanReact/components/componentRegistry';
import Application from './containers/Application/index';
import Content from './scenes/SmartProxy/Content';
import ChangeContentSource from './scenes/Hosts/ChangeContentSource';
import ContentCredentialDetails from './scenes/ContentCredentials/Details/ContentCredentialDetails';
import ContentCredentialsIndex from './scenes/ContentCredentials/ContentCredentialsIndex';

import './redux';
// Not currently mocking anything
// import './services/api/setupMocks';

componentRegistry.register({
  name: 'katello',
  type: Application,
});

componentRegistry.register({
  name: 'Content',
  type: Content,
});

componentRegistry.register({
  name: 'ChangeContentSource',
  type: ChangeContentSource,
});

componentRegistry.register({
  name: 'ContentCredentialDetails',
  type: ContentCredentialDetails,
});

componentRegistry.register({
  name: 'ContentCredentialsIndex',
  type: ContentCredentialsIndex,
});
