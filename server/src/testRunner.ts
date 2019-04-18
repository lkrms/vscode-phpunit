import { TextDocument, Position } from 'vscode-languageserver-types';
import Parser, { Test } from './parser';
import _files from './filesystem';
import { Process } from './process';
export class TestRunner {
    private lastArgs = [];

    constructor(
        private process = new Process(),
        private files = _files,
        private parser = new Parser()
    ) {}

    async runTest(textDocument: TextDocument) {
        const test: Test = this.parser
            .parseTextDocument(textDocument)
            .find(test => test.kind === 'class');

        return test ? await this.run(test.asArguments()) : '';
    }

    async runTestNearest(textDocument: TextDocument, position?: Position) {
        const tests: Test[] = this.parser.parseTextDocument(textDocument);
        const line = position && position.line ? position.line : 0;

        let test = tests.find(test => {
            return test.kind !== 'class' && test.range.end.line >= line;
        });

        if (!test) {
            test = tests.find(test => test.kind === 'class');
        }

        return test ? await this.run(test.asArguments()) : '';
    }

    async rerunLastTest(textDocument: TextDocument, position?: Position) {
        if (this.lastArgs.length === 0) {
            return await this.runTestNearest(textDocument, position);
        }

        return await this.run(this.lastArgs);
    }

    async run(args: string[]) {
        this.lastArgs = args;

        return await this.process.run({
            title: 'PHPUnit LSP',
            command: await this.getPHPUnitBinary(),
            arguments: args,
        });
    }

    private async getPHPUnitBinary(): Promise<string> {
        return await this.files.findUp(['vendor/bin/phpunit', 'phpunit']);
    }
}