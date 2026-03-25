import {EBaseTypes, IScope, ITag} from '@algonomia/ts-shared';

export namespace OTCTagUtils {
    const _DEADLINE_OTC_TAG_LIST: ITag[] = [
        {expected_type: EBaseTypes.Date, code: 'deadline.fiscal_year_start', viewValue: 'Fiscal Year Start'},
        {expected_type: EBaseTypes.Date, code: 'deadline.fiscal_year_end', viewValue: 'Fiscal Year End'},
        {expected_type: EBaseTypes.Date, code: 'deadline.reference_year', viewValue: 'Reference year'},
        {expected_type: EBaseTypes.Date, code: 'deadline.cit_return_due_date', viewValue: 'CIT Return Due Date'},
        {expected_type: EBaseTypes.Date, code: 'deadline.request_date', viewValue: 'Request Date'},
        {expected_type: EBaseTypes.Date, code: 'deadline.tax_audit_date', viewValue: 'Tax Audit Date'},
        {expected_type: EBaseTypes.Date, code: 'deadline.payment_due_date', viewValue: 'Payment Due Date'}
    ];

    const _THRESHOLD_PENALTY_OTC_TAG_LIST: ITag[] = [
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.revenue', viewValue: 'Revenue'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.transaction_volume_amount', viewValue: 'Transaction Volume Amount'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.balance_sheet_total_assets', viewValue: 'Balance Sheet Total Assets'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.profit_margin', viewValue: 'Profit Margin'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.employee_count', viewValue: 'Employee Count'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.ownership_percentage', viewValue: 'Ownership Percentage'},
        {expected_type: EBaseTypes.String, code: 'threshold_penalty.entity_type', viewValue: 'Entity Type'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.unpaid_tax_amount', viewValue: 'Unpaid Tax Amount'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.tp_adjustment_amount', viewValue: 'TP Adjustment Amount'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.number_of_errors', viewValue: 'Number of Errors'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.number_of_days', viewValue: 'Number of Days'},
        {expected_type: EBaseTypes.Numeric, code: 'threshold_penalty.number_of_months', viewValue: 'Number of Months'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.not_submitted_on_time', viewValue: 'Not Submitted on Time'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.failure_to_submit', viewValue: 'Failure to Submit'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.incomplete_documentation', viewValue: 'Incomplete Documentation'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.has_errors_or_omissions', viewValue: 'Has Errors or Omissions'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.failure_to_maintain_documentation', viewValue: 'Failure to Maintain Documentation'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.failure_to_provide_upon_request', viewValue: 'Failure to Provide Upon Request'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.repeat_offense', viewValue: 'Repeat Offense'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.willful_misconduct', viewValue: 'Willful Misconduct'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.fraud', viewValue: 'Fraud'},
        {expected_type: EBaseTypes.Boolean, code: 'threshold_penalty.has_documentation', viewValue: 'Has Documentation'}
    ];

    const _OTC_SCOPE_LIST: IScope[] = [
        {code: 'entity', viewValue: 'Entity'},
        {code: 'jurisdiction', viewValue: 'Jurisdiction'},
        {code: 'group', viewValue: 'Group'},
        {code: 'child_entity', viewValue: 'Child entity'},
        {code: 'parent_entity', viewValue: 'Parent entity'},
        {code: 'ultimate_parent_entity', viewValue: 'Ultimate parent entity'},
        {code: 'rpt_entity', viewValue: 'Related party transaction entity'}
    ];

    export function getThresholdPenaltyOTCTags() {
        return [..._THRESHOLD_PENALTY_OTC_TAG_LIST];
    }

    export function getDeadlineOTCTags() {
        return [..._DEADLINE_OTC_TAG_LIST];
    }

    export function getOTCScopes() {
        return [..._OTC_SCOPE_LIST];
    }
}
