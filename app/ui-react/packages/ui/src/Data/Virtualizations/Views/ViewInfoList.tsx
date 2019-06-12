import { EmptyState, ListView } from 'patternfly-react';
import * as React from 'react';
import { IListViewToolbarProps, ListViewToolbar } from '../../../Shared';

import './ViewInfoList.css';

export interface IViewInfoListProps extends IListViewToolbarProps {
  i18nEmptyStateInfo: string;
  i18nEmptyStateTitle: string;
  i18nName: string;
  i18nNameFilterPlaceholder: string;
  onSelectAllChanged: (selected: boolean) => void;
}

export interface IViewInfoListState {
  isSelectAll: boolean;
}

export class ViewInfoList extends React.Component<
  IViewInfoListProps,
  IViewInfoListState
> {
  public constructor(props: IViewInfoListProps) {
    super(props);
    this.state = {
      isSelectAll: true, // initial selectAll state
    };
    this.handleSelectAllToggle = this.handleSelectAllToggle.bind(this);
  }

  public handleSelectAllToggle = () => (event: any) => {
    this.setState({
      isSelectAll: !this.state.isSelectAll,
    });
    this.props.onSelectAllChanged(!this.state.isSelectAll);
  };

  public render() {
    return (
      <>
        <ListViewToolbar {...this.props}>
          <div />
        </ListViewToolbar>
        {this.props.children ? (
          <>
            <div className="view-info-list-select-all-checkbox">
              <input
                data-testid={'view-info-list-select-all-input'}
                type="checkbox"
                value=""
                defaultChecked={this.state.isSelectAll}
                onChange={this.handleSelectAllToggle()}
              />
              <label className="view-info-list-select-all-label">
                {'Select All Views'}
              </label>
            </div>
            <ListView>{this.props.children}</ListView>
          </>
        ) : (
          <EmptyState>
            <EmptyState.Icon />
            <EmptyState.Title>
              {this.props.i18nEmptyStateTitle}
            </EmptyState.Title>
            <EmptyState.Info>{this.props.i18nEmptyStateInfo}</EmptyState.Info>
          </EmptyState>
        )}
      </>
    );
  }
}
