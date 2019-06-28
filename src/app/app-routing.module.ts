import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlignmentsComponent } from './alignments/alignments.component';
import { DatasetDataComponent } from './datasets/data/dataset-data.component';
import { DatasetViewComponent } from './datasets/dataset-view/dataset-view.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { SparqlComponent } from './datasets/sparql/sparql.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found.component';
import { SearchComponent } from './search/search.component';
import { LoginComponent } from './user/login.component';
import { RegistrationComponent } from './user/registration.component';
import { LurkerAuthGuard, ProjectGuard } from './utils/CanActivateGuards';

const routes: Routes = [
    { path: '', redirectTo: "/home", pathMatch: 'full' },
    { path: "home", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "registration", component: RegistrationComponent },
    { path: 'datasets', component: DatasetsComponent, canActivate: [LurkerAuthGuard] },
    {
        path: 'datasets/:id', component: DatasetViewComponent, canActivate: [LurkerAuthGuard, ProjectGuard],
        children: [
            { path: '', redirectTo: "data", pathMatch: 'full' },
            { path: 'data', component: DatasetDataComponent },
            { path: 'sparql', component: SparqlComponent }
        ]
    },
    { path: 'search', component: SearchComponent, canActivate: [LurkerAuthGuard] },
    { path: 'alignments', component: AlignmentsComponent },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
