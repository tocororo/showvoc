import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { ConfigurationComponents, ConfigurationObject } from 'src/app/models/Configuration';
import { IRI } from 'src/app/models/Resources';
import { OntoLex, RDFS, SKOS, SKOSXL, SemanticTurkey } from 'src/app/models/Vocabulary';
import { MetadataRegistryServices } from 'src/app/services/metadata-registry.service';
import { AbstractContributionComponent } from '../abstract-contribution.component';

@Component({
    selector: 'stable-contribution',
    templateUrl: './stable-contribution.component.html'
})
export class StableContributionComponent extends AbstractContributionComponent {

    storedConfigurationTypeId: string = ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.STABLE;

    

    resourceName: string;
    homepage: string;
    description: string;
    owner: boolean = false;

    baseURI: string;

    semanticModels: { uri: string, show: string }[] = [
        { uri: SKOS.uri, show: "SKOS" },
        { uri: OntoLex.uri, show: "Ontolex" }
    ];
    selectedSemModel: string;

    lexicalizationModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: "RDFS" },
        { uri: SKOS.uri, show: "SKOS" },
        { uri: SKOSXL.uri, show: "SKOS-XL" },
        { uri: OntoLex.uri, show: "Ontolex" }
    ];
    selectedLexModel: string;

    //Metadata
    loadingMetadata: boolean = false;
    identity: string;
    dereferenciationSystem: string;
    sparqlEndpoint: string;
    sparqlNoAggregation: boolean;
    uriSpace: string;

    dereferenciationOpts: { uri: string, show: string }[] = [
        { uri: null, show: "Unknown" },
        { uri: SemanticTurkey.standardDereferenciation, show: "Yes" },
        { uri: SemanticTurkey.noDereferenciation, show: "No" },
    ]

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalsServices) {
        super();
    }

    ngOnInit() {}

    discoverMetadata() {
        this.loadingMetadata = true;
        let baseUriIRI: IRI = new IRI(this.baseURI);
        this.metadataRegistryService.discoverDatasetMetadata(baseUriIRI).pipe(
            finalize(() => this.loadingMetadata = false)
        ).subscribe(
            dataset => {
                // this.metadataDiscovered = true;
                this.identity = dataset.identity;
                this.dereferenciationSystem = dataset.dereferenciationSystem;
                this.sparqlEndpoint = dataset.sparqlEndpointMetadata.id;
                this.sparqlNoAggregation = dataset.sparqlEndpointMetadata.limitations ?
                    dataset.sparqlEndpointMetadata.limitations.some(l => l == "<" + SemanticTurkey.noAggregation + ">") :
                    false;
                this.uriSpace = dataset.uriSpace;
            },
            (err: Error) => { //in case discoverDataset throws an exception prevent to contribute metadata
                if (err.name.endsWith("DeniedOperationException")) {
                    this.basicModals.alert("Already existing dataset", "A dataset for the provided IRI " + baseUriIRI.toNT() + 
                        " is already in the metadata registry", ModalType.warning);
                }
            }
        );
    }

    isBaseUriValid(): boolean {
        return IRI.regexp.test(this.baseURI);
    }

    getConfigurationImpl(): ConfigurationObject {
        //check mandatory fields
        let missingField: string;
        if (this.resourceName == null) {
            missingField = "Resource name";
        } else if (this.description == null) {
            missingField = "Description";
        } else if (this.baseURI == null) {
            missingField = "Base URI";
        } else if (this.selectedSemModel == null) {
            missingField = "Model";
        } else if (this.selectedLexModel == null) {
            missingField = "Lexicalization model";
        }
        if (missingField != null) {
            this.basicModals.alert("Incomplete form", "Missing mandatory field '" + missingField + "'", ModalType.warning);
            return;
        }
        let config: ConfigurationObject = {
            resourceName: this.resourceName,
            homepage: this.homepage,
            description: this.description,
            isOwner: this.owner,
            baseURI: new IRI(this.baseURI).toNT(),
            model: new IRI(this.selectedSemModel).toNT(),
            lexicalizationModel: new IRI(this.selectedLexModel).toNT(),
            //metadata
            identity: this.identity ? new IRI(this.identity).toNT() : null,
            dereferenciationSystem: this.dereferenciationSystem ? new IRI(this.dereferenciationSystem).toNT() : null,
            sparqlEndpoint: this.sparqlEndpoint ? new IRI(this.sparqlEndpoint).toNT() : null,
            sparqlLimitations: this.sparqlNoAggregation ? [new IRI(SemanticTurkey.noAggregation).toNT()] : null,
            uriSpace: this.uriSpace
        }
        return config;
    }

}