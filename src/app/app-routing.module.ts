import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './administration/admin-dashboard.component';
import { AlignmentsComponent } from './alignments/alignments.component';
import { ContributionComponent } from './contribution/contribution.component';
import { DatasetDataComponent } from './datasets/data/dataset-data.component';
import { DatasetViewComponent } from './datasets/dataset-view/dataset-view.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { SparqlComponent } from './datasets/sparql/sparql.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found.component';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './user/login.component';
import { RegistrationComponent } from './user/registration.component';
import { ResetPasswordComponent } from './user/reset-password.component';
import { VisitorAuthGuard, ProjectGuard, AdminAuthGuard } from './utils/CanActivateGuards';

const routes: Routes = [
    { path: '', redirectTo: "/home", pathMatch: 'full' },
    { path: "home", component: HomeComponent, canActivate: [VisitorAuthGuard] },
    { path: "login", component: LoginComponent },
    { path: "registration", component: RegistrationComponent },
    { path: "admin", component: AdminDashboardComponent, canActivate: [AdminAuthGuard] },
    { path: "contribution", component: ContributionComponent, canActivate: [VisitorAuthGuard] },
    { path: "ResetPassword/:token", component: ResetPasswordComponent },
    { path: 'datasets', component: DatasetsComponent, canActivate: [VisitorAuthGuard] },
    {
        path: 'datasets/:id', component: DatasetViewComponent, canActivate: [VisitorAuthGuard, ProjectGuard],
        children: [
            { path: '', redirectTo: "data", pathMatch: 'full' },
            { path: 'data', component: DatasetDataComponent },
            { path: 'sparql', component: SparqlComponent }
        ]
    },
    { path: 'search', component: SearchComponent, canActivate: [VisitorAuthGuard] },
    { path: 'alignments', component: AlignmentsComponent, canActivate: [VisitorAuthGuard] },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
