import { Component, Input, SimpleChanges } from "@angular/core";
import { LexicalizationSetMetadata } from "src/app/models/Metadata";
import { Project } from "src/app/models/Project";
import { AnnotatedValue, IRI } from "src/app/models/Resources";
import { MetadataRegistryServices } from "src/app/services/metadata-registry.service";

@Component({
    selector: 'lexicalization-sets-renderer',
    templateUrl: './lexicalization-sets-renderer.component.html',
    host: { class: "vbox" },
    styles: [`
    .table > tbody > tr:first-child > td {
        border-top: none;
    }
    `]
})
export class LexicalizationSetsRenderer {

    @Input() dataset: AnnotatedValue<IRI>;
    lexicalizationSets: LexicalizationSetMetadata[];

    constructor(private metadataRegistryService: MetadataRegistryServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initLexicalizationSets();
        }
    }

    private initLexicalizationSets() {
        this.metadataRegistryService.getEmbeddedLexicalizationSets(this.dataset.getValue()).subscribe(
            (lexicalizationSets: LexicalizationSetMetadata[]) => {
                this.lexicalizationSets = lexicalizationSets;
                this.lexicalizationSets.forEach(l => {
                    l['lexModelPretty'] = Project.getPrettyPrintModelType(l.lexicalizationModel);
                });
                this.sortLexicalizationSets("language");
            }
        );
    }

    sortLexicalizationSets(criteria: 'lexicalizations' | 'language') {
        if (criteria == "language") {
            this.lexicalizationSets.sort((l1, l2) => {
                return l1.language.localeCompare(l2.language);
            });
        } else { //lexicalizations
            this.lexicalizationSets.sort((l1, l2) => {
                /*
                - If both lex set has lexicalizations, compare them
                - If only one of lex set has lexicalizations, set first the one which has it
                - If none of them has lexicalizations, sort by language
                */
                if (l1.lexicalizations && l2.lexicalizations) {
                    return l2.lexicalizations - l1.lexicalizations;
                } else if (l1.lexicalizations && !l2.lexicalizations) {
                    return -1;
                } else if (!l1.lexicalizations && l2.lexicalizations) {
                    return 1;
                } else {
                    return l1.language.localeCompare(l2.language);
                }
            });
        }
    }

    collapseAll(collapse: boolean) {
        this.lexicalizationSets.forEach(l => {
            l['collapsed'] = collapse;
        });
    }

}