import {AEnhancedEnumFactory} from '../ts-templates/enhanced-enum-factory.abstract';

export enum EMonth {
    January = 1, February = 2, March = 3, April = 4, May = 5, June = 6, July = 7, August = 8,
    September = 9, October = 10, November = 11, December = 12,
}

export class EMonthExt extends AEnhancedEnumFactory {
    static january = new EMonthExt(EMonth.January, 'Shared.Months.January', 31);
    static february = new EMonthExt(EMonth.February, 'Shared.Months.February', 28);
    static march = new EMonthExt(EMonth.March, 'Shared.Months.March', 31);
    static april = new EMonthExt(EMonth.April, 'Shared.Months.April', 30);
    static may = new EMonthExt(EMonth.May, 'Shared.Months.May', 31);
    static june = new EMonthExt(EMonth.June, 'Shared.Months.June', 30);
    static july = new EMonthExt(EMonth.July, 'Shared.Months.July', 31);
    static august = new EMonthExt(EMonth.August, 'Shared.Months.August', 31);
    static september = new EMonthExt(EMonth.September, 'Shared.Months.September', 30);
    static october = new EMonthExt(EMonth.October, 'Shared.Months.October', 31);
    static november = new EMonthExt(EMonth.November, 'Shared.Months.November', 30);
    static december = new EMonthExt(EMonth.December, 'Shared.Months.December', 31);

    static getAllIds(): EMonth[] {
        return (this.getAllAvailables() as EMonthExt[]).map(x => x.id as EMonth);
    }

    static getMaxDayFromId(id?: EMonth) {
        const nDays = this.getNDayFromId(id);
        return !nDays ? 31 : nDays;
    }

    static getNDayFromId(id?: EMonth) {
        const month = this.getById(id) as EMonthExt | undefined;
        return month?.nDays ?? 0;
    }

    static getTitleFromId(id: EMonth) {
        const month = this.getById(id) as EMonthExt | undefined;
        return month?.title ?? '';
    }

    private constructor(id: EMonth, readonly title: string, readonly nDays: number) {
        super(id);
    }
}
