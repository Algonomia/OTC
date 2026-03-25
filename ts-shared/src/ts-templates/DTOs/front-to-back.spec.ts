import { z } from 'zod';
import { AFrontToBackDTO } from './front-to-back';

const TestSchema = z.object({ id: z.number(), value: z.string() });
type Back = z.infer<typeof TestSchema>;
interface Front { label: string; num: number; }

class TestFrontToBackDTO extends AFrontToBackDTO<Back, Front, typeof TestSchema> {
    readonly uri = '/test';
    protected __schema = TestSchema;
    protected __toBack(xs: Front[]): Back[] {
        return xs.map(x => ({ id: x.num, value: x.label }));
    }
}

describe('AFrontToBackDTO', () => {
    let dto: TestFrontToBackDTO;

    beforeEach(() => {
        dto = new TestFrontToBackDTO();
    });

    describe('toBack', () => {
        it('transforms and validates data', () => {
            const result = dto.toBack([{ label: 'hello', num: 1 }]);
            expect(result).toEqual([{ id: 1, value: 'hello' }]);
        });

        it('returns empty array when schema validation fails', () => {
            jest.spyOn(console, 'error').mockImplementation();
            class BadDTO extends AFrontToBackDTO<Back, Front, typeof TestSchema> {
                readonly uri = '/bad';
                protected __schema = TestSchema;
                protected __toBack(xs: Front[]): Back[] {
                    return [{ id: 'not-a-number' as any, value: 123 as any }];
                }
            }
            const badDto = new BadDTO();
            const result = badDto.toBack([{ label: 'x', num: 1 }]);
            expect(result).toEqual([]);
            (console.error as jest.Mock).mockRestore();
        });

        it('returns empty array for empty input', () => {
            expect(dto.toBack([])).toEqual([]);
        });
    });
});
