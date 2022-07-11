import { Component, Input, SimpleChanges } from "@angular/core";
import { AnnotatedValue, IRI } from "src/app/models/Resources";
import { MetadataRegistryServices } from "src/app/services/metadata-registry.service";
import { Cookie } from 'src/app/utils/Cookie';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { SVContext } from 'src/app/utils/SVContext';
import { ChartData, ChartEnum } from 'src/app/widget/charts/NgxChartsUtils';

@Component({
    selector: 'type-distributions',
    templateUrl: './type-distributions.component.html',
    styles: [`
        .card-header-tabs {
            margin-bottom: -6px;
        }
        .nav-tabs>li>a {
            padding: 6px;
        }
    `]
})
export class TypeDistributionsComponent {

    @Input() dataset: AnnotatedValue<IRI>;

    activeTab: "table" | "chart" = "table";

    chartTypes: ChartEnum[] = [ChartEnum.bar, ChartEnum.pie];
    activeChart: ChartEnum = ChartEnum.bar;

    classPartitionsData: ChartData[];


    constructor(private metadataRegistryService: MetadataRegistryServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initClassPartitions();
        }
    }

    ngOnInit() {
        let chartType: string = Cookie.getCookie(Cookie.METADATA_TYPE_DISTRIBUTIONS_CHART_TYPE);
        if (chartType in ChartEnum) {
            this.activeChart = <ChartEnum>chartType;
        }
    }

    private initClassPartitions() {
        this.metadataRegistryService.getClassPartitions(this.dataset.getValue()).subscribe(
            (map: { [iri: string]: number }) => {
                let totalEntities: number;
                this.classPartitionsData = [];

                Object.keys(map).forEach(iri => {
                    let partitionEntities: number = map[iri];
                    // if (partitionEntities == 0) return;
                    if (iri == this.dataset.getValue().getIRI()) {
                        totalEntities = partitionEntities;
                    } else {
                        this.classPartitionsData.push({ name: ResourceUtils.getQName(iri, SVContext.getPrefixMappings()), value: partitionEntities });
                    }
                });

                
                this.classPartitionsData.sort((d1, d2) => d1.name.localeCompare(d2.name));
                
                //if there are other entities not included in those classified, add the "other" count
                let classifiedEntities: number = this.classPartitionsData.reduce((tot, data) => { return tot + data.value; }, 0); //amount of entities grouped under a classification
                let otherEntities: number = totalEntities - classifiedEntities;
                if (otherEntities > 0) {
                    this.classPartitionsData.push({ name: "Other", value: otherEntities });
                }
            }
        );
    }

    onViewChanged() {
        Cookie.setCookie(Cookie.METADATA_TYPE_DISTRIBUTIONS_CHART_TYPE, this.activeChart);
    }

}