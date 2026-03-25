import {AEnhancedEnumFactory} from '../ts-templates/enhanced-enum-factory.abstract';

export enum EDayCountType {
    Default = 'Default',
    CalendarDays = 'CalendarDays',
    WeekDays = 'WeekDays',
    BusinessDays = 'BusinessDays'
}

export class EDayCountTypeExt extends AEnhancedEnumFactory {
    static default = new EDayCountTypeExt(EDayCountType.Default, 'Shared.DayCountType.Default', 'Default');
    static calendarDays = new EDayCountTypeExt(EDayCountType.CalendarDays, 'Shared.DayCountType.CalendarDays', 'Calendar days');
    static weekDays = new EDayCountTypeExt(EDayCountType.WeekDays, 'Shared.DayCountType.WeekDays', 'Week days');
    static businessDays = new EDayCountTypeExt(EDayCountType.BusinessDays, 'Shared.DayCountType.BusinessDays', 'Business days');

    static getAllIds(): EDayCountType[] {
        return (this.getAllAvailables() as EDayCountTypeExt[]).map(x => x.id as EDayCountType);
    }

    static getTitleFromId(id: EDayCountType) {
        const dayCountType = this.getById(id) as EDayCountTypeExt | undefined;
        return dayCountType?.title ?? id ?? '';
    }

    static getTmpTitleFromId(id: EDayCountType) {
        const dayCountType = this.getById(id) as EDayCountTypeExt | undefined;
        return dayCountType?.tmpTitle ?? id ?? '';
    }

    private constructor(_id: EDayCountType, readonly title = '', readonly tmpTitle = '') {
        super(_id);
    }
}
