import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpManager } from '../utils/HttpManager';
import { StMetadataRegistry } from '../utils/STMetadataRegistry';
import { AdministrationServices } from './administration.service';
import { AlignmentServices } from './alignment.service';
import { AuthServices } from "./auth.service";
import { ClassesServices } from './classes.service';
import { ConfigurationsServices } from './configuration.service';
import { CustomServiceServices } from './custom-service-.service';
import { DatatypesServices } from './datatypesServices';
import { DownloadServices } from './download.service';
import { ExportServices } from './export.service';
import { ExtensionsServices } from './extensions.service';
import { GlobalSearchServices } from './global-search.service';
import { GraphServices } from './graph.service';
import { HttpResolutionServices } from './http-resolution.service';
import { IndividualsServices } from './individuals.service';
import { InputOutputServices } from './input-output.service';
import { InvokableReportersServices } from './invokable-reporters.service';
import { MapleServices } from './maple.service';
import { MetadataRegistryServices } from './metadata-registry.service';
import { MetadataServices } from './metadata.service';
import { OntoLexLemonServices } from './ontolex-lemon.service';
import { ProjectsServices } from './projects.service';
import { PropertiesServices } from './properties.service';
import { RepositoriesServices } from './repositories.service';
import { ResourceViewServices } from './resource-view.service';
import { ResourcesServices } from './resources.service';
import { SearchServices } from './search.service';
import { ServicesServices } from './services.service';
import { SettingsServices } from './settings.service';
import { ShowVocServices } from './showvoc.service';
import { SkosServices } from './skos.service';
import { SparqlServices } from './sparql.service';
import { StorageServices } from './storage.service';
import { UserServices } from './user.service';

@NgModule({
    imports: [HttpClientModule],
    declarations: [],
    exports: [],
    providers: [
        AdministrationServices,
        AlignmentServices,
        AuthServices,
        ClassesServices,
        ConfigurationsServices,
        CustomServiceServices,
        DatatypesServices,
        DownloadServices,
        ExportServices,
        ExtensionsServices,
        GlobalSearchServices,
        GraphServices,
        HttpManager,
        HttpResolutionServices,
        IndividualsServices,
        InputOutputServices,
        InvokableReportersServices,
        MapleServices,
        MetadataServices,
        MetadataRegistryServices,
        OntoLexLemonServices,
        ServicesServices,
        ShowVocServices,
        ProjectsServices,
        PropertiesServices,
        RepositoriesServices,
        ResourcesServices,
        ResourceViewServices,
        SearchServices,
        SettingsServices,
        SkosServices,
        SparqlServices,
        StMetadataRegistry,
        StorageServices,
        UserServices
    ]
})
export class STServicesModule { }