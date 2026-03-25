import { AEnhancedEnumFactory } from './enhanced-enum-factory.abstract';

class EnhancedEnumFactoryMock extends AEnhancedEnumFactory {
    static fake1 = new EnhancedEnumFactoryMock('fake1', ['aaa']);
    static fake2 = new EnhancedEnumFactoryMock('fake2', ['aaa', 'bbb']);
    static fake3 = new EnhancedEnumFactoryMock('fake3', ['bbb']);
    static fake4 = new EnhancedEnumFactoryMock('fake4', ['aaa', 'ccc']);
    constructor(id: string, tags: string[] = []) { super(id, tags); }
}

describe('AEnhancedEnumFactory', () => {
    describe('getById', () => {
        it('should find an entry by its id', () => {
            const result = EnhancedEnumFactoryMock.getById('fake1');
            expect(result).toBeDefined();
            expect(result!.id).toBe('fake1');
        });

        it('should return undefined for unknown id', () => {
            expect(EnhancedEnumFactoryMock.getById('nonexistent')).toBeUndefined();
        });
    });

    describe('getByIdOrId', () => {
        it('should return the enhanced enum when it exists', () => {
            const result = EnhancedEnumFactoryMock.getByIdOrId('fake2');
            expect(result).toBeDefined();
            expect((result as EnhancedEnumFactoryMock).id).toBe('fake2');
        });

        it('should return the raw id when no enhanced enum matches', () => {
            expect(EnhancedEnumFactoryMock.getByIdOrId('unknown')).toBe('unknown');
        });
    });

    describe('getByTag', () => {
        it('should return all entries tagged with a given tag', () => {
            const results = EnhancedEnumFactoryMock.getByTag('aaa');
            const ids = results.map((x: any) => x.id);
            expect(ids).toEqual(expect.arrayContaining(['fake1', 'fake2', 'fake4']));
            expect(ids).not.toContain('fake3');
        });

        it('should return empty array for unknown tag', () => {
            expect(EnhancedEnumFactoryMock.getByTag('zzz')).toEqual([]);
        });
    });

    describe('getByTagsAnd', () => {
        it('should return entries matching ALL tags', () => {
            const results = EnhancedEnumFactoryMock.getByTagsAnd(['aaa', 'ccc']);
            expect(results).toHaveLength(1);
            expect(results[0].id).toBe('fake4');
        });

        it('should return empty when no entry matches all tags', () => {
            expect(EnhancedEnumFactoryMock.getByTagsAnd(['aaa', 'bbb', 'ccc'])).toEqual([]);
        });
    });

    describe('getByTagsOr', () => {
        it('should return entries matching ANY tag', () => {
            const results = EnhancedEnumFactoryMock.getByTagsOr(['bbb', 'ccc']);
            const ids = results.map((x: any) => x.id);
            expect(ids).toEqual(expect.arrayContaining(['fake2', 'fake3', 'fake4']));
        });
    });

    describe('getAllAvailables', () => {
        it('should return all registered entries', () => {
            const all = EnhancedEnumFactoryMock.getAllAvailables();
            expect(all).toHaveLength(4);
        });

        it('should return a copy (not the internal array)', () => {
            const a = EnhancedEnumFactoryMock.getAllAvailables();
            const b = EnhancedEnumFactoryMock.getAllAvailables();
            expect(a).not.toBe(b);
            expect(a).toEqual(b);
        });
    });

    describe('duplicate id rejection', () => {
        it('should log error and not register duplicate ids', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation();

            class DuplicateTest extends AEnhancedEnumFactory {
                static first = new DuplicateTest('dup-id');
                static second = new DuplicateTest('dup-id');
                constructor(id: string) { super(id); }
            }

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('dup-id') })
            );
            expect(DuplicateTest.getAllAvailables()).toHaveLength(1);
            spy.mockRestore();
        });
    });

});
