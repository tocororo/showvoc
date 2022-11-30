import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './administration/admin-dashboard.component';
import { HttpResolutionComponent } from './administration/http-resolution/http-resolution.component';
import { ProjectsManagerComponent } from './administration/projects-manager/projects-manager.component';
import { InitialConfigurationComponent } from './administration/system-configuration/initial-configuration.component';
import { SystemConfigurationComponent } from './administration/system-configuration/system-configuration.component';
import { AlignmentsComponent } from './alignments/alignments.component';
import { ContributionsManagerComponent } from './contribution/administration/contributions-manager.component';
import { ContributionComponent } from './contribution/contribution.component';
import { LoadDevResourceComponent } from './contribution/development/load-dev.component';
import { LoadStableResourceComponent } from './contribution/stable/load-stable.component';
import { CustomServiceRouterComponent } from './custom-services/custom-service-router.component';
import { DataComponent } from './datasets/data.component';
import { DatasetDataComponent } from './datasets/data/dataset-data.component';
import { DatasetViewComponent } from './datasets/dataset-view/dataset-view.component';
import { DatasetsPageComponent } from './datasets/datasets-page/datasets-page.component';
import { MetadataComponent } from './datasets/metadata/metadata.component';
import { SparqlComponent } from './datasets/sparql/sparql.component';
import { HomeComponent } from './home/home.component';
import { MetadataRegistryComponent } from './metadata-registry/metadata-registry.component';
import { NotFoundComponent } from './not-found.component';
import { SearchComponent } from './search/search.component';
import { TranslationComponent } from './translation/translation.component';
import { LoginComponent } from './user/login.component';
import { RegistrationComponent } from './user/registration.component';
import { ResetPasswordComponent } from './user/reset-password.component';
import { UserProfileComponent } from './user/user-profile.component';
import { AdminAuthGuard, ProjectGuard, SuperUserAuthGuard, SystemSettingsGuard, VisitorAuthGuard } from './utils/CanActivateGuards';

const routes: Routes = [
    { path: '', canActivate: [SystemSettingsGuard], children: [ //this empty parent route is needed in order to apply the SystemSettingsGuard to the whole application
        { path: '', redirectTo: "/home", pathMatch: 'full' },
        { path: "home", component: HomeComponent, canActivate: [VisitorAuthGuard], runGuardsAndResolvers: 'always' }, //VisitorAuthGuard needed in order to redirect to the registration page if no user is registered
        { path: "data", component: DataComponent, canActivate: [VisitorAuthGuard] },
        { path: "login", component: LoginComponent },
        { path: "registration", component: RegistrationComponent },
        { path: "profile", component: UserProfileComponent, canActivate: [SuperUserAuthGuard] },
        {
            path: 'admin', component: AdminDashboardComponent, canActivate: [SuperUserAuthGuard],
            children: [
                { path: '', redirectTo: "projects", pathMatch: 'full' },
                { path: 'projects', component: ProjectsManagerComponent },
                { path: 'contributions', component: ContributionsManagerComponent, canActivate: [AdminAuthGuard] },
                { path: 'config', component: SystemConfigurationComponent, canActivate: [AdminAuthGuard] },
                { path: 'http-res', component: HttpResolutionComponent, canActivate: [AdminAuthGuard] },
                { path: 'mdr', component: MetadataRegistryComponent, canActivate: [AdminAuthGuard] },
            ]
        },
        { path: "sysconfig", component: InitialConfigurationComponent, canActivate: [AdminAuthGuard] },
        { path: "contribution", component: ContributionComponent, canActivate: [VisitorAuthGuard] },
        { path: "load/stable/:token", component: LoadStableResourceComponent, canActivate: [VisitorAuthGuard] },
        { path: "load/dev/:format/:token", component: LoadDevResourceComponent, canActivate: [VisitorAuthGuard] },
        { path: "ResetPassword/:token", component: ResetPasswordComponent },
        { path: 'datasets', component: DatasetsPageComponent, canActivate: [VisitorAuthGuard], data: { reuseComponent: true } },
        {
            path: 'datasets/:id', component: DatasetViewComponent, canActivate: [ProjectGuard], //ProjectGuard implicitly requires VisitorAuthGuard
            children: [
                { path: '', redirectTo: "data", pathMatch: 'full' },
                { path: 'metadata', component: MetadataComponent, data: { reuseComponent: true } },
                { path: 'data', component: DatasetDataComponent, data: { reuseComponent: true } },
                { path: 'sparql', component: SparqlComponent, data: { reuseComponent: true } },
                { path: "custom-services", component: CustomServiceRouterComponent, canActivate: [SuperUserAuthGuard] },
            ]
        },
        { path: 'search', component: SearchComponent, canActivate: [VisitorAuthGuard], data: { reuseComponent: true } },
        { path: 'translation', component: TranslationComponent, canActivate: [VisitorAuthGuard], data: { reuseComponent: true } },
        { path: 'alignments', component: AlignmentsComponent, canActivate: [VisitorAuthGuard] },
        { path: '**', component: NotFoundComponent },
    ]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
