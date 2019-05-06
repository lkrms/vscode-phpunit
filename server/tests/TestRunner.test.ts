import _files, { Filesystem } from '../src/filesystem';
import { dirname } from 'path';
import { Position, TextDocument } from 'vscode-languageserver-protocol';
import { Process } from '../src/process';
import { projectPath } from './helpers';
import { TestCollection } from '../src/TestCollection';
import { TestRunner } from '../src/TestRunner';

describe('TestRunner', () => {
    const uri = _files.asUri(projectPath('tests/AssertionsTest.php'));

    let suites: TestCollection;
    let process: Process;
    let files: Filesystem;
    let testRunner: TestRunner;
    let textDocument: TextDocument;

    beforeEach(async () => {
        suites = await new TestCollection().load(projectPath(''));
        process = new Process();
        files = new Filesystem();
        testRunner = new TestRunner(suites, process, files);

        textDocument = TextDocument.create(
            uri.path,
            'php',
            1,
            await _files.get(uri.fsPath)
        );
    });

    it('run all', async () => {
        spyOn(files, 'findup').and.returnValues('phpunit');
        spyOn(process, 'run').and.returnValue('PHPUnit');

        expect(new String(await testRunner.run('all'))).toEqual('PHPUnit');
        // expect(files.findup).not.toBeCalledWith(['php']);
        expect(files.findup).toBeCalledWith(['vendor/bin/phpunit', 'phpunit']);
        expect(process.run).toBeCalledWith({
            title: 'PHPUnit LSP',
            command: 'phpunit',
            arguments: [],
        });
    });

    it('rerun', async () => {
        const position = Position.create(0, 0);
        spyOn(files, 'findup').and.returnValues('phpunit');
        spyOn(process, 'run').and.returnValue('PHPUnit');

        expect(
            new String(
                await testRunner.run(
                    'rerun',
                    textDocument,
                    Position.create(20, 0)
                )
            )
        ).toEqual('PHPUnit');

        expect(
            new String(await testRunner.rerun(textDocument, position))
        ).toEqual('PHPUnit');
        expect(files.findup).toBeCalledWith(['vendor/bin/phpunit', 'phpunit']);
        expect(process.run).toBeCalledWith({
            title: 'PHPUnit LSP',
            command: 'phpunit',
            arguments: [
                uri.fsPath,
                '--filter',
                '^.*::(test_passed|test_failed)( with data set .*)?$',
            ],
        });
    });

    it('run file', async () => {
        spyOn(files, 'findup').and.returnValues('phpunit');
        spyOn(process, 'run').and.returnValue('PHPUnit');

        expect(new String(await testRunner.run('file', textDocument))).toEqual(
            'PHPUnit'
        );
        expect(files.findup).toBeCalledWith(['vendor/bin/phpunit', 'phpunit']);
        expect(process.run).toBeCalledWith({
            title: 'PHPUnit LSP',
            command: 'phpunit',
            arguments: [uri.fsPath],
        });
    });

    it('run test at cursor', async () => {
        const position = Position.create(20, 0);
        spyOn(files, 'findup').and.returnValues('phpunit');
        spyOn(process, 'run').and.returnValue('PHPUnit');

        expect(
            new String(
                await testRunner.run('test-at-cursor', textDocument, position)
            )
        ).toEqual('PHPUnit');

        expect(files.findup).toBeCalledWith(['vendor/bin/phpunit', 'phpunit']);
        expect(process.run).toBeCalledWith({
            title: 'PHPUnit LSP',
            command: 'phpunit',
            arguments: [
                uri.fsPath,
                '--filter',
                '^.*::(test_passed|test_failed)( with data set .*)?$',
            ],
        });
    });

    it('run test-at-cursor when not found', async () => {
        const position = Position.create(7, 0);
        spyOn(files, 'findup').and.returnValues('phpunit');
        spyOn(process, 'run').and.returnValue('PHPUnit');

        expect(
            new String(
                await testRunner.run('test-at-cursor', textDocument, position)
            )
        ).toEqual('PHPUnit');

        expect(files.findup).toBeCalledWith(['vendor/bin/phpunit', 'phpunit']);
        expect(process.run).toBeCalledWith({
            title: 'PHPUnit LSP',
            command: 'phpunit',
            arguments: [uri.fsPath],
        });
    });

    it('custom php, phpunit, args', async () => {
        spyOn(files, 'findup').and.returnValues('phpunit');
        spyOn(process, 'run').and.returnValue('PHPUnit');

        testRunner
            .setPhpBinary('php')
            .setPhpUnitBinary('phpunit')
            .setArgs(['foo', 'bar']);

        expect(new String(await testRunner.run('all'))).toEqual('PHPUnit');
        expect(files.findup).not.toBeCalled();
        expect(process.run).toBeCalledWith({
            title: 'PHPUnit LSP',
            command: 'php',
            arguments: ['phpunit', 'foo', 'bar'],
        });
    });

    it('run directory', async () => {
        spyOn(files, 'findup').and.returnValues('phpunit');
        spyOn(process, 'run').and.returnValue('PHPUnit');

        expect(
            new String(await testRunner.run('directory', textDocument))
        ).toEqual('PHPUnit');
        expect(files.findup).toBeCalledWith(['vendor/bin/phpunit', 'phpunit']);
        expect(process.run).toBeCalledWith({
            title: 'PHPUnit LSP',
            command: 'phpunit',
            arguments: [dirname(uri.fsPath)],
        });
    });
});
