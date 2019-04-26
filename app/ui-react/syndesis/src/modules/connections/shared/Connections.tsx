import { getConnectionIcon } from '@syndesis/api';
import { Connection } from '@syndesis/models';
import {
  ConnectionCard,
  ConnectionsGrid,
  ConnectionsGridCell,
  ConnectionSkeleton,
} from '@syndesis/ui';
import { WithLoader } from '@syndesis/utils';
import * as H from 'history';
import * as React from 'react';
import { ApiError } from '../../../shared';

export interface IConnectionsProps {
  error: boolean;
  loading: boolean;
  connections: Connection[];
  getConnectionHref(connection: Connection): H.LocationDescriptor;
}

export class Connections extends React.Component<IConnectionsProps> {
  public render() {
    return (
      <ConnectionsGrid>
        <WithLoader
          error={this.props.error}
          loading={this.props.loading}
          loaderChildren={
            <>
              {new Array(5).fill(0).map((_, index) => (
                <ConnectionsGridCell key={index}>
                  <ConnectionSkeleton />
                </ConnectionsGridCell>
              ))}
            </>
          }
          errorChildren={<ApiError />}
        >
          {() =>
            this.props.connections.map((c, index) => (
              <ConnectionsGridCell key={index}>
                <ConnectionCard
                  name={c.name}
                  description={c.description || ''}
                  icon={getConnectionIcon(process.env.PUBLIC_URL, c)}
                  href={this.props.getConnectionHref(c)}
                />
              </ConnectionsGridCell>
            ))
          }
        </WithLoader>
      </ConnectionsGrid>
    );
  }
}