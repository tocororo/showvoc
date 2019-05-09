import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpManager } from '../utils/HttpManager';
import { AuthServices } from "./auth.service";
import { ExportServices } from './export.service';
import { GlobalSearchServices } from './global-search.service';
import { OntoLexLemonServices } from './ontolex-lemon.service';
import { PreferencesSettingsServices } from './preferences-settings.service';
import { ProjectsServices } from './projects.service';
import { PropertiesServices } from './properties.service';
import { ResourceViewServices } from './resource-view.service';
import { ResourcesServices } from './resources.service';
import { SearchServices } from './search.service';
import { SkosServices } from './skos.service';
import { UserServices } from './user.service';

@NgModule({
    imports: [HttpClientModule],
    declarations: [],
    exports: [],
    providers: [
        HttpManager,
        AuthServices,
        ExportServices,
        GlobalSearchServices,
        OntoLexLemonServices,
        PreferencesSettingsServices,
        ProjectsServices,
        PropertiesServices,
        ResourcesServices,
        ResourceViewServices,
        SearchServices,
        SkosServices,
        UserServices
    ]
})
export class STServicesModule { }