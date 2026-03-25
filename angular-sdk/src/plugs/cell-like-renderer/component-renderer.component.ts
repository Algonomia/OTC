import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ComponentRef,
    EnvironmentInjector,
    Input,
    OnChanges,
    SimpleChanges,
    Type,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

@Component({
    selector: 'app-component-renderer',
    standalone: true,
    template: `<ng-container #container></ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentRendererComponent<Data> implements OnChanges {
    @Input({ required: true }) renderComponent!: Type<unknown>;
    @Input() renderInputs?: (data: Data) => Record<string, unknown>;
    @Input({ required: true }) data!: Data;

    @ViewChild('container', { read: ViewContainerRef, static: true })
    container!: ViewContainerRef;

    private componentRef?: ComponentRef<unknown>;

    constructor(private injector: EnvironmentInjector, private _cd: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        const shouldRecreate = changes['renderComponent'] || !this.componentRef; // Safety fallback

        if (shouldRecreate) {
            this._createComponent();
        } else if (changes['data'] || changes['renderInputs']) {
            this._updateInputs();
        }
    }

    private _createComponent(): void {
        this.container.clear();

        this.componentRef = this.container.createComponent(this.renderComponent, {
            environmentInjector: this.injector
        });

        this._updateInputs();
    }

    private _updateInputs(): void {
        if (!this.componentRef) return;

        const inputs = this.renderInputs?.(this.data) ?? {data: this.data};
        Object.assign(this.componentRef.instance as object, inputs);
        this._cd.markForCheck();
    }
}
