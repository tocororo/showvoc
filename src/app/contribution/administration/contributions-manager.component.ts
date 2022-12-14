import { Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { Configuration, ConfigurationComponents, ConfigurationProperty } from 'src/app/models/Configuration';
import { DevResourceStoredContribution, MetadataStoredContribution, StableResourceStoredContribution, StoredContribution } from 'src/app/models/Contribution';
import { ConfigurationsServices } from 'src/app/services/configuration.service';
import { ShowVocServices } from 'src/app/services/showvoc.service';
import { NTriplesUtil } from 'src/app/utils/ResourceUtils';
import { DevelopmentContributionDetailsModal } from '../development/development-contribution-details-modal';
import { DevProjectCreationModal } from '../development/development-project-creation-modal';
import { MetadataContributionDetailsModal } from '../metadata/metadata-contribution-details-modal';
import { StableContributionDetailsModal } from '../stable/stable-contribution-details-modal';
import { StableProjectCreationModal } from '../stable/stable-project-creation-modal';

@Component({
    selector: 'contributions-manager',
    templateUrl: './contributions-manager.component.html',
    host: { class: "vbox" }
})
export class ContributionsManagerComponent {

    loading: boolean = false;

    contributions: StoredContribution[];

    constructor(private svService: ShowVocServices, private configurationServices: ConfigurationsServices,
        private basicModals: BasicModalsServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.initContributions();
    }

    private initContributions() {
        this.loading = true;
        this.svService.getContributionReferences().subscribe(
            references => {
                let getConfigFn: Observable<void>[] = [];
                references.forEach(ref => {
                    getConfigFn.push(
                        this.configurationServices.getConfiguration(ConfigurationComponents.CONTRIBUTION_STORE.ID, ref.relativeReference).pipe(
                            map(config => {
                                let contribution: StoredContribution = this.parseConfiguration(config);
                                /**
                                 * add further attributes to the contribution:
                                 * - timestamp: the identifier of the configuration reference, useful for the sorting
                                 * - date: useful info to show
                                 * - relativeReference: reference of the configuration, useful in case of rejection of the contribution
                                 */
                                contribution[StoredContribution.RELATIVE_REFERENCE] = ref.relativeReference;
                                let timestampMillis: number = parseInt(ref.identifier);
                                contribution['timestamp'] = timestampMillis;
                                contribution['date'] = new Date(timestampMillis).toLocaleString();
                                this.contributions.push(contribution);
                            })
                        )
                    );
                });
                this.contributions = [];
                forkJoin(getConfigFn).pipe(
                    finalize(() => { this.loading = false; })
                ).subscribe(
                    () => {
                        this.contributions.sort((c1: StoredContribution, c2: StoredContribution) => {
                            return c1['timestamp'] - c2['timestamp'];
                        });
                    }
                );
            }
        );
    }

    private parseConfiguration(configuration: Configuration): StoredContribution {
        let properties: ConfigurationProperty[] = configuration.properties;
        let contribution: StoredContribution;
        //parse specific contribution impl properties
        if (configuration.type == ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.METADATA) {
            contribution = new MetadataStoredContribution();
            (<MetadataStoredContribution>contribution).uriSpace = properties.find(p => p.name == "uriSpace").value;
            let identityValue: string = properties.find(p => p.name == "identity").value;
            if (identityValue != null) {
                (<MetadataStoredContribution>contribution).identity = NTriplesUtil.parseIRI(identityValue);
            }
            let dereferenciationSystemValue: string = properties.find(p => p.name == "dereferenciationSystem").value;
            if (dereferenciationSystemValue != null) {
                (<MetadataStoredContribution>contribution).dereferenciationSystem = NTriplesUtil.parseIRI(dereferenciationSystemValue);
            }
            let sparqlEndpointValue = properties.find(p => p.name == "sparqlEndpoint").value;
            if (sparqlEndpointValue != null) {
                (<MetadataStoredContribution>contribution).sparqlEndpoint = NTriplesUtil.parseIRI(sparqlEndpointValue);
            }
            (<MetadataStoredContribution>contribution).sparqlLimitations = [];
            let sparqlLimitationValue: string[] = properties.find(p => p.name == "sparqlLimitations").value;
            if (sparqlLimitationValue != null) {
                sparqlLimitationValue.forEach(l => {
                    (<MetadataStoredContribution>contribution).sparqlLimitations.push(NTriplesUtil.parseIRI(l));
                });
            }
        } else if (configuration.type == ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.STABLE) {
            contribution = new StableResourceStoredContribution();
            (<StableResourceStoredContribution>contribution).homepage = properties.find(p => p.name == "homepage").value;
            (<StableResourceStoredContribution>contribution).description = properties.find(p => p.name == "description").value;
            (<StableResourceStoredContribution>contribution).isOwner = properties.find(p => p.name == "isOwner").value;
            (<StableResourceStoredContribution>contribution).model = NTriplesUtil.parseIRI(properties.find(p => p.name == "model").value);
            (<StableResourceStoredContribution>contribution).lexicalizationModel = NTriplesUtil.parseIRI(properties.find(p => p.name == "lexicalizationModel").value);
            //metadata
            (<StableResourceStoredContribution>contribution).uriSpace = properties.find(p => p.name == "uriSpace").value;
            let identityValue: string = properties.find(p => p.name == "identity").value;
            if (identityValue != null) {
                (<StableResourceStoredContribution>contribution).identity = NTriplesUtil.parseIRI(identityValue);
            }
            let dereferenciationSystemValue: string = properties.find(p => p.name == "dereferenciationSystem").value;
            if (dereferenciationSystemValue != null) {
                (<StableResourceStoredContribution>contribution).dereferenciationSystem = NTriplesUtil.parseIRI(dereferenciationSystemValue);
            }
            let sparqlEndpointValue = properties.find(p => p.name == "sparqlEndpoint").value;
            if (sparqlEndpointValue != null) {
                (<StableResourceStoredContribution>contribution).sparqlEndpoint = NTriplesUtil.parseIRI(sparqlEndpointValue);
            }
            (<StableResourceStoredContribution>contribution).sparqlLimitations = [];
            let sparqlLimitationValue: string[] = properties.find(p => p.name == "sparqlLimitations").value;
            if (sparqlLimitationValue != null) {
                sparqlLimitationValue.forEach(l => {
                    (<StableResourceStoredContribution>contribution).sparqlLimitations.push(NTriplesUtil.parseIRI(l));
                });
            }
        } else if (configuration.type == ConfigurationComponents.CONTRIBUTION_STORE.CONFIG_IMPL.DEVELOPMENT) {
            contribution = new DevResourceStoredContribution();
            (<DevResourceStoredContribution>contribution).format = properties.find(p => p.name == "format").value;
            (<DevResourceStoredContribution>contribution).homepage = properties.find(p => p.name == "homepage").value;
            (<DevResourceStoredContribution>contribution).description = properties.find(p => p.name == "description").value;
            (<DevResourceStoredContribution>contribution).model = NTriplesUtil.parseIRI(properties.find(p => p.name == "model").value);
            (<DevResourceStoredContribution>contribution).lexicalizationModel = NTriplesUtil.parseIRI(properties.find(p => p.name == "lexicalizationModel").value);
        }
        //parse common contribution properties
        contribution.resourceName = properties.find(p => p.name == "resourceName").value;
        contribution.contributorName = properties.find(p => p.name == "contributorName").value;
        contribution.contributorLastName = properties.find(p => p.name == "contributorLastName").value;
        contribution.contributorEmail = properties.find(p => p.name == "contributorEmail").value;
        contribution.contributorOrganization = properties.find(p => p.name == "contributorOrganization").value;
        contribution.baseURI = NTriplesUtil.parseIRI(properties.find(p => p.name == "baseURI").value);
        return contribution;
    }

    showDetails(contribution: StoredContribution) {
        let _options: ModalOptions = new ModalOptions("lg");
        let modalRef: NgbModalRef;
        if (contribution instanceof DevResourceStoredContribution) {
            modalRef = this.modalService.open(DevelopmentContributionDetailsModal, _options);
        } else if (contribution instanceof MetadataStoredContribution) {
            modalRef = this.modalService.open(MetadataContributionDetailsModal, _options);
        } else if (contribution instanceof StableResourceStoredContribution) {
            modalRef = this.modalService.open(StableContributionDetailsModal, _options);
        }
        modalRef.componentInstance.contribution = contribution;
    }

    approveContribution(contribution: StoredContribution) {
        if (contribution instanceof StableResourceStoredContribution) {
            let _options: ModalOptions = new ModalOptions("lg");
            let modalRef: NgbModalRef;
            modalRef = this.modalService.open(StableProjectCreationModal, _options);
            modalRef.componentInstance.contribution = contribution;
            modalRef.result.then(
                () => { //modal closed via "OK" button => contribution approved and removed => remove the contribution
                    this.contributions.splice(this.contributions.indexOf(contribution), 1);
                },
                () => { }
            );
        } else if (contribution instanceof DevResourceStoredContribution) {
            let _options: ModalOptions = new ModalOptions("lg");
            let modalRef: NgbModalRef;
            modalRef = this.modalService.open(DevProjectCreationModal, _options);
            modalRef.componentInstance.contribution = contribution;
            modalRef.result.then(
                () => { //modal closed via "OK" button => contribution approved and removed => remove the contribution
                    this.contributions.splice(this.contributions.indexOf(contribution), 1);
                },
                () => { }
            );
        } else if (contribution instanceof MetadataStoredContribution) {
            this.basicModals.confirm({ key: "CONTRIBUTIONS.ACTIONS.APPROVE_CONTRIBUTION" }, { key: "MESSAGES.ACCEPT_METADATA_CONTRIBUTION_CONFIRM" }, ModalType.warning).then(
                () => {
                    contribution['loading'] = true;
                    this.svService.approveMetadataContribution(contribution[StoredContribution.RELATIVE_REFERENCE]).pipe(
                        finalize(() => { contribution['loading'] = false; })
                    ).subscribe(
                        () => {
                            this.contributions.splice(this.contributions.indexOf(contribution), 1);
                        }
                    );
                },
                () => { }
            );
        }

    }

    rejectContribution(contribution: StoredContribution) {
        this.basicModals.confirm({ key: "CONTRIBUTIONS.ACTIONS.REJECT_CONTRIBUTION" }, { key: "MESSAGES.REJECT_CONTRIBUTION_CONFIRM" }, ModalType.warning).then(
            () => {
                contribution['loading'] = true;
                this.svService.rejectContribution(contribution[StoredContribution.RELATIVE_REFERENCE]).pipe(
                    finalize(() => { contribution['loading'] = false; })
                ).subscribe(
                    () => {
                        this.contributions.splice(this.contributions.indexOf(contribution), 1);
                    }
                );
            },
            () => { }
        );
    }

}