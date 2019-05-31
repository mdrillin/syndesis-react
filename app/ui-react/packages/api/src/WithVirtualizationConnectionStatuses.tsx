import { VirtualizationSourceStatus } from '@syndesis/models';
import * as React from 'react';
import { DVFetch } from './DVFetch';
import { IFetchState } from './Fetch';

export interface IWithVirtualizationConnectionStatusesRenderProps
  extends IFetchState<VirtualizationSourceStatus[]> {
  read(): Promise<void>;
}

export interface IWithVirtualizationConnectionStatusesProps {
  children(props: IWithVirtualizationConnectionStatusesRenderProps): any;
}

export class WithVirtualizationConnectionStatuses extends React.Component<
  IWithVirtualizationConnectionStatusesProps
> {
  public render() {
    return (
      <DVFetch<VirtualizationSourceStatus[]>
        url={'metadata/syndesisSourceStatuses'}
        defaultValue={[]}
      >
        {({ read, response }) => this.props.children({ ...response, read })}
      </DVFetch>
    );
  }
}
