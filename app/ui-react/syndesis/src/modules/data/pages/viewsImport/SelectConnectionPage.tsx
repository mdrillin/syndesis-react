import { WithVirtualizationConnectionStatuses } from '@syndesis/api';
import { RestDataService, ViewInfo } from '@syndesis/models';
import { ViewsImportLayout } from '@syndesis/ui';
import { WithRouteData } from '@syndesis/utils';
import * as React from 'react';
import resolvers from '../../../resolvers';
import { DvConnectionsWithToolbar, ViewsImportSteps } from '../../shared';

/**
 * @param virtualizationId - the ID of the virtualization for the wizard
 */
export interface ISelectConnectionRouteParams {
  virtualizationId: string;
}

/**
 * @param virtualization - the virtualization for the wizard.
 */
export interface ISelectConnectionRouteState {
  connectionId: string;
  selectedViews: ViewInfo[];
  virtualization: RestDataService;
}

export interface ISelectConnectionPageState {
  selectedConnection: any;
}

export class SelectConnectionPage extends React.Component<
  {},
  ISelectConnectionPageState
> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      selectedConnection: '', // initial selected connection
    };
    this.handleConnectionSelectionChanged = this.handleConnectionSelectionChanged.bind(
      this
    );
  }

  public handleConnectionSelectionChanged(
    name: string,
    selected: boolean,
    read: () => Promise<void>
  ) {
    alert('handleSelectionChanged - ' + name + ': ');
    const selConn = selected ? name : '';
    this.setState({
      selectedConnection: selConn,
    });
    Promise.resolve().then(read);
  }

  public getNextHref(
    connectionId: string,
    selectedViews: ViewInfo[],
    virtualization: RestDataService
  ) {
    return resolvers.data.virtualizations.views.importSource.selectViews({
      connectionId,
      selectedViews,
      virtualization,
    });
  }

  public getNextIsDisabled() {
    return this.state.selectedConnection.length < 1;
  }

  public render() {
    return (
      <WithRouteData<ISelectConnectionRouteParams, ISelectConnectionRouteState>>
        {(
          { virtualizationId },
          { connectionId, selectedViews, virtualization },
          { history }
        ) => {
          const connId =
            connectionId && connectionId.length > 0
              ? connectionId
              : this.state.selectedConnection;
          return (
            <ViewsImportLayout
              header={<ViewsImportSteps step={1} />}
              content={
                <WithVirtualizationConnectionStatuses>
                  {({ data, hasData, error, read }) => (
                    <DvConnectionsWithToolbar
                      error={error}
                      loading={!hasData}
                      dvSourceStatuses={data}
                      onConnectionSelectionChanged={(name, selected) =>
                        this.handleConnectionSelectionChanged(
                          name,
                          selected,
                          read
                        )
                      }
                    />
                  )}
                </WithVirtualizationConnectionStatuses>
              }
              cancelHref={resolvers.data.virtualizations.views.root({
                virtualization,
              })}
              nextHref={this.getNextHref(connId, selectedViews, virtualization)}
              isNextDisabled={this.getNextIsDisabled()}
              isNextLoading={false}
              isLastStep={false}
            />
          );
        }}
      </WithRouteData>
    );
  }
}
