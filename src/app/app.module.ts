import { HashLocationStrategy, LocationStrategy } from '@angular/common';
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
import { NotFoundComponent } from './not-found.component';
import { SearchModule } from './search/search.module';
import { ModalsModule } from './modal-dialogs/modals.module';


@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		NotFoundComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		NgbModule,

		DatasetsModule,
		SearchModule,
		MappingsModule,
		ModalsModule
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
		/** Uses the HashLocationStrategy instead of the default "HTML 5 pushState" PathLocationStrategy.
		 * This solves the 404 error problem when reloading a page in a production server
		 */
		{ provide: LocationStrategy, useClass: HashLocationStrategy }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
