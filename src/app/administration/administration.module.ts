import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ContributionModule } from '../contribution/contribution.module';
import { UserModule } from '../user/user.module';
import { WidgetModule } from '../widget/widget.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { ContentNegotiationConfigurationModal } from './http-resolution/content-negotiation-config-modal';
import { HttpResolutionComponent } from './http-resolution/http-resolution.component';
import { InverseRewritingRulesComponent } from './http-resolution/inverse-rewriting-rules.component';
import { RewritingRulesComponent } from './http-resolution/rewriting-rules.component';
import { CreateDownloadModal } from './projects-manager/create-download-modal';
import { CreateProjectModal } from './projects-manager/create-project-modal';
import { LoadDataModal } from './projects-manager/load-data-modal';
import { LoadDownloadModal } from './projects-manager/load-download-modal';
import { ProjectSettingsModal } from './projects-manager/project-settings-modal';
import { ProjectsManagerComponent } from './projects-manager/projects-manager.component';
import { RemoteAccessConfigModal } from './projects-manager/remote-access-config-modal';
import { DeleteRemoteRepoModal } from './projects-manager/remote-repositories/delete-remote-repo-modal';
import { DeleteRemoteRepoReportModal } from './projects-manager/remote-repositories/delete-remote-repo-report-modal';
import { RemoteRepoEditorModal } from './projects-manager/remote-repositories/remote-repo-editor-modal';
import { RemoteRepoSelectionModal } from './projects-manager/remote-repositories/remote-repo-selection-modal';
import { InitialConfigurationComponent } from './system-configuration/initial-configuration.component';
import { SystemConfigurationComponent } from './system-configuration/system-configuration.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        ContentNegotiationConfigurationModal,
        CreateDownloadModal,
        CreateProjectModal,
        DeleteRemoteRepoModal,
        DeleteRemoteRepoReportModal,
        LoadDataModal,
        LoadDownloadModal,
        HttpResolutionComponent,
        InitialConfigurationComponent,
        InverseRewritingRulesComponent,
        ProjectsManagerComponent,
        ProjectSettingsModal,
        RemoteAccessConfigModal,
        RemoteRepoEditorModal,
        RemoteRepoSelectionModal,
        RewritingRulesComponent,
        SystemConfigurationComponent,
    ],
    imports: [
        CommonModule,
        ContributionModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        NgbPopoverModule,
        RouterModule,
        TranslateModule,
        UserModule,
        WidgetModule
    ],
    exports: [],
    providers: [],
    entryComponents: [
        ContentNegotiationConfigurationModal,
        CreateDownloadModal,
        CreateProjectModal,
        DeleteRemoteRepoModal,
        DeleteRemoteRepoReportModal,
        LoadDataModal,
        LoadDownloadModal,
        ProjectSettingsModal,
        RemoteAccessConfigModal,
        RemoteRepoEditorModal,
        RemoteRepoSelectionModal,
    ]
})
export class AdministrationModule { }
