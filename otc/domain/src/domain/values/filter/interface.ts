import {ObligationType, EObligationTypeId} from '../../obligation-type/obligation-type';
import {z} from 'zod';
import {
    AEnhancedEnumFactory,
    AlgoDateValidator, AlgoMonoListValidator, AlgoMultiListValidator,
    CountriesUtils,
    ValidatorGroup, AlgoPercentageValidator
} from '@algonomia/ts-shared';
import {TSourceViewExt} from '../../sources/source-view/source-view';

export enum EOTCValuePriority {
    version = 'version',
    reliability = 'reliability'
}

export class OTCValuePriorityExt extends AEnhancedEnumFactory {
    static version = new OTCValuePriorityExt(EOTCValuePriority.version, 'ObligationDueDateDomain.ValuePriority.version');
    static reliability = new OTCValuePriorityExt(EOTCValuePriority.reliability, 'ObligationDueDateDomain.ValuePriority.reliability');

    private constructor(protected __id: EOTCValuePriority, readonly text: string) {
        super(__id);
    }

    get id() {
        return this.__id;
    }

    static getText(id: EOTCValuePriority): string {
        return (this.getByIdOrId(id) as OTCValuePriorityExt | undefined)?.text ?? id;
    }

    static getAllIds() {
        return (OTCValuePriorityExt.getAllAvailables() as OTCValuePriorityExt[]).map((x: OTCValuePriorityExt) => x.id);
    }
}

export interface IFilterValuesUI {
    minVersion?: Date | null,
    maxVersion?: Date | null,
    minReliability?: number | null,
    priority?: EOTCValuePriority | null,
    jurisdictions?: string[] | null,
    obligationTypeIds?: EObligationTypeId[] | null,
    sources?: TSourceViewExt[] | null
}

export function getFilterValuesValidator(sources: TSourceViewExt[]) {
    return new ValidatorGroup<IFilterValuesUI>({
        priority: new AlgoMonoListValidator({
            label: 'ObligationDueDateDomain.GlobalFilters.priority',
            list: OTCValuePriorityExt.getAllIds(),
            translate: true,
            textCallback: ((x: EOTCValuePriority) => OTCValuePriorityExt.getText(x)),
        }),
        minReliability: new AlgoPercentageValidator({label: 'ObligationDueDateDomain.GlobalFilters.minReliability'}),
        minVersion: new AlgoDateValidator({label: 'ObligationDueDateDomain.GlobalFilters.minVersion'}),
        maxVersion: new AlgoDateValidator({label: 'ObligationDueDateDomain.GlobalFilters.maxVersion'}),
        sources: new AlgoMultiListValidator({
            label: 'ObligationDueDateDomain.GlobalFilters.sources',
            list: sources,
            emptySelectionIsNull: true,
            translate: true,
            textCallback: ((x: TSourceViewExt) => x.source_name),
        }),
        jurisdictions: new AlgoMultiListValidator({
            label: 'ObligationDueDateDomain.GlobalFilters.jurisdictions',
            list: CountriesUtils.iso2List,
            emptySelectionIsNull: true,
            isCountryIso: true,
            translate: true
        }),
        obligationTypeIds: new AlgoMultiListValidator({
            label: 'ObligationDueDateDomain.GlobalFilters.obligationTypeIds',
            list: ObligationType.getAllMainIds(),
            emptySelectionIsNull: true,
            translate: true,
            textCallback: ((x: EObligationTypeId) => ObligationType.getText(x)),
        }),
    });
}

export interface IFilterValuesHttp {
    minVersion: string,
    maxVersion: string,
    minReliability: number,
    priority: EOTCValuePriority,
    jurisdictions: string[],
    obligationTypeIds: EObligationTypeId[],
    sourcesIds: number[]
}

export type TPartialFilterValueHTTP = Partial<IFilterValuesHttp>;

export const ZFilterValues: z.ZodType<TPartialFilterValueHTTP> = z.object({
    minVersion: z.string().regex(
        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        "Invalid date format. Expected YYYY-MM-DD"
    ).optional(),
    maxVersion: z.string().regex(
        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        "Invalid date format. Expected YYYY-MM-DD"
    ).optional(),
    minReliability: z.number().optional(),
    priority: z.nativeEnum(EOTCValuePriority).optional(),
    jurisdictions: z.array(z.string()).optional(),
    obligationTypeIds: z.array(z.nativeEnum(EObligationTypeId)).optional(),
    sourcesIds: z.array(z.number()).optional(),
});
