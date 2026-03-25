import { z } from 'zod';
import { ABackToFrontDTO } from './back-to-front';

const TestSchema = z.object({ id: z.number(), name: z.string() });
type Back = z.infer<typeof TestSchema>;
interface Front { label: string; }

class TestBackToFrontDTO extends ABackToFrontDTO<Back, Front, typeof TestSchema> {
    readonly uri = '/test';
    protected __schema = TestSchema;
    protected __toFront(xs: Back[]): Front[] {
        return xs.map(x => ({ label: `${x.id}-${x.name}` }));
    }
}

describe('ABackToFrontDTO', () => {
    let dto: TestBackToFrontDTO;

    beforeEach(() => {
        dto = new TestBackToFrontDTO();
    });

    describe('toFront', () => {
        it('parses and transforms valid data', () => {
            const result = dto.toFront([{ id: 1, name: 'alice' }, { id: 2, name: 'bob' }]);
            expect(result).toEqual([{ label: '1-alice' }, { label: '2-bob' }]);
        });

        it('returns empty array when any item fails schema validation', () => {
            jest.spyOn(console, 'error').mockImplementation();
            const result = dto.toFront([{ id: 1, name: 'valid' }, { id: 'bad' } as any]);
            expect(result).toEqual([]);
            (console.error as jest.Mock).mockRestore();
        });

        it('returns empty array for empty input', () => {
            expect(dto.toFront([])).toEqual([]);
        });
    });
});
