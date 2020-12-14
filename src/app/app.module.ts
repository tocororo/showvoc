import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AdministrationModule } from './administration/administration.module';
import { AlignmentsModule } from './alignments/alignments.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContributionModule } from './contribution/contribution.module';
import { CustomReuseStrategy } from './CustomReuseStrategy';
import { DatasetsModule } from './datasets/datasets.module';
import { GraphModule } from './graph/graph.module';
import { HomeComponent } from './home/home.component';
import { ModalsModule } from './modal-dialogs/modals.module';
import { NotFoundComponent } from './not-found.component';
import { PreferencesModule } from './preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { STServicesModule } from './services/st-services.module';
import { UserModule } from './user/user.module';
import { AdminAuthGuard, VisitorAuthGuard } from './utils/CanActivateAuthGuards';
import { ProjectGuard } from './utils/CanActivateProjectGuard';
import { PMKIEventHandler } from './utils/PMKIEventHandler';
import { PMKIProperties } from './utils/PMKIProperties';

export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, "./assets/i18n/");
}

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        NotFoundComponent
    ],
    imports: [
        AdministrationModule,
        AlignmentsModule,
        AppRoutingModule,
        BrowserModule,
        ContributionModule,
        DatasetsModule,
        GraphModule,
        ModalsModule,
        NgbModule,
        PreferencesModule,
        SearchModule,
        STServicesModule,
        TranslateModule.forRoot({
			defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        UserModule
    ],
    providers: [
        PMKIProperties, PMKIEventHandler,
        VisitorAuthGuard, AdminAuthGuard, ProjectGuard,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
		/** Uses the HashLocationStrategy instead of the default "HTML 5 pushState" PathLocationStrategy.
		 * This solves the 404 error problem when reloading a page in a production server
		 */
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
