import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContributionModule } from '../contribution/contribution.module';
import { WidgetModule } from '../widget/widget.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { SystemConfigurationComponent } from './system-configuration/system-configuration.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
        SystemConfigurationComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ContributionModule,
        WidgetModule
    ],
    exports: [],
    providers: [],
    entryComponents: []
})
export class AdministrationModule { }
