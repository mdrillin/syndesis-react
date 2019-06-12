import { WithVirtualizationConnectionSchema } from '@syndesis/api';
import { SchemaNode, ViewInfo } from '@syndesis/models';
import {
  IActiveFilter,
  IFilterType,
  ISortType,
  ViewInfoList,
  ViewInfoListItem,
  ViewInfoListSkeleton,
} from '@syndesis/ui';
import { WithListViewToolbarHelpers, WithLoader } from '@syndesis/utils';
import * as React from 'react';
import { Translation } from 'react-i18next';
import i18n from '../../../i18n';
import { ApiError } from '../../../shared';
import { generateViewInfos } from './VirtualizationUtils';

function getViewInfos(
  schemaNodes: SchemaNode[],
  existingViewNames: string[],
  selectedViewNames: string[]
) {
  const viewInfos: ViewInfo[] = [];
  if (schemaNodes && schemaNodes.length > 0) {
    generateViewInfos(
      viewInfos,
      schemaNodes[0],
      [],
      existingViewNames,
      selectedViewNames
    );
  }
  return viewInfos;
}

function getFilteredAndSortedViewInfos(
  viewInfos: ViewInfo[],
  activeFilters: IActiveFilter[],
  currentSortType: ISortType,
  isSortAscending: boolean
) {
  let filteredAndSorted = viewInfos;
  activeFilters.forEach((filter: IActiveFilter) => {
    const valueToLower = filter.value.toLowerCase();
    filteredAndSorted = filteredAndSorted.filter((viewInfo: ViewInfo) =>
      viewInfo.viewName.toLowerCase().includes(valueToLower)
    );
  });

  filteredAndSorted = filteredAndSorted.sort((thisViewInfo, thatViewInfo) => {
    if (isSortAscending) {
      return thisViewInfo.viewName.localeCompare(thatViewInfo.viewName);
    }

    // sort descending
    return thatViewInfo.viewName.localeCompare(thisViewInfo.viewName);
  });

  return filteredAndSorted;
}

export interface IViewInfosContentProps {
  connectionName: string;
  existingViewNames: string[];
  onSelectedViewsChanged: (views: ViewInfo[]) => void;
}

export interface IViewInfosContentState {
  selectedViewNames: string[];
}

const filterByName = {
  filterType: 'text',
  id: 'name',
  placeholder: i18n.t('shared:filterByNamePlaceholder'),
  title: i18n.t('shared:Name'),
} as IFilterType;

const filterTypes: IFilterType[] = [filterByName];

const sortByName = {
  id: 'name',
  isNumeric: false,
  title: i18n.t('shared:Name'),
} as ISortType;

const sortTypes: ISortType[] = [sortByName];

export class ViewInfosContent extends React.Component<
  IViewInfosContentProps,
  IViewInfosContentState
> {
  public displayedViews: ViewInfo[] = [];
  public allViewInfos: ViewInfo[] = [];

  public constructor(props: IViewInfosContentProps) {
    super(props);
    this.state = {
      selectedViewNames: ['*'], // initialize selected views state
    };
    this.handleViewSelectionChange = this.handleViewSelectionChange.bind(this);
    this.handleSelectAllChange = this.handleSelectAllChange.bind(this);
  }

  public handleViewSelectionChange(name: string, selected: boolean) {
    const selViews = [];
    for (const viewInfo of this.allViewInfos) {
      if (viewInfo.viewName === name) {
        viewInfo.selected = selected;
      }
      if (viewInfo.selected) {
        selViews.push(viewInfo);
      }
    }
    const viewNames: string[] = [];
    selViews.map(view => viewNames.push(view.viewName));
    this.setState({
      selectedViewNames: viewNames,
    });

    this.props.onSelectedViewsChanged(selViews);
  }

  public handleSelectAllChange(selected: boolean) {
    this.displayedViews.map(view => (view.selected = selected));
  }

  public render() {
    return (
      <WithVirtualizationConnectionSchema
        connectionId={this.props.connectionName}
      >
        {({ data, hasData, error }) => (
          <WithListViewToolbarHelpers
            defaultFilterType={filterByName}
            defaultSortType={sortByName}
          >
            {helpers => {
              this.allViewInfos = getViewInfos(
                data,
                this.props.existingViewNames,
                this.state.selectedViewNames
              );
              const filteredAndSorted = getFilteredAndSortedViewInfos(
                this.allViewInfos,
                helpers.activeFilters,
                helpers.currentSortType,
                helpers.isSortAscending
              );
              this.displayedViews = filteredAndSorted;

              return (
                <Translation ns={['data', 'shared']}>
                  {t => (
                    <ViewInfoList
                      filterTypes={filterTypes}
                      sortTypes={sortTypes}
                      {...this.state}
                      resultsCount={filteredAndSorted.length}
                      {...helpers}
                      i18nEmptyStateInfo={t(
                        'virtualization.emptyStateInfoMessage'
                      )}
                      i18nEmptyStateTitle={t('virtualization.emptyStateTitle')}
                      i18nName={t('shared:Name')}
                      i18nNameFilterPlaceholder={t(
                        'shared:nameFilterPlaceholder'
                      )}
                      i18nResultsCount={t('shared:resultsCount', {
                        count: filteredAndSorted.length,
                      })}
                      onSelectAllChanged={this.handleSelectAllChange}
                    >
                      <WithLoader
                        error={error}
                        loading={!hasData}
                        loaderChildren={
                          <ViewInfoListSkeleton
                            width={800}
                            style={{
                              backgroundColor: '#FFF',
                              marginTop: 30,
                            }}
                          />
                        }
                        errorChildren={<ApiError />}
                      >
                        {() =>
                          this.displayedViews.map(
                            (viewInfo: ViewInfo, index: number) => (
                              <ViewInfoListItem
                                key={index}
                                connectionName={viewInfo.connectionName}
                                name={viewInfo.viewName}
                                nodePath={viewInfo.nodePath}
                                selected={viewInfo.selected}
                                i18nUpdate={t('shared:Update')}
                                isUpdateView={viewInfo.isUpdate}
                                onSelectionChanged={
                                  this.handleViewSelectionChange
                                }
                              />
                            )
                          )
                        }
                      </WithLoader>
                    </ViewInfoList>
                  )}
                </Translation>
              );
            }}
          </WithListViewToolbarHelpers>
        )}
      </WithVirtualizationConnectionSchema>
    );
  }
}
