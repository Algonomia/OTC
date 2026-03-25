import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef, EventEmitter,
    Input, Output,
    ViewChild
} from '@angular/core';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import {ATemplateComponent} from '../../templates/template-component.abstract';
import {BehaviorSubject} from 'rxjs';
import {NullUndefinedUtils} from '@algonomia/ts-shared';
import isNullOrUndefined = NullUndefinedUtils.isNullOrUndefined;
import {QueryParamsSynchronizerService} from '../../global-services/query-params-synchronizer.service';

@Component({
  selector: 'app-world-map',
  imports: [],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldMapComponent extends ATemplateComponent implements AfterViewInit {
    @ViewChild('chart', { static: false }) div!: ElementRef;
    @Input() set valueKey(x: string) {
        this._valueKeySubject.next(x);
    };
    @Input() set data(x: {[key: string]: any}[]) {
        this._dataSubject.next(x);
    }
    @Input() set isActiveParamKey(key: string) {
        if (!key) {
            return;
        }
        this._synchroWithIsActiveQueryParams(key);
    }
    @Output() activeData = new EventEmitter<any>();
    @Output() activeIso2 = new EventEmitter<any>();

    private _synchroWithIsActiveQueryParams(key: string) {
        const reaction = ((country: string) => {
            this.__preselectCountry$.next(country);
        }).bind(this);

        return this.pipeTakeUntil(
            this._queryParamsSynchronizerService.synchronize(key, this.__preselectCountry$, reaction)
        ).subscribe();
    }

    private _dataSubject = new BehaviorSubject<{}[]>([]);
    private _valueKeySubject = new BehaviorSubject<string>('');
    __preselectCountry$ = new BehaviorSubject<string | undefined>(undefined);

    private _root: any;

    constructor(
        private _cd: ChangeDetectorRef, private _queryParamsSynchronizerService: QueryParamsSynchronizerService
    ) {
        super();
    }

    private _polygonSeries: any;
    ngAfterViewInit() {
        const selected = am5.color(
            getComputedStyle(this.div.nativeElement).getPropertyValue('--main-4').trim()
        );
        const heatmap_min_css = '#FCECDE';//getComputedStyle(document.documentElement).getPropertyValue('--heatmap-decrease-1').trim();
        const heatmap_max_css = '#00A032';//getComputedStyle(document.documentElement).getPropertyValue('--heatmap-decrease-2').trim();
        const background_css = '#E4F7FF';//getComputedStyle(document.documentElement).getPropertyValue('--link-0').trim();
        const none_css = getComputedStyle(document.documentElement).getPropertyValue('--heatmap-neutral').trim();
        const heatmap_min = am5.color(heatmap_min_css);
        const heatmap_max = am5.color(heatmap_max_css);
        const heatmap_none = am5.color(none_css);
        const background = am5.color(background_css);

        this._root = am5.Root.new(this.div.nativeElement);
        this._root.container.setAll({
            background: am5.Rectangle.new(this._root, {
                fill: background,
                fillOpacity: 0.5
            })
        });

        const chart = this._root.container.children.push(am5map.MapChart.new(this._root, {
            panX: "translateX",
            panY: "translateY",
            wheelY: "zoom",
            minZoomLevel: 0.5,
            maxZoomLevel: 16,
            projection: am5map.geoMercator()
        }));

        this._polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(this._root, {
                geoJSON: am5geodata_worldLow,
                valueField: 'value',
                calculateAggregates: true,
                exclude: ["AQ"]
            })
        );

        this._polygonSeries.set("heatRules", [{
            target: this._polygonSeries.mapPolygons.template,
            dataField: "value",
            min: heatmap_min,
            max: heatmap_max,
            key: "fill"
        }]);

        this._polygonSeries.mapPolygons.template.setAll({
            tooltipText: "{name}",
            toggleKey: "active",
            interactive: true,
            strokeOpacity: 0,
            strokeWidth: 1,
            stroke: background
        });
        this._polygonSeries.mapPolygons.template.states.create("hover", {
            stroke: selected,
            strokeWidth: 1,
            strokeOpacity: 0.5
        });
        this._polygonSeries.mapPolygons.template.states.create("active", {
            stroke: selected,
            strokeWidth: 1.5,
            strokeOpacity: 1
        });

        let previousPolygon: any;
        this._polygonSeries.mapPolygons.template.on('active', ((active: any, target: any) => {
            if (previousPolygon && previousPolygon != target) {
                previousPolygon.set('active', false);
            }
            previousPolygon = target;
            this._cd.markForCheck();
        }).bind(this));

        this._polygonSeries.mapPolygons.template.events.on('click', (ev: any) => {
            const target = ev.target;
            const isActive = target.get('active');

            if (!isActive) {  // Means it's now becoming active
                const iso2 = target?.dataItem?.get('id');
                this.__preselectCountry$.next(iso2);
                this.activeData.next(target?.dataItem?.dataContext?.data ?? []);
                this.activeIso2.next(iso2);
            } else {
                this.__preselectCountry$.next(undefined);
                this.activeData.next(undefined);
                this.activeIso2.next(undefined);
            }
        });

        this._polygonSeries.mapPolygons.template.setAll({
            tooltipText: "{name}",
            fill: heatmap_none
        });

        this._polygonSeries.mapPolygons.template.adapters.add("tooltipText", (text: any, target: any) => {
            const name = target.dataItem?.dataContext?.name ?? "";
            const rawValue = target.dataItem?.get("value") ?? target.dataItem?.dataContext?.value;
            const value = (rawValue !== null && rawValue !== undefined) ? +rawValue : NaN;
            return value > 0 ? `${name} ${value}%` : name;
        });

        this._cd.markForCheck();

        this.pipeTakeUntil(this._dataSubject).subscribe(data => {
            this._polygonSeries.data.setAll(data.map(x => ({...x})));
            this._setActive(this.__preselectCountry$.getValue());
            this._cd.markForCheck();
        });

        /*this.pipeTakeUntil(this._valueKeySubject).subscribe(key => {
            polygonSeries.set('valueField', key);
            this._cd.markForCheck();
        });*/ // TOdo : check why not working if we uncomment this and comment valueField
    }

    private _setActive(country?: string) {
        if (!this._polygonSeries) {
            return;
        }
        if (!isNullOrUndefined(country)) {
            const polygonItem = this._polygonSeries.getDataItemById(country);
            if (polygonItem) {
                polygonItem.get('mapPolygon').set('active', true);
                this._cd.markForCheck();
            }
        }
    }

    override __onDestroy() {
        this._root?.dispose();
    }
}
