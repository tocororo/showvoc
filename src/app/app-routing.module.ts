import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { SearchComponent } from './search/search.component';
import { MappingsComponent } from './mappings/mappings.component';
import { DatasetViewComponent } from './datasets/dataset-view/dataset-view.component';
import { NotFoundComponent } from './not-found.component';

const routes: Routes = [
  { path: '', redirectTo: "/home", pathMatch: 'full' },
  { path: "home", component: HomeComponent },
  { path: 'datasets', component: DatasetsComponent },
  { path: 'datasets/:id', component: DatasetViewComponent },
  { path: 'search', component: SearchComponent },
  { path: 'mappings', component: MappingsComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
