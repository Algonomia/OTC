import { DimensionsUtil } from './dimensions';

describe('DimensionsUtil', () => {
    describe('getAllDimensions', () => {
        it('returns an array', () => {
            const dimensions = DimensionsUtil.getAllDimensions();
            expect(Array.isArray(dimensions)).toBe(true);
        });

        it('returns objects with name, code, unit_list, and multiplier_list', () => {
            const dimensions = DimensionsUtil.getAllDimensions();
            dimensions.forEach(dim => {
                expect(dim).toHaveProperty('name');
                expect(dim).toHaveProperty('code');
                expect(dim).toHaveProperty('unit_list');
                expect(dim).toHaveProperty('multiplier_list');
                expect(Array.isArray(dim.unit_list)).toBe(true);
                expect(Array.isArray(dim.multiplier_list)).toBe(true);
            });
        });

        it('contains the None dimension', () => {
            const dimensions = DimensionsUtil.getAllDimensions();
            const none = dimensions.find(d => d.code === 'None');
            expect(none).toBeDefined();
            expect(none!.name).toBe('No dimension');
            expect(none!.unit_list).toEqual([]);
            expect(none!.multiplier_list).toEqual([]);
        });

        it('contains the rate dimension', () => {
            const dimensions = DimensionsUtil.getAllDimensions();
            const rate = dimensions.find(d => d.code === 'rate');
            expect(rate).toBeDefined();
            expect(rate!.name).toBe('Rate');
            expect(rate!.multiplier_list).toEqual([{code: '%', multiplier: 100}]);
        });

        it('contains the currency dimension with units and multipliers', () => {
            const dimensions = DimensionsUtil.getAllDimensions();
            const currency = dimensions.find(d => d.code === 'currency');
            expect(currency).toBeDefined();
            expect(currency!.name).toBe('Financial Value');
            expect(currency!.unit_list.length).toBeGreaterThan(0);
            expect(currency!.multiplier_list.length).toBe(3);
        });

        it('has currency multipliers for k, M, and B', () => {
            const dimensions = DimensionsUtil.getAllDimensions();
            const currency = dimensions.find(d => d.code === 'currency')!;
            const codes = currency.multiplier_list.map(m => m.code);
            expect(codes).toEqual(['k', 'M', 'B']);
        });

    });
});
