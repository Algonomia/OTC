import { ExcelParsingUtils, STDCell } from '../excel-parsing';
import {
    ZApplicableEntityTypeIdSchema,
    ZEnglishAcceptedIdSchema, ZFilingResponsibilitySchema, ZIsObligationInPlaceSchema, EObligationTypeId,
    ZObligationTypeIdSchema, ZScopeOfObligationIdSchema,
    ESourceStatus,
    ESourceType,
    ESubmissionMethodId,
    ZSubmissionMethodIdSchema
} from '@otc/domain';
import {z} from 'zod';
import {LanguagesUtils, NullUndefinedUtils} from '@algonomia/ts-shared';

export namespace LongViewParsingUtils {
    import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
    const replaceJsonCallback = (x: STDCell) => {
        return ExcelParsingUtils.parseExcelCellToString(x)?.replaceAll('None', 'null')?.replaceAll('True', 'true')?.replaceAll('False', 'false') ?? '';
        /*return ExcelParsingUtils.parseExcelCellToString(x)?.replaceAll(`"id"`, `"operator_id"`)
            ?.replaceAll(`"type": "numeric"`, `"expected_type": "numeric"`)
            ?.replaceAll(`"type":"numeric"`, `"expected_type": "numeric"`)
            ?.replaceAll(`"type": "string"`, `"expected_type": "string"`)
            ?.replaceAll(`"type":"string"`, `"expected_type": "string"`)
            ?.replaceAll(`"type": "boolean"`, `"expected_type": "boolean"`)
            ?.replaceAll(`"type":"boolean"`, `"expected_type": "boolean"`)
            ?.replaceAll(`"type": "period"`, `"expected_type": "period"`)
            ?.replaceAll(`"type":"period"`, `"expected_type": "period"`);*/
    }

    const mapKeysToValidator = new Map<any, any>([
        ['ApplicableEntityTypes', {schema: ZApplicableEntityTypeIdSchema.array(), parse: ((x: string) => ExcelParsingUtils.parseExcelCellToStringArr(x)?.map(v => ExcelParsingUtils.parseExcelCellToEnum(v, ESubmissionMethodId) ?? v).filter(x => !!x && x !== 'N/A') ?? [])}],
        ['BaseDeadlineDescription', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, noteOf: 'DeadlineFiling'}],
        ['DateOfPublication', {schema: z.date(), parse: ExcelParsingUtils.parseExcelCellToDate}],
        // ['DateOfUpdate', {schema: z.date(), parse: ExcelParsingUtils.parseExcelCellToDate}],
        ['EnglishAccepted', {schema: ZEnglishAcceptedIdSchema, parse: ExcelParsingUtils.parseExcelCellToString}],
        ['EntityTypeDetails', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, noteOf: 'ApplicableEntityTypes'}],
        ['ExtensionDeadlineDescription', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, noteOf: 'DeadlineExtension'}],
        ['FilingResponsibility', {schema: ZFilingResponsibilitySchema, parse: ExcelParsingUtils.parseExcelCellToString}],
        ['IsObligationInPlace', {schema: ZIsObligationInPlaceSchema, parse: ExcelParsingUtils.parseExcelCellToString}],
        ['LanguageDetails', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, noteOf: 'LocalLanguage'}],
        ['LanguageReference', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, refOf: 'LocalLanguage'}],
        ['LocalLanguage', {schema: LanguagesUtils.LangStringSchema.array(), parse: ((x: any) => {
            return ExcelParsingUtils.parseExcelCellToStringArr(x)?.filter(x => x !== 'NA' && x !== 'N/A' && x !== undefined)
        })}],
        // ['LocalLanguage', {schema: z.string().array(), parse: ExcelParsingUtils.parseExcelCellToStringArr}],
        ['ParentFilingExemption', {schema: z.boolean(), parse: ((x: any) => ExcelParsingUtils.parseExcelCellToString(x) === 'Yes' ? true : false)}],
        ['PenaltyDescription', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, noteOf: 'Penalty'}],
        ['ReliabilityScore', {schema: z.number(), parse: ExcelParsingUtils.parseExcelCellToNumber}],
        ['ReliabilityScoreNotes', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString}],
        ['ScopeOfObligation', {schema: ZScopeOfObligationIdSchema, parse: ExcelParsingUtils.parseExcelCellToString}],
        ['SubmissionMethod', {schema: ZSubmissionMethodIdSchema.array(), parse: ((x: string) => ExcelParsingUtils.parseExcelCellToStringArr(x)?.map(v => ExcelParsingUtils.parseExcelCellToEnum(v, ESubmissionMethodId) ?? v).filter(x => !!x && x !== 'N/A') ?? [])}],
        ['SubmissionMethodDetails', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, noteOf: 'SubmissionMethod'}],
        ['SubmissionURL', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString}],
        ['ThresholdDescription', {schema: z.string(), parse: ExcelParsingUtils.parseExcelCellToString, noteOf: 'Threshold'}],
        ['DeadlinePreparation', {schema: z.any(), parse: replaceJsonCallback}],
        ['DeadlineExtension', {schema: z.any(), parse: replaceJsonCallback}],
        ['DeadlineFiling', {schema: z.any(), parse: replaceJsonCallback}],
        ['ThresholdPreparation', {schema: z.any(), parse: replaceJsonCallback}],
        ['ThresholdFiling', {schema: z.any(), parse: replaceJsonCallback}],
        ['Penalty', {schema: z.any(), parse: replaceJsonCallback}]
    ]);

    export async function getLongViewParsedLines(file: string) {
        const [sources_excel_Lines, values_excel_Lines]: [any[], any[]] = await Promise.all([
            ExcelParsingUtils.getExcelSheet(file, 'Sources'),
            ExcelParsingUtils.getExcelSheet(file, 'Values')
        ]);

        const valueLines: any[] = [];
        const sourceIdSet = new Set();
        values_excel_Lines.filter(x => {
            try {
                ZObligationTypeIdSchema.parse(x.obligation_type_id);
                return true;
            } catch (e) {
                return false;
            }
        }).forEach((line, idx) => {
            const parser = mapKeysToValidator.get(line.key)?.parse;
            let value = _toJson(parser(line.value));
            let additional_values = _toJson(replaceJsonCallback(line.additional_values).replace(/'/g, '"'));
            if (isNullOrUndefined(value) ||value === '') {
                value = null;
            }
            if (isNullOrUndefined(additional_values) ||additional_values === '') {
                additional_values = null;
            }
            sourceIdSet.add(line.source_id);
            valueLines.push({
                id: idx,
                Key: ExcelParsingUtils.parseExcelCellToString(line.key),
                Value: value,
                AdditionalValues: additional_values,
                Jurisdiction: ExcelParsingUtils.parseExcelCellToString(line.jurisdiction_iso2_code),
                ObligationType: ExcelParsingUtils.parseExcelCellToString(line.obligation_type_id) as EObligationTypeId,
                SourceId: ExcelParsingUtils.parseExcelCellToNumber(line.source_id),
                Version: ExcelParsingUtils.parseExcelCellToDate(line.version),
                Notes: ExcelParsingUtils.parseExcelCellToString(line.notes),
                TagNotes: ExcelParsingUtils.parseExcelCellToNumber(line.tag_notes),
                JudgeLLMScore: ExcelParsingUtils.parseExcelCellToNumber(line.judge_llm_score),
                JudgeLLMReasoning: "",
                Reference: ExcelParsingUtils.parseExcelCellToString(line.references)
            });
        });
        const filtred_source_lines = sources_excel_Lines.filter(x => sourceIdSet.has(x.source_id));
        const sourceLines = filtred_source_lines.map(x => ({
            id: ExcelParsingUtils.parseExcelCellToNumber(x.source_id),
            DateOfPublication: ExcelParsingUtils.parseExcelCellToDate(x.date_of_publication),
            SourceName: ExcelParsingUtils.parseExcelCellToString(x.name),
            Organization: ExcelParsingUtils.parseExcelCellToString(x.publisher),
            OrganizationTypeId: ExcelParsingUtils.parseExcelCellToString(x.type),
            Link: ExcelParsingUtils.parseExcelCellToString(x.url),
            SourceType: ESourceType.URL,
            Jurisdictions: Array.from(new Set(values_excel_Lines.filter(y => ExcelParsingUtils.parseExcelCellToNumber(y.source_id) === ExcelParsingUtils.parseExcelCellToNumber(x.source_id)).map(y => y.jurisdiction_iso2_code))),
            ObligationsTypeIds: Array.from(new Set(values_excel_Lines.filter(y => ExcelParsingUtils.parseExcelCellToNumber(y.source_id) === ExcelParsingUtils.parseExcelCellToNumber(x.source_id)).map(y => y.obligation_type_id))),
            Indicators: Array.from(new Set(values_excel_Lines.filter(y => ExcelParsingUtils.parseExcelCellToNumber(y.source_id) === ExcelParsingUtils.parseExcelCellToNumber(x.source_id)).map(y => y.key))),
            ProposerEmail: 'admin@algonomia.com',
            Status: ESourceStatus.WaitForScrapping,
            ProcessByAI: false
        })).filter(x => x.Jurisdictions.length > 0 && x.ObligationsTypeIds.length > 0);
        return {sourceLines, valueLines};
    }

    function _toJson(s: string) {
        try {
            return JSON.parse(s);
        } catch (e) {
            return s;
        }
    }
}

