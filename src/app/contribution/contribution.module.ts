import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContributionsManagerComponent } from './administration/contributions-manager.component';
import { ContributionProjectCreationModal } from './contribution-project-creation-modal';
import { ContributionComponent } from './contribution.component';
import { DevelopmentContributionDetailsModal } from './development/development-contribution-details-modal';
import { DevelopmentContributionComponent } from './development/development-contribution.component';
import { MetadataContributionDetailsModal } from './metadata/metadata-contribution-details-modal';
import { MetadataContributionComponent } from './metadata/metadata-contribution.component';
import { StableContributionDetailsModal } from './stable/stable-contribution-details-modal';
import { StableContributionComponent } from './stable/stable-contribution.component';

@NgModule({
    declarations: [
        ContributionComponent,
        ContributionsManagerComponent,
        ContributionProjectCreationModal,
        DevelopmentContributionComponent,
        DevelopmentContributionDetailsModal,
        MetadataContributionComponent,
        MetadataContributionDetailsModal,
        StableContributionComponent,
        StableContributionDetailsModal
    ],
    imports: [
        CommonModule,
        FormsModule,
    ],
    exports: [
        ContributionsManagerComponent
    ],
    providers: [],
    entryComponents: [
        ContributionProjectCreationModal,
        DevelopmentContributionDetailsModal,
        MetadataContributionDetailsModal,
        StableContributionDetailsModal,
    ]
})
export class ContributionModule { }
