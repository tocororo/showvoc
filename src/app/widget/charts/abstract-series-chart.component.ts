import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { AnnotatedValue, Value } from 'src/app/models/Resources';
import { ChartData, ColorSetEnum } from "./NgxChartsUtils";

@Directive()
export abstract class AbstractSeriesChartComponent {

    @Input() chartData: ChartData[];
    @Input() legend: boolean = true;
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<AnnotatedValue<Value>> = new EventEmitter(); //emits the resource related to the double click graphic element. Null if double click on empty area

    colorScheme: ColorSetEnum = ColorSetEnum.picnic;

    activeEntries: ChartData[] = [];

    constructor() {}

    onActivate(data: ChartData) {
        this.activeEntries = [{ name: data.name, value: data.value }];
    }
    onDeactivate() {
        this.activeEntries = [];
    }

}

