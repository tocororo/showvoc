import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WidgetModule } from '../widget/widget.module';
import { ContributionsManagerComponent } from './administration/contributions-manager.component';
import { ContributionComponent } from './contribution.component';
import { DevelopmentContributionDetailsModal } from './development/development-contribution-details-modal';
import { DevelopmentContributionComponent } from './development/development-contribution.component';
import { LoadDataComponent } from './load-data/load-data.component';
import { MetadataContributionDetailsModal } from './metadata/metadata-contribution-details-modal';
import { MetadataContributionComponent } from './metadata/metadata-contribution.component';
import { StableContributionDetailsModal } from './stable/stable-contribution-details-modal';
import { StableContributionComponent } from './stable/stable-contribution.component';
import { StableProjectCreationModal } from './stable/stable-project-creation-modal';

@NgModule({
    declarations: [
        ContributionComponent,
        ContributionsManagerComponent,
        DevelopmentContributionComponent,
        DevelopmentContributionDetailsModal,
        LoadDataComponent,
        MetadataContributionComponent,
        MetadataContributionDetailsModal,
        StableContributionComponent,
        StableContributionDetailsModal,
        StableProjectCreationModal,
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
        DevelopmentContributionDetailsModal,
        MetadataContributionDetailsModal,
        StableContributionDetailsModal,
        StableProjectCreationModal,
    ]
})
export class ContributionModule { }
