import { WithViewEditorStates, WithVirtualizationHelpers } from '@syndesis/api';
import { RestDataService, ViewEditorState, ViewInfo } from '@syndesis/models';
import { ViewsImportLayout } from '@syndesis/ui';
import { WithRouteData } from '@syndesis/utils';
import * as React from 'react';
import { Translation } from 'react-i18next';
import { UIContext } from '../../../../app';
import resolvers from '../../../resolvers';
import { ViewInfosContent, ViewsImportSteps } from '../../shared';
import { generateViewEditorStates } from '../../shared/VirtualizationUtils';

/**
 * @param virtualizationId - the ID of the virtualization for the wizard.
 */
export interface ISelectViewsRouteParams {
  virtualizationId: string;
}

/**
 * @param virtualization - the virtualization for the wizard.
 * @param connectionId - the id of the selected connection
 */
export interface ISelectViewsRouteState {
  virtualization: RestDataService;
  connectionId: string;
}

export interface ISelectViewsPageState {
  selectedViews: ViewInfo[];
  saveInProgress: boolean;
}

export class SelectViewsPage extends React.Component<
  {},
  ISelectViewsPageState
> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      saveInProgress: false,
      selectedViews: [], // initialize selected views state
    };
    this.handleSetSelectedViews = this.handleSetSelectedViews.bind(this);
    this.setInProgress = this.setInProgress.bind(this);
  }

  public getExistingViewNames(editorStates: ViewEditorState[]) {
    const viewNames: string[] = [];
    for (const editorState of editorStates) {
      viewNames.push(editorState.viewDefinition.viewName);
    }
    return viewNames;
  }

  public handleSetSelectedViews(views: ViewInfo[]) {
    alert('handleSetSelectedViews: ' + views.length);
    this.setState({
      selectedViews: views,
    });
  }

  public setInProgress(isWorking: boolean) {
    this.setState({
      saveInProgress: isWorking,
    });
  }

  public render() {
    return (
      <Translation ns={['data', 'shared']}>
        {t => (
          <UIContext.Consumer>
            {({ pushNotification }) => {
              return (
                <WithRouteData<ISelectViewsRouteParams, ISelectViewsRouteState>>
                  {(
                    { virtualizationId },
                    { virtualization, connectionId },
                    { history }
                  ) => (
                    <WithVirtualizationHelpers>
                      {({ refreshVirtualizationViews }) => {
                        const handleCreateViews = async () => {
                          this.setInProgress(true);
                          const viewEditorStates = generateViewEditorStates(
                            virtualization.serviceVdbName,
                            this.state.selectedViews
                          );
                          try {
                            await refreshVirtualizationViews(
                              virtualization.keng__id,
                              viewEditorStates
                            );
                            pushNotification(
                              t('virtualization.importViewsSuccess', {
                                name: virtualization.serviceVdbName,
                              }),
                              'success'
                            );
                          } catch (error) {
                            const details = error.message ? error.message : '';
                            pushNotification(
                              t('virtualization.importViewsFailed', {
                                details,
                                name: virtualization.serviceVdbName,
                              }),
                              'error'
                            );
                          }
                          this.setInProgress(false);
                          history.push(
                            resolvers.data.virtualizations.views.root({
                              virtualization,
                            })
                          );
                        };
                        return (
                          <WithViewEditorStates
                            idPattern={virtualization.serviceVdbName + '*'}
                          >
                            {({ data, hasData, error }) => (
                              <ViewsImportLayout
                                header={<ViewsImportSteps step={2} />}
                                content={
                                  <ViewInfosContent
                                    connectionName={connectionId}
                                    existingViewNames={this.getExistingViewNames(
                                      data
                                    )}
                                    onSelectedViewsChanged={
                                      this.handleSetSelectedViews
                                    }
                                  />
                                }
                                cancelHref={resolvers.data.virtualizations.views.root(
                                  {
                                    virtualization,
                                  }
                                )}
                                backHref={resolvers.data.virtualizations.views.importSource.selectConnection(
                                  { virtualization }
                                )}
                                onCreateViews={handleCreateViews}
                                isNextDisabled={
                                  !(this.state.selectedViews.length > 0)
                                }
                                isNextLoading={this.state.saveInProgress}
                                isLastStep={true}
                              />
                            )}
                          </WithViewEditorStates>
                        );
                      }}
                    </WithVirtualizationHelpers>
                  )}
                </WithRouteData>
              );
            }}
          </UIContext.Consumer>
        )}
      </Translation>
    );
  }
}
