import {TranslateService} from '@ngx-translate/core';
import {AppInjector} from '../../../injector';
import {
    AEnhancedEnumFactory,
    ComplexValueUtils,
    LanguagesUtils, NullUndefinedUtils
} from '@algonomia/ts-shared';
import {
    AlgoTableArrayTextComponent,
    AlgoTableColumnFilterType,
    AlgoTableColumns,
    AlgoTableIconTextComponent,
    AlgoTableUrlComponent,
    IAction,
    AlgoTableTruncatedTextComponent
} from '@algonomia/angular-sdk';
import {Type} from '@angular/core';
import {
    Indicator,
    EIndicatorId,
    TValueLine,
    FilingResponsibility,
    IsObligationInPlace,
    ApplicableEntityType,
    EApplicableEntityTypeId,
    ESubmissionMethodId,
    SubmissionMethod,
    ParentFilingExemption,
    EnglishAccepted,
    ScopeOfObligation, IOTCValue, OTCTagUtils, ObligationType
} from '@otc/domain';
import {AlgoTableParentFilingExemptionComponent} from './algo-table-parent-filing-exemption/algo-table-parent-filing-exemption.component';
import {ContributionModalComponent} from '../../contribution/contribution-modal/contribution-modal.component';
import {HistoryModalComponent} from '../history-modal/history-modal.component';
import {RateModalComponent} from '../../rate/rate-modal/rate-modal.component';
import {buildSortValue, mapArrayOrFallback, mapArrayToTexts} from '../../_column-helpers';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;

export class IndicatorColumns extends AEnhancedEnumFactory {
    static isObligationInPlace = new IndicatorColumns(
        EIndicatorId.IsObligationInPlace,
        'list',
        {baseValueGetter: x => IsObligationInPlace.getText(x) ?? x}
    );
    static scopeOfObligation = new IndicatorColumns(
        EIndicatorId.ScopeOfObligation,
        'list',
        {
            baseValueGetter: x => ScopeOfObligation.getText(x) ?? x,
            renderComponent: AlgoTableIconTextComponent,
            baseRenderInputs: (x?: any) => {
                const text = ScopeOfObligation.getText(x) ?? x;
                const icon = ScopeOfObligation.getIcon(x) ?? x;
                return {text, icon};
            },
        }
    );
    static filingResponsibility = new IndicatorColumns(
        EIndicatorId.FilingResponsibility,
        'list',
        {baseValueGetter: x => FilingResponsibility.getText(x) ?? x}
    );
    static parentFilingExemption = new IndicatorColumns(
        EIndicatorId.ParentFilingExemption,
        'boolean',
        {
            renderComponent: AlgoTableParentFilingExemptionComponent,
            baseRenderInputs: (x?: any) => {
                if (x !== true && x !== false) return {};
                return {parentFilingExemption: ParentFilingExemption.getFromBool(x)};
            }
        }
    );
    static applicableEntityTypes = new IndicatorColumns(
        EIndicatorId.ApplicableEntityTypes,
        'list',
        {
            baseValueGetter: (arr: EApplicableEntityTypeId[]) => {
                const translate = AppInjector.get(TranslateService);
                return mapArrayOrFallback(arr, x => translate.instant(ApplicableEntityType.getText(x)) ?? x);
            },
            renderComponent: AlgoTableArrayTextComponent,
            baseRenderInputs: (arr: EApplicableEntityTypeId[]) => {
                const translate = AppInjector.get(TranslateService);
                return mapArrayToTexts(arr, x => translate.instant(ApplicableEntityType.getText(x)) ?? x);
            }
        }
    );
    static submissionMethod = new IndicatorColumns(
        EIndicatorId.SubmissionMethod,
        'list',
        {
            baseValueGetter: (arr: ESubmissionMethodId[]) => {
                const translate = AppInjector.get(TranslateService);
                return mapArrayOrFallback(arr, x => translate.instant(SubmissionMethod.getText(x)) ?? x);
            },
            renderComponent: AlgoTableArrayTextComponent,
            baseRenderInputs: (arr: ESubmissionMethodId[]) => {
                const translate = AppInjector.get(TranslateService);
                return mapArrayToTexts(arr, x => translate.instant(SubmissionMethod.getText(x)) ?? x);
            }
        }
    );
    static submissionUrl = new IndicatorColumns(
        EIndicatorId.SubmissionURL,
        'text',
        {
            renderComponent: AlgoTableUrlComponent,
            baseRenderInputs: x => ({url: x})
        }
    );
    static localLanguage = new IndicatorColumns(
        EIndicatorId.LocalLanguage,
        'list',
        {
            baseValueGetter: arr => mapArrayOrFallback(arr, (x: string) => LanguagesUtils.getLanguageName(x)),
            renderComponent: AlgoTableArrayTextComponent,
            baseRenderInputs: arr => mapArrayToTexts(arr, (x: string) => LanguagesUtils.getLanguageName(x))
        }
    );
    static englishAccepted = new IndicatorColumns(
        EIndicatorId.EnglishAccepted,
        'list',
        {
            baseValueGetter: x => {
                const baseValue = x ?? undefined;
                return EnglishAccepted.getText(baseValue) ?? baseValue;
            }
        }
    );
    static penalty = new IndicatorColumns(
        EIndicatorId.Penalty,
        'text',
        {
            ...this._buildComplexValueOpts(OTCTagUtils.getThresholdPenaltyOTCTags, OTCTagUtils.getOTCScopes),
            renderComponent: AlgoTableTruncatedTextComponent,
        }
    );
    static thresholdFiling = new IndicatorColumns(
        EIndicatorId.ThresholdFiling,
        'text',
        {
            ...this._buildComplexValueOpts(OTCTagUtils.getThresholdPenaltyOTCTags, OTCTagUtils.getOTCScopes),
            renderComponent: AlgoTableTruncatedTextComponent,
        }
    );
    static thresholdPreparation = new IndicatorColumns(
        EIndicatorId.ThresholdPreparation,
        'text',
        {
            ...this._buildComplexValueOpts(OTCTagUtils.getThresholdPenaltyOTCTags, OTCTagUtils.getOTCScopes),
            renderComponent: AlgoTableTruncatedTextComponent,
        }
    );
    static deadlineFiling = new IndicatorColumns(
        EIndicatorId.DeadlineFiling,
        'text',
        {
            ...this._buildComplexValueOpts(OTCTagUtils.getDeadlineOTCTags, OTCTagUtils.getOTCScopes),
            renderComponent: AlgoTableTruncatedTextComponent,
        }
    );
    static deadlinePreparation = new IndicatorColumns(
        EIndicatorId.DeadlinePreparation,
        'text',
        {
            ...this._buildComplexValueOpts(OTCTagUtils.getDeadlineOTCTags, OTCTagUtils.getOTCScopes),
            renderComponent: AlgoTableTruncatedTextComponent,
        }
    );
    static deadlineExtension = new IndicatorColumns(
        EIndicatorId.DeadlineExtension,
        'text',
        {
            ...this._buildComplexValueOpts(OTCTagUtils.getDeadlineOTCTags, OTCTagUtils.getOTCScopes),
            renderComponent: AlgoTableTruncatedTextComponent,
        }
    );

    private static _buildComplexValueOpts(getTagList: () => any[], getScopeList: () => any[]) {
        return {
            baseValueGetter: (x: any) => {
                const baseValue = x ?? undefined;
                try {
                    return ComplexValueUtils.display(baseValue, getTagList(), getScopeList());
                } catch (e) {
                    return baseValue;
                }
            },
            baseRenderInputs: (x: any) => {
                const baseValue = x ?? undefined;
                let displayValue: any;
                try {
                    displayValue = ComplexValueUtils.display(baseValue, getTagList(), getScopeList());
                } catch (e) {
                    displayValue = baseValue;
                }
                return { displayValue };
            }
        };
    }

    static getColumnById(id: EIndicatorId) {
        const column: IndicatorColumns | undefined = this.getById(id) as IndicatorColumns | undefined;
        return column;
    }

    static getAllColumns(fetchSubobligations = false, fetchNotes = false, fetchRefs = false) {
        return (this.getAllAvailables() as IndicatorColumns[]).map((x: IndicatorColumns) => {
            const columns = [x.valueColumn];
            if (fetchSubobligations) {
                columns.push(...x.subObligationColumns);
            }
            if (fetchNotes) {
                columns.push(x.notesColumn);
            }
            if (fetchRefs) {
                columns.push(x.refsColumn);
            }
            return columns;
        }).flat();
    }

    readonly title: string;
    readonly refsTitle: string;
    readonly notesTitle: string;
    readonly filterType: AlgoTableColumnFilterType;
    readonly baseValueGetter: (x?: any) => any;
    readonly baseSortValue: (x?: any) => any | any[];
    readonly renderComponent?: Type<unknown>;
    readonly baseRenderInputs?: (data?: any) => Record<string, unknown>;
    readonly renderInputs: ((x: TValueLine) => Record<string, unknown>) | undefined;

    readonly baseNotesColumn: AlgoTableColumns<IOTCValue>;
    readonly notesColumn: AlgoTableColumns<TValueLine>;
    readonly baseRefsColumn: AlgoTableColumns<IOTCValue>;
    readonly refsColumn: AlgoTableColumns<TValueLine>;
    readonly baseColumn: AlgoTableColumns<IOTCValue>;
    readonly valueColumn: AlgoTableColumns<TValueLine>;
    readonly baseSubObligationColumns: AlgoTableColumns<IOTCValue>[];
    readonly subObligationColumns: AlgoTableColumns<TValueLine>[];

    private constructor(
        id: EIndicatorId,
        filterType: AlgoTableColumnFilterType,
        opts: {
            baseValueGetter?: (x?: any) => any;
            baseSortValue?: (x?: any) => any | any[];
            renderComponent?: Type<unknown>;
            baseRenderInputs?: (data?: any) => Record<string, unknown>;
        } = {}
    ) {
        super(id);
        this.filterType = filterType;
        this.title = Indicator.getText(id) ?? id;
        this.refsTitle = Indicator.getRefsText(id) ?? id;
        this.notesTitle = Indicator.getNotesText(id) ?? id;
        this.baseValueGetter = opts.baseValueGetter ?? (x => x);
        this.baseSortValue = opts.baseSortValue ?? buildSortValue(this.baseValueGetter, filterType, x => x);
        this.renderComponent = opts.renderComponent;
        this.baseRenderInputs = opts.baseRenderInputs;

        this.baseNotesColumn = {
            id: this.id + '_notes',
            title: this.notesTitle,
            valueGetter: this.baseNotesValueGetter,
            filterType: 'text',
            show: this.baseNotesShow
        };
        this.notesColumn = {
            id: this.id + '_notes',
            title: this.notesTitle,
            valueGetter: (x: TValueLine) => this.baseNotesValueGetter(x[this.id as EIndicatorId]),
            filterType: 'text',
            show: (data: TValueLine[]) => this.baseNotesShow(data?.map(x => x[this.id as EIndicatorId])),
            onClickCell: this.onClickCell
        };
        this.baseRefsColumn = {
            id: this.id + '_refs',
            title: this.refsTitle,
            valueGetter: this.baseRefValueGetter.bind(this),
            filterType: 'text',
            show: this.baseRefShow.bind(this)
        };
        this.refsColumn = {
            id: this.id + '_refs',
            title: this.refsTitle,
            valueGetter: ((x: TValueLine) => this.baseRefValueGetter(x[this.id as EIndicatorId])).bind(this),
            filterType: 'text',
            show: ((data: TValueLine[]) => this.baseRefShow(data?.map(x => x[this.id as EIndicatorId]))).bind(this),
            onClickCell: this.onClickCell
        };
        this.baseColumn = {
            id: this.id,
            title: this.title,
            valueGetter: (x: IOTCValue) => this.baseValueGetter(x?.value),
            sortValue: (x: IOTCValue) => this.baseSortValue(x?.value),
            renderComponent: this.renderComponent,
            renderInputs: this.baseRenderInputs ? ((x: IOTCValue) => this.baseRenderInputs!(x?.value)) : undefined,
            filterType: this.filterType
        };
        this.valueColumn = {
            id: this.id,
            title: this.title,
            valueGetter: (x: TValueLine) => this.baseValueGetter(x[this.id as EIndicatorId]?.value),
            sortValue: (x: TValueLine) => this.baseSortValue(x[this.id as EIndicatorId]?.value),
            renderComponent: this.renderComponent,
            renderInputs: this.baseRenderInputs ? ((x: TValueLine) => this.baseRenderInputs!(x[this.id as EIndicatorId]?.value)) : undefined,
            filterType: this.filterType,
            onClickCell: this.onClickCell
        };

        const dueDateColumn = ObligationType.getAllSubObligations();
        this.baseSubObligationColumns = dueDateColumn.map(subObligation => ({
            id: `${this.id}_sub_${subObligation.id}`,
            title: [this.title, subObligation.text],
            valueGetter: ((x: IOTCValue) => this.baseValueGetter!(x?.additional_values?.[subObligation.id])).bind(this),
            sortValue: (x: IOTCValue) => this.baseSortValue(x?.additional_values?.[subObligation.id]),
            renderComponent: this.renderComponent,
            renderInputs: !this.baseRenderInputs ? undefined : ((x: IOTCValue) => this.baseRenderInputs!(x?.additional_values?.[subObligation.id])).bind(this),
            filterType: this.filterType,
            show: ((data: IOTCValue[]) => data?.some(x => {
                const value = x?.additional_values?.[subObligation.id];
                return value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
            }) ?? false).bind(this),
        }));
        this.subObligationColumns = dueDateColumn.map(subObligation => ({
            id: `${this.id}_sub_${subObligation.id}`,
            title: [this.title, subObligation.text],
            valueGetter: ((x: TValueLine) => this.baseValueGetter!(x[this.id as EIndicatorId]?.additional_values?.[subObligation.id])).bind(this),
            sortValue: (x: TValueLine) => this.baseSortValue!(
                x[this.id as EIndicatorId]?.additional_values?.[subObligation.id]
            ),
            renderComponent: this.renderComponent,
            renderInputs: !this.baseRenderInputs ? undefined : ((x: TValueLine) => this.baseRenderInputs!(x[this.id as EIndicatorId]?.additional_values?.[subObligation.id])).bind(this),
            filterType: this.filterType,
            show: ((data: TValueLine[]) => data?.some(x => {
                const value = x[this.id as EIndicatorId]?.additional_values?.[subObligation.id];
                return value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
            }) ?? false).bind(this),
            onClickCell: this.onClickCell
        }));

        this.renderInputs = !this.baseRenderInputs ? undefined : ((x: TValueLine) => {
            return this.baseRenderInputs!(x[this.id as EIndicatorId]);
        }).bind(this);
    }

    baseNotesValueGetter(x?: IOTCValue) {
        return x?.notes;
    }

    baseNotesShow(data?: (IOTCValue | undefined)[]) {
        return data?.some(x => !!x?.notes) ?? false;
    }

    baseRefValueGetter(x?: IOTCValue) {
        return x?.reference;
    }

    baseRefShow(data?: (IOTCValue | undefined)[]) {
        return data?.some(x => !!x?.reference) ?? false;
    }

    private __valueExistsCallback = ((valueLine: TValueLine) => !isNullOrUndefined(valueLine[this.id as EIndicatorId])).bind(this);
    onClickCell: IAction<[TValueLine]>[] = [{
        title: 'OTCFront.ObligationDueDate.actions.SuggestValue',
        callback: ((valueLine: TValueLine) => {
            const jurisdiction = valueLine.jurisdiction;
            const obligation_type = valueLine.obligation_type_id;
            ContributionModalComponent.openFromExistingResponse(
                jurisdiction,
                obligation_type,
                this.id as EIndicatorId,
                valueLine[this.id as EIndicatorId] ?? {}
            );
        }).bind(this)
    }, {
        title: 'OTCFront.ObligationDueDate.actions.ShowHistory',
        callback: ((valueLine: TValueLine) => {
            const jurisdiction = valueLine.jurisdiction;
            const obligation_type = valueLine.obligation_type_id;
            HistoryModalComponent.open({
                obligation_type_id: obligation_type,
                jurisdiction: jurisdiction,
                key: this.id as EIndicatorId
            });
        }).bind(this),
        condition: this.__valueExistsCallback
    }, {
        title: 'OTCFront.ObligationDueDate.actions.RateThisValue',
        callback: ((valueLine: TValueLine) => {
            const value = valueLine[this.id as EIndicatorId];
            if (!value) return;
            const id = value!.id;
            const type = value!.type;
            RateModalComponent.open({id, type});
        }).bind(this),
        condition: this.__valueExistsCallback
    }];
}
