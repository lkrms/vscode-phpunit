import { fixturePath, projectPath } from './helpers';
import { ProblemMatcher, Status } from '../src/TestResponse';
import { readFileSync } from 'fs';

describe('ProblemMatcher', () => {
    const scheme = 'file';
    const file = fixturePath('test-result.txt').fsPath;
    const testFile = projectPath('tests/AssertionsTest.php').toString();
    const contents: string = readFileSync(file).toString('UTF-8');
    const problemMatcher = new ProblemMatcher();

    let problems: any[] = [];

    function getProblem(id: string) {
        return problems.find(problem => problem.id.indexOf(id) !== -1);
    }

    beforeEach(async () => {
        problems = await problemMatcher.parse(contents);
    });

    it('test_isnt_same', () => {
        const problem = getProblem('AssertionsTest::test_isnt_same');

        expect(problem).toEqual({
            id: 'Recca0120\\VSCode\\Tests\\AssertionsTest::test_isnt_same',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'AssertionsTest',
            method: 'test_isnt_same',
            status: Status.FAILURE,
            uri: testFile.toString(),
            range: {
                end: { character: 76, line: 26 },
                start: { character: 8, line: 26 },
            },
            message: jasmine.anything(),
            files: [],
        });

        expect(problem.message)
            .toContain(`Failed asserting that two arrays are identical.
--- Expected
+++ Actual
@@ @@
 Array &0 (
-    'a' => 'b'
-    'c' => 'd'
+    'e' => 'f'
+    0 => 'g'
+    1 => 'h'
 )
`);
    });

    it('addition_provider', () => {
        const problem = getProblem('AssertionsTest::addition_provider');

        expect(problem).toEqual({
            id:
                'Recca0120\\VSCode\\Tests\\AssertionsTest::addition_provider with data set #2 (1, 0, 2)',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'AssertionsTest',
            method: 'addition_provider',
            status: Status.FAILURE,
            uri: testFile,
            range: {
                end: { character: 48, line: 58 },
                start: { character: 8, line: 58 },
            },
            message: jasmine.anything(),
            files: [],
        });

        expect(problem.message).toContain(
            `Failed asserting that 1 matches expected 2.`
        );
    });

    it('test_failed', () => {
        const problem = getProblem('AssertionsTest::test_failed');

        expect(problem).toEqual({
            id: 'Recca0120\\VSCode\\Tests\\AssertionsTest::test_failed',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'AssertionsTest',
            method: 'test_failed',
            status: Status.FAILURE,
            uri: testFile,
            range: {
                end: { character: 33, line: 21 },
                start: { character: 8, line: 21 },
            },
            message: jasmine.anything(),
            files: [],
        });

        expect(problem.message).toContain(
            'Failed asserting that false is true.'
        );
    });

    it('test_risky', () => {
        const problem = getProblem('AssertionsTest::test_risky');

        expect(problem).toEqual({
            id: 'Recca0120\\VSCode\\Tests\\AssertionsTest::test_risky',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'AssertionsTest',
            method: 'test_risky',
            status: Status.RISKY,
            uri: testFile,
            range: {
                end: { character: 32, line: 29 },
                start: { character: 4, line: 29 },
            },
            message: jasmine.anything(),
            files: [],
        });

        expect(problem.message).toContain(
            'This test did not perform any assertions'
        );
    });

    it('test_incomplete', () => {
        const problem = getProblem('AssertionsTest::test_incomplete');

        expect(problem).toEqual({
            id: 'Recca0120\\VSCode\\Tests\\AssertionsTest::test_incomplete',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'AssertionsTest',
            method: 'test_incomplete',
            status: Status.INCOMPLETE,
            uri: testFile,
            range: {
                end: { character: 77, line: 49 },
                start: { character: 8, line: 49 },
            },
            message: jasmine.anything(),
            files: [],
        });

        expect(problem.message).toContain(
            'This test has not been implemented yet.'
        );
    });

    it('test_skipped', () => {
        const problem = getProblem('AssertionsTest::test_skipped');

        expect(problem).toEqual({
            id: 'Recca0120\\VSCode\\Tests\\AssertionsTest::test_skipped',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'AssertionsTest',
            method: 'test_skipped',
            status: Status.SKIPPED,
            uri: testFile,
            range: {
                end: { character: 73, line: 44 },
                start: { character: 8, line: 44 },
            },
            message: jasmine.anything(),
            files: [],
        });

        expect(problem.message).toContain(
            'The MySQLi extension is not available.'
        );
    });

    it('test_sum_item_method_not_call', () => {
        const problem = getProblem(
            'CalculatorTest::test_sum_item_method_not_call'
        );

        expect(problem).toEqual({
            id:
                'Recca0120\\VSCode\\Tests\\CalculatorTest::test_sum_item_method_not_call',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'CalculatorTest',
            method: 'test_sum_item_method_not_call',
            status: Status.FAILURE,
            uri: projectPath(
                'vendor/mockery/mockery/library/Mockery/Adapter/Phpunit/MockeryPHPUnitIntegrationAssertPostConditionsForV8.php'
            )
                .with({ scheme })
                .toString(),
            range: {
                end: { character: 45, line: 28 },
                start: { character: 8, line: 28 },
            },
            message: jasmine.anything(),
            files: jasmine.anything(),
        });

        expect(problem.message).toContain(
            `Mockery\\Exception\\InvalidCountException: Method test(<Any Arguments>) from Mockery_0_Recca0120_VSCode_Item_Recca0120_VSCode_Item should be called
 exactly 1 times but called 0 times.`
        );
    });

    it('test_throw_exception', () => {
        const problem = getProblem('CalculatorTest::test_throw_exception');

        expect(problem).toEqual({
            id:
                'Recca0120\\VSCode\\Tests\\CalculatorTest::test_throw_exception',
            namespace: 'Recca0120\\VSCode\\Tests',
            class: 'CalculatorTest',
            method: 'test_throw_exception',
            status: Status.FAILURE,
            uri: projectPath('tests/CalculatorTest.php')
                .with({ scheme })
                .toString(),
            range: {
                end: { character: 38, line: 53 },
                start: { character: 8, line: 53 },
            },
            message: jasmine.anything(),
            files: jasmine.anything(),
        });

        expect(problem.message).toContain('Exception:');
    });
});
