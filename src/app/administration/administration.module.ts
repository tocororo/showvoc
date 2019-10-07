import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContributionModule } from '../contribution/contribution.module';
import { AdminDashboardComponent } from './admin-dashboard.component';

@NgModule({
    declarations: [
        AdminDashboardComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ContributionModule
    ],
    exports: [],
    providers: [],
    entryComponents: []
})
export class AdministrationModule { }
