import {AGrouper} from '@algonomia/ts-shared';
import {TValueLine} from '../interface';

export class OTCSegmentLinesByCountry extends AGrouper<TValueLine, TValueLine[keyof TValueLine], string> {
    private static _singleton = new OTCSegmentLinesByCountry()
    static toCountrySegmentation(lines: TValueLine[]) {
        return this._singleton.group(lines);
    }

    private constructor() {
        super();
    }

    protected __getKeys(line: TValueLine): TValueLine[keyof TValueLine][] {
        return [line.jurisdiction];
    }

    protected __getGrouping(line: TValueLine): string {
        return line.jurisdiction
    }
}
