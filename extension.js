// Simple VsCode extension Definition Provider. When ctrl+clicking on a text like
// <example>
// it will search for `<example>:` in the file, and navigate to the definition, if found.
// This is used to navigate to decompiled snippets like
// Disassembly of <code object Settings at 0x23ca1650, file "<x>", line 23>:

const vscode = require('vscode');

function activate(context) {
    let provider = vscode.languages.registerDefinitionProvider('pybc', {
        provideDefinition(document, position, token) {
            const lineText = document.lineAt(position.line).text;
            const match = findDelimitedTextInLine(lineText, position.character);
            if (!match) { return null; }

            const targetRange = findTextLocationInDocument(document, match.text + ":");
            if (targetRange === null) { return null; }

            const originSelectionRange = new vscode.Range(
                position.line,
                match.range.start,
                position.line,
                match.range.end
            );

            return {
                originSelectionRange,
                targetRange,
                targetUri: document.uri
            };
        }
    });

    context.subscriptions.push(provider);
}

function deactivate() {}

function findDelimitedTextInLine(lineText, column) {
    const start = lineText.indexOf('<');
    const end = lineText.lastIndexOf('>');

    if (start === -1 || end === -1 || start >= end) { return null; }
    if (column < start || column > end) { return null; }

    return {
        text: lineText.substring(start, end + 1), 
        range: { start, end: end + 1 }
    };
}

function findTextLocationInDocument(document, searchText) {
    const text = document.getText();
    let index = text.indexOf(searchText);

    if (index === -1) { return null; }

    const position = document.positionAt(index);
    return new vscode.Range(position, position.translate(0, searchText.length));
}

module.exports = {
    activate,
    deactivate
};
