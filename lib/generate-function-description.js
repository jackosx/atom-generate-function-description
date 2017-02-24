'use babel';

import GenerateFunctionDescriptionView from './generate-function-description-view';
import { CompositeDisposable } from 'atom';

export default {

  generateFunctionDescriptionView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.generateFunctionDescriptionView = new GenerateFunctionDescriptionView(state.generateFunctionDescriptionViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.generateFunctionDescriptionView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'generate-function-description:generate': () => this.generateDescriptionComment()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.generateFunctionDescriptionView.destroy();
  },

  serialize() {
    return {
      generateFunctionDescriptionViewState: this.generateFunctionDescriptionView.serialize()
    };
  },

  generateDescriptionComment() {
      let editor;
        if (editor = atom.workspace.getActiveTextEditor()) {
          let selection = editor.getSelectedText().trim();
          let openP = selection.indexOf('(');
          let closeP = selection.lastIndexOf(')');
          let params = selection.slice(openP + 1, closeP).split(',')
                                .map(p => p.trim()+' - ').join(`\n *           `);
          let firstSpace = selection.indexOf(' ');
          let returnT = firstSpace < openP ? selection.slice(0, firstSpace) : ''; //TODO make it recognize keyworks, like static
              returnT = returnT == "void" ? "None" : returnT + ' - ';
          let comment =  [`/*`,
                          ` * PURPOSE : Autogenerates function contract comments`,
                          ` *  PARAMS : ${params}`,
                          ` * RETURNS : ${returnT}`,
                          ` *   NOTES :`,
                          ` */`,
                          ` ${selection};`].join(`\n`);
          selection = selection.charAt(selection.length) == `\n` ? selection + `\n` : selection;
          editor.insertText(comment);
        }
  }

};
