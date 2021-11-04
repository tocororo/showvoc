import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ContributionModule } from '../contribution/contribution.module';
import { WidgetModule } from '../widget/widget.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { CreateProjectModal } from './projects-manager/create-project-modal';
import { LoadDataModal } from './projects-manager/load-data-modal';
import { ProjectSettingsModal } from './projects-manager/project-settings-modal';
import { ProjectsManagerComponent } from './projects-manager/projects-manager.component';
import { RemoteAccessConfigModal } from './projects-manager/remote-access-config-modal';
import { DeleteRemoteRepoModal } from './projects-manager/remote-repositories/delete-remote-repo-modal';
import { DeleteRemoteRepoReportModal } from './projects-manager/remote-repositories/delete-remote-repo-report-modal';
import { RemoteRepoSelectionModal } from './projects-manager/remote-repositories/remote-repo-selection-modal';
import { InitialConfigurationComponent } from './system-configuration/initial-configuration.component';
import { SystemConfigurationComponent } from './system-configuration/system-configuration.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        CreateProjectModal,
        DeleteRemoteRepoModal,
        DeleteRemoteRepoReportModal,
        LoadDataModal,
        InitialConfigurationComponent,
        ProjectsManagerComponent,
        ProjectSettingsModal,
        RemoteAccessConfigModal,
        RemoteRepoSelectionModal,
        SystemConfigurationComponent,
    ],
    imports: [
        CommonModule,
        ContributionModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule,
        TranslateModule,
        WidgetModule
    ],
    exports: [],
    providers: [],
    entryComponents: [
        CreateProjectModal,
        DeleteRemoteRepoModal,
        DeleteRemoteRepoReportModal,
        LoadDataModal,
        ProjectSettingsModal,
        RemoteAccessConfigModal,
        RemoteRepoSelectionModal
    ]
})
export class AdministrationModule { }
