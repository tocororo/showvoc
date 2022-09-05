import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AdministrationModule } from './administration/administration.module';
import { AlignmentsModule } from './alignments/alignments.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContributionModule } from './contribution/contribution.module';
import { CustomServicesModule } from './custom-services/custom-services.module';
import { CustomReuseStrategy } from './CustomReuseStrategy';
import { DatasetsModule } from './datasets/datasets.module';
import { GraphModule } from './graph/graph.module';
import { HomeComponent } from './home/home.component';
import { MetadataRegistryModule } from './metadata-registry/metadata-registry.module';
import { ModalsModule } from './modal-dialogs/modals.module';
import { NotFoundComponent } from './not-found.component';
import { PreferencesModule } from './preferences/preferences.module';
import { SearchModule } from './search/search.module';
import { STServicesModule } from './services/st-services.module';
import { UserModule } from './user/user.module';
import { GUARD_PROVIDERS } from './utils/CanActivateGuards';
import { DatatypeValidator } from './utils/DatatypeValidator';
import { SVEventHandler } from './utils/SVEventHandler';
import { SVProperties } from './utils/SVProperties';
import { WidgetModule } from './widget/widget.module';

// export function HttpLoaderFactory(http: HttpClient) {
//     return new TranslateHttpLoader(http, "./assets/l10n/");
// }
/*
The above is the configuration written in the doc (https://github.com/ngx-translate/core#configuration),
but I had to rewrite it as follow since it gave the eslint issue:
"Expected a function expression. eslint (func-style)"
*/
let HttpLoaderFactory = (http: HttpClient) => {
    return new TranslateHttpLoader(http, "./assets/l10n/");
};

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
        BrowserAnimationsModule,
        BrowserModule,
        ContributionModule,
        CustomServicesModule,
        DatasetsModule,
        GraphModule,
        MetadataRegistryModule,
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
        UserModule,
        WidgetModule
    ],
    providers: [
        DatatypeValidator, SVProperties, SVEventHandler,
        GUARD_PROVIDERS,
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
        /** Uses the HashLocationStrategy instead of the default "HTML 5 pushState" PathLocationStrategy.
         * This solves the 404 error problem when reloading a page in a production server
         */
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
