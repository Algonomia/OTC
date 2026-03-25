import {AGrouper, AGroupByKeys} from './grouper.abstract';

interface TestLine { category: string; region: string; value: number; }

class TestGrouper extends AGrouper<TestLine, string, string> {
    protected __getKeys(line: TestLine) { return [line.category]; }
    protected __getGrouping(line: TestLine) { return line.category.toUpperCase(); }
}

class TestGroupByKeys extends AGroupByKeys<TestLine> {
    protected __groupByKeys: (keyof TestLine)[] = ['category', 'region'];
}

describe('AGrouper', () => {
    let grouper: TestGrouper;

    beforeEach(() => {
        grouper = new TestGrouper();
    });

    describe('group', () => {
        it('groups lines by key', () => {
            const lines: TestLine[] = [
                {category: 'a', region: 'us', value: 1},
                {category: 'b', region: 'eu', value: 2},
                {category: 'a', region: 'eu', value: 3},
            ];
            const result = grouper.group(lines);
            expect(result).toHaveLength(2);
            expect(result[0][0]).toBe('A');
            expect(result[0][1]).toEqual([
                {category: 'a', region: 'us', value: 1},
                {category: 'a', region: 'eu', value: 3},
            ]);
            expect(result[1][0]).toBe('B');
            expect(result[1][1]).toEqual([{category: 'b', region: 'eu', value: 2}]);
        });

        it('returns empty array for empty input', () => {
            expect(grouper.group([])).toEqual([]);
        });

        it('returns single group when all lines share the same key', () => {
            const lines: TestLine[] = [
                {category: 'x', region: 'us', value: 1},
                {category: 'x', region: 'eu', value: 2},
            ];
            const result = grouper.group(lines);
            expect(result).toHaveLength(1);
            expect(result[0][1]).toHaveLength(2);
        });
    });
});

describe('AGroupByKeys', () => {
    let grouper: TestGroupByKeys;

    beforeEach(() => {
        grouper = new TestGroupByKeys();
    });

    describe('group', () => {
        it('groups by composite key (category + region)', () => {
            const lines: TestLine[] = [
                {category: 'a', region: 'us', value: 1},
                {category: 'a', region: 'eu', value: 2},
                {category: 'a', region: 'us', value: 3},
            ];
            const result = grouper.group(lines);
            expect(result).toHaveLength(2);
            expect(result[0][0]).toEqual({category: 'a', region: 'us'});
            expect(result[0][1]).toHaveLength(2);
            expect(result[1][0]).toEqual({category: 'a', region: 'eu'});
            expect(result[1][1]).toHaveLength(1);
        });

        it('each unique key combo produces a separate group', () => {
            const lines: TestLine[] = [
                {category: 'a', region: 'us', value: 1},
                {category: 'b', region: 'us', value: 2},
                {category: 'a', region: 'eu', value: 3},
            ];
            const result = grouper.group(lines);
            expect(result).toHaveLength(3);
        });
    });
});
