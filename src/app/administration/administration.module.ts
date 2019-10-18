import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContributionModule } from '../contribution/contribution.module';
import { WidgetModule } from '../widget/widget.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { ProjectsManagerComponent } from './projects-manager/projects-manager.component';
import { SystemConfigurationComponent } from './system-configuration/system-configuration.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        ProjectsManagerComponent,
        SystemConfigurationComponent,
    ],
    imports: [
        CommonModule,
        ContributionModule,
        FormsModule,
        NgbDropdownModule,
        RouterModule,
        WidgetModule
    ],
    exports: [],
    providers: [],
    entryComponents: []
})
export class AdministrationModule { }
