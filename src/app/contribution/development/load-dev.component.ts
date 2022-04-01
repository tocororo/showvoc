import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { TransitiveImportMethodAllowance } from 'src/app/models/Metadata';
import { ExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from 'src/app/models/Plugins';
import { ShowVocConversionFormat } from 'src/app/models/ShowVoc';
import { DataFormat } from 'src/app/models/RDFFormat';
import { ExtensionsServices } from 'src/app/services/extensions.service';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { ShowVocServices } from 'src/app/services/showvoc.service';

@Component({
    selector: 'load-dev',
    templateUrl: './load-dev.component.html',
    host: { class: "pageComponent" }
})
export class LoadDevResourceComponent {

    private token: string;
    private conversionFormat: string;

    private readonly zThesExtensionId: string = "it.uniroma2.art.semanticturkey.extension.impl.rdflifter.zthesdeserializer.ZthesDeserializingLifter";
    private readonly rdfExtensionId: string = "it.uniroma2.art.semanticturkey.extension.impl.rdflifter.rdfdeserializer.RDFDeserializingLifter";
    private readonly tbxExtensionId: string = "it.uniroma2.art.showvoc.tbx.TBXRDFLifter";

    loading: boolean = false;

    projectName: string;
    contributorEmail: string;
    file: File;
    filePickerAccept: string;

    inputFormats: DataFormat[];
    selectedInputFormat: DataFormat;

    importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.nowhere, show: "Do not resolve" },
        { allowance: TransitiveImportMethodAllowance.web, show: "From Web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "From Web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "From Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "From Ontology Mirror with fallback to Web" }
    ];
    selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    //lifters
    lifters: ExtensionFactory[];
    selectedLifterExtension: ExtensionFactory;
    selectedLifterConfig: Settings;

    constructor(private svService: ShowVocServices, private inputOutputService: InputOutputServices, private extensionService: ExtensionsServices,
        private basicModals: BasicModalsServices, private activeRoute: ActivatedRoute, private router: Router,
        private translateService: TranslateService) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];
        this.conversionFormat = this.activeRoute.snapshot.params['format'];

        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                //allow only the lifter compliant with the conversionFormat
                this.lifters = [];
                let extensionToSelect: string;
                if (this.conversionFormat == ShowVocConversionFormat.RDF) {
                    extensionToSelect = this.rdfExtensionId;
                } else if (this.conversionFormat == ShowVocConversionFormat.TBX) {
                    extensionToSelect = this.tbxExtensionId;
                } else if (this.conversionFormat == ShowVocConversionFormat.ZTHES) {
                    extensionToSelect = this.zThesExtensionId;
                }
                this.lifters = [extensions.find(e => e.id == extensionToSelect)];
            }
        );
    }

    onLifterExtensionUpdated(ext: ExtensionFactory) {
        this.selectedLifterExtension = ext;
        this.inputOutputService.getSupportedFormats(this.selectedLifterExtension.id).subscribe(
            formats => {
                this.inputFormats = formats;
                this.selectedInputFormat = this.inputFormats.find(f => f.name == "RDF/XML"); //select rdf/xml as default choice

                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                this.inputFormats.forEach(f => {
                    f.fileExtensions.forEach(ext => {
                        extList.push("." + ext);
                    })
                });
                //remove duplicated extensions
                extList = extList.filter((item: string, pos: number) => extList.indexOf(item) == pos);
                this.filePickerAccept = extList.join(",");
            }
        )
    }

    fileChangeEvent(file: File) {
        this.file = file;
        if (this.conversionFormat == ShowVocConversionFormat.RDF) {
            this.inputOutputService.getParserFormatForFileName(file.name).subscribe(
                format => {
                    if (format != null) {
                        for (var i = 0; i < this.inputFormats.length; i++) {
                            if (this.inputFormats[i].name == format) {
                                this.selectedInputFormat = this.inputFormats[i];
                                return;
                            }
                        }
                    }
                }
            );
        }
    }

    allowImportAllowanceSelection(): boolean {
        return this.conversionFormat == ShowVocConversionFormat.RDF;
    }

    load() {
        let rdfLifterSpec: PluginSpecification = {
            factoryId: this.selectedLifterExtension.id,
        }
        if (this.selectedLifterConfig != null) {
            if (this.selectedLifterConfig.requireConfiguration()) {
                this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, {key:"MESSAGES.LIFTER_NOT_CONFIGURED"}, ModalType.warning);
                return;
            }
            rdfLifterSpec.configType = this.selectedLifterConfig.type;
            rdfLifterSpec.configuration = this.selectedLifterConfig.getPropertiesAsMap();
        }

        this.loading = true;
        this.svService.loadDevContributionData(this.token, this.projectName, this.contributorEmail, this.file, 
            this.selectedInputFormat.name, rdfLifterSpec, this.selectedImportAllowance).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            () => {
                let message: string = this.translateService.instant("MESSAGES.DATA_LOADED");
                if (this.conversionFormat != ShowVocConversionFormat.EXCEL) {
                    message += " " + this.translateService.instant("MESSAGES.YOU_WILL_RECIEVE_EMAIL_FOR_ACCESS_VB");
                }
                this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, message).then(
                    () => {
                        this.router.navigate(["/home"]);
                    }
                )
            }
        )
    }


}