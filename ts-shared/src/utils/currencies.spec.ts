import {CurrenciesUtil} from './currencies';

describe('CurrenciesUtil', () => {
    describe('getAllCurrencies', () => {
        it('should_return_non_empty_array', () => {
            const currencies = CurrenciesUtil.getAllCurrencies();
            expect(currencies.length).toBeGreaterThan(0);
        });

        it('should_contain_common_currencies', () => {
            const currencies = CurrenciesUtil.getAllCurrencies();
            const codes = currencies.map(c => c.code);
            expect(codes).toContain('USD');
            expect(codes).toContain('EUR');
            expect(codes).toContain('GBP');
            expect(codes).toContain('JPY');
        });

        it('should_return_objects_with_code_symbol_and_name', () => {
            const currencies = CurrenciesUtil.getAllCurrencies();
            const usd = currencies.find(c => c.code === 'USD');
            expect(usd).toEqual({code: 'USD', symbol: '$', name: 'United States Dollar'});
        });

        it('should_return_new_array_on_each_call', () => {
            const first = CurrenciesUtil.getAllCurrencies();
            const second = CurrenciesUtil.getAllCurrencies();
            expect(first).not.toBe(second);
        });

        it('should_return_copies_of_currency_objects_not_references', () => {
            const first = CurrenciesUtil.getAllCurrencies();
            const second = CurrenciesUtil.getAllCurrencies();
            expect(first[0]).toEqual(second[0]);
            expect(first[0]).not.toBe(second[0]);
        });
    });
});
