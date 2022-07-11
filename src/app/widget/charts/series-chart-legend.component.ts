import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ColorHelper } from "@swimlane/ngx-charts";
import { ChartData, NgxChartsUtils } from "./NgxChartsUtils";

@Component({
    selector: "series-chart-legend",
    templateUrl: "./series-chart-legend.component.html",
    styles: [`
    .legend-entry {
        display: flex;
        align-items: center;
        width: 220px;
        font-size: 12px;
        margin: 0.5rem;
    }
    .legend-label {
        cursor: pointer;
        color: #888;
        flex: 1;
    }
    .legend-label.active { 
        color: #000;
    }
    `]
})
export class SeriesChartLegendComponent {

    @Input() chartData: ChartData[];
    @Input() activeEntries: ChartData[] = [];
    @Input() colorScheme: string;
    @Input() showValue: boolean = true;
    @Output() activate: EventEmitter<ChartData> = new EventEmitter();
    @Output() deactivate: EventEmitter<ChartData> = new EventEmitter();

    colorHelper: ColorHelper;

    constructor() {}
    
    ngOnInit() {
        this.colorHelper = new ColorHelper(this.colorScheme, 'ordinal', [], null);
    }

    isLabelActive(data: ChartData): boolean {
        return this.activeEntries[0] != null && NgxChartsUtils.chartDataEquals(data, this.activeEntries[0]);
    }

    onActivate(data: ChartData) {
        this.activate.emit(data);
    }
    onDeactivate() {
        this.deactivate.emit();
    }

}