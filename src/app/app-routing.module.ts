import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatasetDataComponent } from './datasets/data/dataset-data.component';
import { DatasetViewComponent } from './datasets/dataset-view/dataset-view.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { SparqlComponent } from './datasets/sparql/sparql.component';
import { HomeComponent } from './home/home.component';
import { MappingsComponent } from './mappings/mappings.component';
import { NotFoundComponent } from './not-found.component';
import { SearchComponent } from './search/search.component';
import { ProjectGuard } from './utils/CanActivateGuards';

const routes: Routes = [
    { path: '', redirectTo: "/home", pathMatch: 'full' },
    { path: "home", component: HomeComponent },
    { path: 'datasets', component: DatasetsComponent },
    {
        path: 'datasets/:id', component: DatasetViewComponent, canActivate: [ProjectGuard],
        children: [
            { path: '', redirectTo: "data", pathMatch: 'full' },
            { path: 'data', component: DatasetDataComponent },
            { path: 'sparql', component: SparqlComponent }
        ]
    },
    { path: 'search', component: SearchComponent },
    { path: 'mappings', component: MappingsComponent },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
