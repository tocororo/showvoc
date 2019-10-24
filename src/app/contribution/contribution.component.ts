import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { ContributionType } from '../models/Contribution';
import { UserForm } from '../models/User';
import { ConfigurationsServices } from '../services/configuration.service';
import { PmkiServices } from '../services/pmki.service';
import { AbstractContributionComponent } from './abstract-contribution.component';
import { DevelopmentContributionComponent } from './development/development-contribution.component';
import { MetadataContributionComponent } from './metadata/metadata-contribution.component';
import { StableContributionComponent } from './stable/stable-contribution.component';

@Component({
    selector: 'contribution-component',
    templateUrl: './contribution.component.html',
    host: { class: "pageComponent" }
})
export class ContributionComponent {

    @ViewChild(DevelopmentContributionComponent) conversionContributionComponentImpl: DevelopmentContributionComponent;
    @ViewChild(MetadataContributionComponent) metadataContributionComponentImpl: MetadataContributionComponent;
    @ViewChild(StableContributionComponent) rdfContributionComponentImpl: StableContributionComponent;
    private activeContribComponentImpl: AbstractContributionComponent;

    loading: boolean = false;

    name: string;
    lastName: string;
    email: string;
    organization: string;

    contributionOpts: { type: ContributionType, show: string }[] = [
        { type: ContributionType.metadata, show: "I want to provide metadata about an existing resource on the web"},
        { type: ContributionType.stable, show: "I want to contribute an existing RDF dataset"},
        { type: ContributionType.development, show: "I want to contribute a resource needing some editing before being published (conversion of some non-RDF formats is also available)"},
    ];
    selectedContribution: ContributionType;


    constructor(private configurationsService: ConfigurationsServices, private pmkiServices: PmkiServices,
        private basicModals: BasicModalsServices, private router: Router) { }

    submit() {
        //check mandatory fields in the current page
        let missingField: string;
        if (this.name == null) {
            missingField = "Name";
        } else if (this.lastName == null) {
            missingField = "Last name";
        } else if (this.email == null) {
            missingField = "Email";
        }
        if (missingField != null) {
            this.basicModals.alert("Incomplete form", "Missing mandatory field '" + missingField + "'", ModalType.warning);
            return;
        }
        if (!UserForm.isValidEmail(this.email)) {
            this.basicModals.alert("Invalid email", this.email + " is not a valid email address.", ModalType.warning);
            return;
        }

        let config: {[key: string]: any} = {};
        config['contributorName'] = this.name;
        config['contributorLastName'] = this.lastName;
        config['contributorEmail'] = this.email;
        config['contributorOrganization'] = this.organization;

        if (this.selectedContribution == ContributionType.metadata) {
            this.activeContribComponentImpl = this.metadataContributionComponentImpl;
        } else if (this.selectedContribution == ContributionType.stable) {
            this.activeContribComponentImpl = this.rdfContributionComponentImpl;
        } else if (this.selectedContribution == ContributionType.development) {
            this.activeContribComponentImpl = this.conversionContributionComponentImpl;
        }

        //get the configuration of the contribution component and merge with the current page config
        let contributionImplConfig: {[key: string]: any} = this.activeContribComponentImpl.getConfiguration();
        if (contributionImplConfig == null) { //in case of missing mandatory fields in the child component, getConfiguration returns null
            return;
        }
        config = { ...config, ...contributionImplConfig }; //merge
        
        this.loading = true;
        this.pmkiServices.submitContribution(config).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            () => {
                this.basicModals.alert("Request submitted", "Your contribution request has been succesfully submitted. " + 
                    "It will be evaluated by the administrator and you will receive the response to the provided email").then(
                    () => {
                        this.router.navigate(["/home"]);
                    }
                );
            }
        );
    }

}