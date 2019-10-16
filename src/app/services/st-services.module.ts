import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpManager } from '../utils/HttpManager';
import { AdministrationServices } from './administration.service';
import { AlignmentServices } from './alignment.service';
import { AuthServices } from "./auth.service";
import { ConfigurationsServices } from './configuration.service';
import { ExportServices } from './export.service';
import { ExtensionsServices } from './extensions.service';
import { GlobalSearchServices } from './global-search.service';
import { GraphServices } from './graph.service';
import { InputOutputServices } from './input-output.service';
import { MapleServices } from './maple.service';
import { MetadataRegistryServices } from './metadata-registry.service';
import { MetadataServices } from './metadata.service';
import { OntoLexLemonServices } from './ontolex-lemon.service';
import { PmkiServices } from './pmki.service';
import { PreferencesSettingsServices } from './preferences-settings.service';
import { ProjectsServices } from './projects.service';
import { PropertiesServices } from './properties.service';
import { ResourceViewServices } from './resource-view.service';
import { ResourcesServices } from './resources.service';
import { SearchServices } from './search.service';
import { SkosServices } from './skos.service';
import { SparqlServices } from './sparql.service';
import { UserServices } from './user.service';

@NgModule({
    imports: [HttpClientModule],
    declarations: [],
    exports: [],
    providers: [
        AdministrationServices,
        AlignmentServices,
        AuthServices,
        ConfigurationsServices,
        ExportServices,
        ExtensionsServices,
        GlobalSearchServices,
        GraphServices,
        HttpManager,
        InputOutputServices,
        MapleServices,
        MetadataServices,
        MetadataRegistryServices,
        OntoLexLemonServices,
        PmkiServices,
        PreferencesSettingsServices,
        ProjectsServices,
        PropertiesServices,
        ResourcesServices,
        ResourceViewServices,
        SearchServices,
        SkosServices,
        SparqlServices,
        UserServices
    ]
})
export class STServicesModule { }