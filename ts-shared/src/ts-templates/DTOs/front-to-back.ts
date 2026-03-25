import {z} from 'zod';

export abstract class AFrontToBackDTO<B, F, TSchema extends z.ZodType<B>> {
    abstract readonly uri: string;
    protected abstract __schema: TSchema;
    protected abstract __toBack(x: F[]): B[];

    toBack(fs: F[]): B[] {
        try {
            const bs = this.__toBack(fs);
            return bs.map(b => this.__schema.parse(b));
        } catch(e) {
            console.error('Error on sending data, contact administrator\n', e);
            return [];
        }
    }
}
