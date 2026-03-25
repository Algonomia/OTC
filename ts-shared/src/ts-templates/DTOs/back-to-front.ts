import {z} from 'zod';

export abstract class ABackToFrontDTO<B, F, TSchema extends z.ZodType<B>> {
    abstract readonly uri: string;
    protected abstract __schema: TSchema;
    protected abstract __toFront(x: B[]): F[];

    toFront(bs: B[]): F[] {
        try {
            const parsed: B[] = [];
            const errors: any[] = [];
            bs.forEach(b => {
                try {
                    parsed.push(this.__schema.parse(b));
                } catch (e) {
                    errors.push(e);
                }
            });
            if (errors.length > 0) {
                console.error('Error On fetching data, contact administrator\n', errors);
                return [];
            } else {
                return this.__toFront(parsed);
            }
        } catch (e) {
            console.error('Error On fetching data, contact administrator\n');
            return [];
        }
    }
}
