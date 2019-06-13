import * as CodeMirror from 'codemirror';
import * as React from 'react';
import {
  IUnControlledCodeMirror,
  UnControlled as ReactCodeMirror,
} from 'react-codemirror2';
import { toValidHtmlId } from '../../helpers';

import 'codemirror/addon/display/placeholder.js';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/lint/lint.js';
import './TextEditor.css';

export type ITextEditor = CodeMirror.Editor;

export interface ITextEditorProps extends IUnControlledCodeMirror {
  id?: string;
}

export const TextEditor: React.FunctionComponent<ITextEditorProps> = ({
  id,
  ...props
}) => {
  // Set default options here
  return (
    <div
      data-testid={`text-editor-${id ? toValidHtmlId(id) : 'codemirror'}`}
      className={'text-editor'}
    >
      <ReactCodeMirror {...props} />
    </div>
  );
};
