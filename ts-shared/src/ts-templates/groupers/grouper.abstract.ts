export abstract class AGrouper<I, K, O> {
    protected abstract __getGrouping(line: I): O;
    protected abstract __getKeys(line: I): K[];

    group(lines: I[]): [O, I[]][] {
        const mapKeyToGroupAndLines = new Map<string, [O, I[]]>();
        lines.forEach(line => {
            const key = this.__getKeys(line).map(x => {
                const toString = String(x);
                return `${toString.length}:${toString}`;
            }).join('');
            const groupAndLines = mapKeyToGroupAndLines.get(key);
            if (groupAndLines === undefined) {
                const grouping = this.__getGrouping(line);
                mapKeyToGroupAndLines.set(key, [grouping, [line]]);
            } else {
                const groupedLines = groupAndLines[1];
                groupedLines.push(line);
            }
        });
        return Array.from(mapKeyToGroupAndLines.values());
    }
}

export abstract class AGroupByKeys<I> extends AGrouper<I, I[keyof I], Partial<I>> {
    protected abstract __groupByKeys: (keyof I)[];

    protected __getGrouping(line: I): Partial<I> {
        const grouping: Partial<I> = {};
        this.__groupByKeys.forEach(k => {
            grouping[k] = line[k];
        });
        return grouping;
    }

    protected __getKeys(line: I) {
        return this.__groupByKeys.map(k => {
            return line[k];
        });
    }
}
