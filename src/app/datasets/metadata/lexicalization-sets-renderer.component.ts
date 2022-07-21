import { Component, Input, SimpleChanges } from "@angular/core";
import { LexicalizationSetMetadata } from "src/app/models/Metadata";
import { Project } from "src/app/models/Project";
import { AnnotatedValue, IRI } from "src/app/models/Resources";
import { MetadataRegistryServices } from "src/app/services/metadata-registry.service";
import { Cookie } from 'src/app/utils/Cookie';
import { ChartData, ChartEnum } from 'src/app/widget/charts/NgxChartsUtils';

@Component({
    selector: 'lexicalization-sets-renderer',
    templateUrl: './lexicalization-sets-renderer.component.html',
    host: { class: "vbox" },
})
export class LexicalizationSetsRenderer {

    @Input() dataset: AnnotatedValue<IRI>;

    activeTab: "table" | "chart" = "table";

    lexicalizationSets: LexicalizationSetMetadata[] = [];

    sortCriteria: SortCriteria = SortCriteria.language_asc;

    chartTypes: { value: ChartEnum, translationKey: string }[] = [
        { value: ChartEnum.bar, translationKey: "COMMONS.CHARTS.BAR_CHART" },
        { value: ChartEnum.pie, translationKey: "COMMONS.CHARTS.PIE_CHART" }
    ];
    activeChart: ChartEnum = ChartEnum.bar;

    lexSetsChartData: ChartData[];

    constructor(private metadataRegistryService: MetadataRegistryServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initLexicalizationSets();
        }
    }

    ngOnInit() {
        let chartType: string = Cookie.getCookie(Cookie.METADATA_LEX_SETS_CHART_TYPE);
        if (chartType in ChartEnum) {
            this.activeChart = <ChartEnum>chartType;
        }
    }

    private initLexicalizationSets() {
        this.metadataRegistryService.getEmbeddedLexicalizationSets(this.dataset.getValue()).subscribe(
            (lexicalizationSets: LexicalizationSetMetadata[]) => {
                this.lexicalizationSets = lexicalizationSets;
                this.lexicalizationSets.forEach(l => {
                    l['lexModelPretty'] = Project.getPrettyPrintModelType(l.lexicalizationModel);
                });
                this.sortLexicalizationSets();

                this.initChartData();
            }
        );
    }

    private initChartData() {
        this.lexSetsChartData = this.lexicalizationSets.filter(l => l.lexicalizations != null && l.lexicalizations > 0).map(l => {
            return {
                name: l.language,
                value: l.lexicalizations
            };
        });
    }

    switchSort(criteria: "lexicalizations" | "language") {
        if (criteria == "language") {
            if (this.sortCriteria == SortCriteria.language_asc) {
                this.sortCriteria = SortCriteria.language_desc;
            } else {
                this.sortCriteria = SortCriteria.language_asc;
            }
        } else { //lexicalizations
            if (this.sortCriteria == SortCriteria.lexicalizations_asc) {
                this.sortCriteria = SortCriteria.lexicalizations_desc;
            } else {
                this.sortCriteria = SortCriteria.lexicalizations_asc;
            }
        }
        this.sortLexicalizationSets();
        this.initChartData();
    }

    private sortLexicalizationSets() {
        if (this.sortCriteria == SortCriteria.language_asc) {
            this.lexicalizationSets.sort((l1, l2) => {
                return l1.language.localeCompare(l2.language);
            });
        } else if (this.sortCriteria == SortCriteria.language_desc) {
            this.lexicalizationSets.sort((l1, l2) => {
                return -l1.language.localeCompare(l2.language);
            });
        } else { //lexicalizations
            this.lexicalizationSets.sort((l1, l2) => {
                /*
                - If both lex set has lexicalizations, compare them
                - If only one of lex set has lexicalizations, set first the one which has it
                - If none of them has lexicalizations, sort by language
                */
                if (l1.lexicalizations && l2.lexicalizations) {
                    if (this.sortCriteria == SortCriteria.lexicalizations_asc) {
                        return l2.lexicalizations - l1.lexicalizations;
                    } else {
                        return l1.lexicalizations - l2.lexicalizations;
                    }
                } else if (l1.lexicalizations && !l2.lexicalizations) {
                    if (this.sortCriteria == SortCriteria.lexicalizations_asc) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (!l1.lexicalizations && l2.lexicalizations) {
                    if (this.sortCriteria == SortCriteria.lexicalizations_asc) {
                        return 1;
                    } else {
                        return -1;
                    }
                } else {
                    if (this.sortCriteria == SortCriteria.lexicalizations_asc) {
                        return l1.language.localeCompare(l2.language);
                    } else {
                        return l2.language.localeCompare(l1.language);
                    }
                }
            });
        }
    }

    collapseAll(collapse: boolean) {
        this.lexicalizationSets.forEach(l => {
            l['collapsed'] = collapse;
        });
    }

    switchChart(type: ChartEnum) {
        this.activeChart = type;
        Cookie.setCookie(Cookie.METADATA_LEX_SETS_CHART_TYPE, this.activeChart);
    }

}

enum SortCriteria {
    lexicalizations_asc = "lexicalizations_asc",
    lexicalizations_desc = "lexicalizations_desc",
    language_asc = "language_asc",
    language_desc = "language_desc",
}