import React from 'react';
import { translate as __ } from 'foremanReact/common/I18n';
import {
  Page,
  PageSection,
  Title,
  Alert,
  Text,
  TextContent,
  TextVariants,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@patternfly/react-icons';

const ReactPf5PlaceholderPage = () => {
  return (
    <Page>
      <PageSection variant="light">
        <Flex alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              {__('React PatternFly 5 Placeholder')}
            </Title>
          </FlexItem>
          <FlexItem>
            <CheckCircleIcon color="green" size="lg" />
          </FlexItem>
        </Flex>
        <TextContent>
          <Text component={TextVariants.p}>
            {__('This is a demonstration page showing PatternFly 5 components in the Katello/Foreman architecture.')}
          </Text>
        </TextContent>
      </PageSection>

      <PageSection>
        <Alert
          variant="warning"
          title={__('PF5 Migration Architecture')}
          icon={<ExclamationTriangleIcon />}
        >
          <Text component={TextVariants.p}>
            {__('This page uses the same routing pattern as other Katello pages:')}
          </Text>
        </Alert>
      </PageSection>
    </Page>
  );
};

export default ReactPf5PlaceholderPage;
