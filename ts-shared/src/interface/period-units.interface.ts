import {AEnhancedEnumFactory} from '../ts-templates/enhanced-enum-factory.abstract';

export enum EPeriodUnit {
    Days = 'Days',
    Weeks = 'Weeks',
    Months = 'Months',
    Years = 'Years'
}

export class EPeriodUnitExt extends AEnhancedEnumFactory {
    static days = new EPeriodUnitExt(EPeriodUnit.Days, 'Shared.PeriodUnit.Days', 'Days');
    static weeks = new EPeriodUnitExt(EPeriodUnit.Weeks, 'Shared.PeriodUnit.Weeks', 'Weeks');
    static months = new EPeriodUnitExt(EPeriodUnit.Months, 'Shared.PeriodUnit.Months', 'Months');
    static years = new EPeriodUnitExt(EPeriodUnit.Years, 'Shared.PeriodUnit.Years', 'Years');

    static getAllIds(): EPeriodUnit[] {
        return (this.getAllAvailables() as EPeriodUnitExt[]).map(x => x.id as EPeriodUnit);
    }

    static getTitleFromId(id: EPeriodUnit) {
        const periodUnit = this.getById(id) as EPeriodUnitExt | undefined;
        return periodUnit?.title ?? id ?? '';
    }

    static getTmpTitleFromId(id: EPeriodUnit) {
        const periodUnit = this.getById(id) as EPeriodUnitExt | undefined;
        return periodUnit?.tmpTitle ?? id ?? '';
    }

    private constructor(_id: EPeriodUnit, readonly title = '', readonly tmpTitle = '') {
        super(_id);
    }
}
