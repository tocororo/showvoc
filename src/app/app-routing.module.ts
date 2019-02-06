import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DatasetsComponent } from './datasets/datasets.component';
import { SearchComponent } from './search/search.component';
import { MappingsComponent } from './mappings/mappings.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'datasets', component: DatasetsComponent },
  { path: 'search', component: SearchComponent },
  { path: 'mappings', component: MappingsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
