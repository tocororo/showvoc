import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../widget/widget.module';
import { ContributionsManagerComponent } from './administration/contributions-manager.component';
import { StableProjectCreationModal } from './stable/stable-project-creation-modal';
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
        StableProjectCreationModal,
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
        WidgetModule,
    ],
    exports: [
        ContributionsManagerComponent
    ],
    providers: [],
    entryComponents: [
        StableProjectCreationModal,
        DevelopmentContributionDetailsModal,
        MetadataContributionDetailsModal,
        StableContributionDetailsModal,
    ]
})
export class ContributionModule { }
