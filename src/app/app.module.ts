import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomReuseStrategy } from './CustomReuseStrategy';
import { DatasetsModule } from './datasets/datasets.module';
import { HomeComponent } from './home/home.component';
import { MappingsModule } from './mappings/mappings.module';
import { SearchModule } from './search/search.module';


@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,

		DatasetsModule,
		SearchModule,
		MappingsModule,
		NgbModule
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
