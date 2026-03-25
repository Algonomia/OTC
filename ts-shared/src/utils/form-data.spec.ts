import { FormDataUtils } from './form-data';

describe('FormDataUtils', () => {
    describe('toFormData', () => {
        it('converts simple key-value pairs to FormData', () => {
            const result = FormDataUtils.toFormData({ name: 'test', value: '123' });
            expect(result.get('name')).toBe('test');
            expect(result.get('value')).toBe('123');
        });

        it('appends each array element individually', () => {
            const result = FormDataUtils.toFormData({ tags: ['a', 'b', 'c'] });
            expect(result.getAll('tags')).toEqual(['a', 'b', 'c']);
        });

        it('skips null values', () => {
            const result = FormDataUtils.toFormData({ a: 'keep', b: null });
            expect(result.get('a')).toBe('keep');
            expect(result.get('b')).toBeNull();
        });

        it('skips undefined values', () => {
            const result = FormDataUtils.toFormData({ a: 'keep', b: undefined });
            expect(result.get('a')).toBe('keep');
            expect(result.get('b')).toBeNull();
        });

        it('returns empty FormData for empty object', () => {
            const result = FormDataUtils.toFormData({});
            expect(Array.from((result as any).keys())).toEqual([]);
        });

    });
});
