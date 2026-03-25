import { z } from 'zod';
import { ABothWaysDTO } from './two-ways-dto';

const TestSchema = z.object({ id: z.number(), name: z.string() });
type Back = z.infer<typeof TestSchema>;
interface Front { label: string; }

class TestBothWaysDTO extends ABothWaysDTO<Back, Front, typeof TestSchema> {
    readonly uri = '/test';
    protected __schema = TestSchema;
    protected __toFront(xs: Back[]): Front[] {
        return xs.map(x => ({ label: `${x.id}-${x.name}` }));
    }
    protected __toBack(xs: Front[]): Back[] {
        return xs.map(x => {
            const [id, name] = x.label.split('-');
            return { id: Number(id), name };
        });
    }
}

describe('ABothWaysDTO', () => {
    let dto: TestBothWaysDTO;

    beforeEach(() => {
        dto = new TestBothWaysDTO();
    });

    describe('toFront', () => {
        it('delegates to backToFront and transforms valid data', () => {
            const result = dto.toFront([{ id: 1, name: 'alice' }]);
            expect(result).toEqual([{ label: '1-alice' }]);
        });

        it('returns empty array when schema validation fails', () => {
            jest.spyOn(console, 'error').mockImplementation();
            const result = dto.toFront([{ id: 'bad' } as any]);
            expect(result).toEqual([]);
            (console.error as jest.Mock).mockRestore();
        });
    });

    describe('toBack', () => {
        it('delegates to frontToBack and validates output', () => {
            const result = dto.toBack([{ label: '1-alice' }]);
            expect(result).toEqual([{ id: 1, name: 'alice' }]);
        });

        it('returns empty array when output fails validation', () => {
            jest.spyOn(console, 'error').mockImplementation();
            const result = dto.toBack([{ label: 'bad' }]);
            expect(result).toEqual([]);
            (console.error as jest.Mock).mockRestore();
        });
    });

    describe('backToFront / frontToBack getters', () => {
        it('returns the same instance on repeated access', () => {
            expect(dto.backToFront).toBe(dto.backToFront);
            expect(dto.frontToBack).toBe(dto.frontToBack);
        });
    });
});
