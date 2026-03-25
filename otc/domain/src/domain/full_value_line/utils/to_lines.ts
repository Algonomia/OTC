import {ArrayUtils, AGrouper, DateUtils} from '@algonomia/ts-shared';
import {TOTCDatum} from '../../values/otc-value';
import {IOTCBaseSegment} from '../../segmentations/interface';
import {TValueLine} from '../interface';
import {EIndicatorId} from '../../indicators/interfaces/interfaces';

export class OTCDataToLine extends AGrouper<TOTCDatum, TOTCDatum[keyof TOTCDatum], IOTCBaseSegment> {
    private static _singleton = new OTCDataToLine();
    static toLines(data: TOTCDatum[]) {
        return this._singleton.toLines(data);
    }

    private constructor() {
        super();
    }

    protected __getKeys(datum: TOTCDatum): TOTCDatum[keyof TOTCDatum][] {
        return [datum.jurisdiction, datum.obligation_type_id];
    }

    protected __getGrouping(datum: TOTCDatum): IOTCBaseSegment {
        return {
            jurisdiction: datum.jurisdiction,
            obligation_type_id: datum.obligation_type_id
        }
    }

    toLines(data: TOTCDatum[]): TValueLine[] {
        const segmentedDatum = this.group(data);
        return segmentedDatum.map(x => {
            const segment = x[0];
            const lineData = x[1];
            const sortedLineData = ArrayUtils.convertThenSortWithArrays(
                lineData, ((x: TOTCDatum) => [DateUtils.stdStringToDate(x.version), x.type === 'from_user', x.id]), -1
            );
            const line: TValueLine = {...segment};
            sortedLineData.forEach(x => {
                if (!line.hasOwnProperty(x.key)) {
                    line[x.key as EIndicatorId] = {
                        value: x.value,
                        notes: x.notes,
                        reference: x.reference,
                        additional_values: x.additional_values,
                        id: x.id,
                        type: x.type
                    };
                }
            });
            return line;
        });
    }
}
