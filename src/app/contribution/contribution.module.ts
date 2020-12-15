import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetModule } from '../widget/widget.module';
import { ContributionsManagerComponent } from './administration/contributions-manager.component';
import { ContributionComponent } from './contribution.component';
import { DevelopmentContributionDetailsModal } from './development/development-contribution-details-modal';
import { DevelopmentContributionComponent } from './development/development-contribution.component';
import { DevProjectCreationModal } from './development/development-project-creation-modal';
import { LoadDevResourceComponent } from './development/load-dev.component';
import { MetadataContributionDetailsModal } from './metadata/metadata-contribution-details-modal';
import { MetadataContributionComponent } from './metadata/metadata-contribution.component';
import { LoadStableResourceComponent } from './stable/load-stable.component';
import { StableContributionDetailsModal } from './stable/stable-contribution-details-modal';
import { StableContributionComponent } from './stable/stable-contribution.component';
import { StableProjectCreationModal } from './stable/stable-project-creation-modal';

@NgModule({
    declarations: [
        ContributionComponent,
        ContributionsManagerComponent,
        DevelopmentContributionComponent,
        DevelopmentContributionDetailsModal,
        DevProjectCreationModal,
        LoadDevResourceComponent,
        LoadStableResourceComponent,
        MetadataContributionComponent,
        MetadataContributionDetailsModal,
        StableContributionComponent,
        StableContributionDetailsModal,
        StableProjectCreationModal,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        WidgetModule,
    ],
    exports: [
        ContributionsManagerComponent
    ],
    providers: [],
    entryComponents: [
        DevelopmentContributionDetailsModal,
        DevProjectCreationModal,
        MetadataContributionDetailsModal,
        StableContributionDetailsModal,
        StableProjectCreationModal,
    ]
})
export class ContributionModule { }
