export abstract class AlgoListIncrementer<I> {
    private _listElementIndex: number = 0;
    private _onHoverLayers: number = 0;
    private _activeListElement!: I;

    protected constructor(private _list: ReadonlyArray<I>, private _listElement: I, private _disabled: boolean = false) {
        this.listElement = this._listElement;
    }

    set listElement(listElement: I) {
        this._listElementIndex = this._list.indexOf(listElement) ?? 0;
        this._resetActive();
    }

    set disabled(disabled: boolean) {
        this._disabled = disabled;
        this._resetActive();
    }

    get activeListElement() {
        return this._activeListElement;
    }

    onAddHoverLayer() {
        this._onHoverLayers += 1;
        this._resetActive();
    }

    onRemoveHoverLayer() {
        this._onHoverLayers -= 1;
        this._resetActive();
    }

    private _resetActive() {
        if (this._disabled) {
            this._activeListElement = this._listElement;
            return;
        }
        const index = this._listElementIndex + this._onHoverLayers
        if (index > this._list.length - 1) {
            this._activeListElement = this._list[this._list.length - 1];
        } else if (index < 0) {
            this._activeListElement = this._list[0];
        } else {
            this._activeListElement = this._list[index];
        }
    }
}
