import {TValueLine} from '../interface';
import {Indicator, EIndicatorId} from '../../indicators/interfaces/interfaces';
import {ObligationType} from '../../obligation-type/obligation-type';
import {ArrayUtils, NumberUtils} from '@algonomia/ts-shared';

export interface ICountryBadge {
    iso2: string,
    completion: number,
    obligations: string[]
}

export namespace OtcFullLineCompletion {
    const _indicators: Indicator[] = Indicator.getAllAvailables() as Indicator[];
    const _nIndicators = _indicators.length;
    const _nObligations = (ObligationType.getAllAvailables() as ObligationType[]).length;
    const _nCellByCountry = _nIndicators * _nObligations;

    export function getOverallCompletion(valueLines: TValueLine[]) {
        const respondedCell = new Set();
        const jurisdictions = new Set();
        valueLines.forEach(line => {
            const lineJurisdiction = line.jurisdiction;
            jurisdictions.add(lineJurisdiction);
            const obligationType = line.obligation_type_id;
            for (const indicator of _indicators) {
                if (line.hasOwnProperty(indicator.id) && !!line[indicator.id as EIndicatorId]) {
                    respondedCell.add([lineJurisdiction, obligationType, indicator.id].join('$$$$'));
                }
            }
        });
        const nCellsOverall = jurisdictions.size * _nCellByCountry;
        const completion = respondedCell.size / nCellsOverall;
        return NumberUtils.toFixedNumber(100 * completion, 2);
    }

    export function getCountryBadges(
        iso2Values: [string, TValueLine[]][], limit: number = 10
    ): ICountryBadge[] {
        return iso2Values.map(([iso2, lines]) => {
            return {
                iso2: iso2,
                completion: NumberUtils.toFixedNumber(
                    100 * getCountryCompletion(lines, iso2), 2
                ),
                obligations: ArrayUtils.uniqueValues(lines, (x => x.obligation_type_id))?.map(
                    x => ObligationType.getText(x)
                )
            }
        }).sort(
            (a, b) => b.completion - a.completion
        ).slice(0, limit);
    }

    export function getCountryCompletion(valueLines: TValueLine[], iso2: string) {
        const respondedCell = new Set();
        valueLines.forEach(line => {
            if (line.jurisdiction !== iso2) {
                return;
            }
            const obligationType = line.obligation_type_id;
            for (const indicator of _indicators) {
                if (line.hasOwnProperty(indicator.id) && !!line[indicator.id as EIndicatorId]) {
                    respondedCell.add([obligationType, indicator.id].join('$$$$'));
                }
            }
        });
        return respondedCell.size / _nCellByCountry;
    }
}
