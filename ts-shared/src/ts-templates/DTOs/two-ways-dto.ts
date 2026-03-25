import {z} from 'zod';
import {ABackToFrontDTO} from './back-to-front';
import {AFrontToBackDTO} from './front-to-back';

class FrontToBackDelegate<B, F, TSchema extends z.ZodType<B>> extends AFrontToBackDTO<B, F, TSchema> {
    constructor(
        readonly uri: string,
        protected __schema: TSchema,
        protected __toBack: (x: F[]) => B[]
    ) {
        super();
    }
}

class BackToFrontDelegate<B, F, TSchema extends z.ZodType<B>> extends ABackToFrontDTO<B, F, TSchema> {
    constructor(
        readonly uri: string,
        protected __schema: TSchema,
        protected __toFront: (x: B[]) => F[]
    ) {
        super();
    }
}

export abstract class ABothWaysDTO<B, F, TSchema extends z.ZodType<B>> {
    abstract readonly uri: string;
    protected abstract __schema: TSchema;
    protected abstract __toFront(x: B[]): F[];
    protected abstract __toBack(x: F[]): B[];

    private _backToFront?: ABackToFrontDTO<B, F, TSchema>;
    private _frontToBack?: AFrontToBackDTO<B, F, TSchema>;

    get backToFront() {
        if (!this._backToFront) {
            this._backToFront = new BackToFrontDelegate<B, F, TSchema>(this.uri, this.__schema, this.__toFront.bind(this));
        }
        return this._backToFront;
    }

    get frontToBack() {
        if (!this._frontToBack) {
            this._frontToBack = new FrontToBackDelegate<B, F, TSchema>(this.uri, this.__schema, this.__toBack.bind(this));
        }
        return this._frontToBack;
    }

    toFront(bs: B[]): F[] {
        return this.backToFront.toFront(bs);
    }

    toBack(fs: F[]): B[] {
        return this.frontToBack.toBack(fs);
    }
}
