import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpManager } from '../utils/HttpManager';
import { AuthServices } from "./auth.service";
import { ExportServices } from './export.service';
import { PreferencesSettingsServices } from './preferences-settings.service';
import { ProjectsServices } from './projects.service';
import { PropertiesServices } from './properties.service';
import { ResourcesServices } from './resources.service';
import { SkosServices } from './skos.service';
import { UserServices } from './user.service';
import { OntoLexLemonServices } from './ontolex-lemon.service';

@NgModule({
    imports: [HttpClientModule],
    declarations: [],
    exports: [],
    providers: [
        HttpManager,
        AuthServices,
        ExportServices,
        OntoLexLemonServices,
        PreferencesSettingsServices,
        ProjectsServices,
        PropertiesServices,
        ResourcesServices,
        SkosServices,
        UserServices
    ]
})
export class STServicesModule { }