import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { TransitiveImportMethodAllowance } from 'src/app/models/Metadata';
import { ExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from 'src/app/models/Plugins';
import { PmkiConversionFormat } from 'src/app/models/Pmki';
import { DataFormat } from 'src/app/models/RDFFormat';
import { ExtensionsServices } from 'src/app/services/extensions.service';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { PmkiServices } from 'src/app/services/pmki.service';

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
    private readonly tbxExtensionId: string = "it.uniroma2.art.pmki.tbx.TBXRDFLifter";

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

    constructor(private pmkiService: PmkiServices, private inputOutputService: InputOutputServices, private extensionService: ExtensionsServices,
        private basicModals: BasicModalsServices, private activeRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];
        this.conversionFormat = this.activeRoute.snapshot.params['format'];

        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                //allow only the lifter compliant with the conversionFormat
                this.lifters = [];
                let extensionToSelect: string;
                if (this.conversionFormat == PmkiConversionFormat.RDF) {
                    extensionToSelect = this.rdfExtensionId;
                } else if (this.conversionFormat == PmkiConversionFormat.TBX) {
                    extensionToSelect = this.tbxExtensionId;
                } else if (this.conversionFormat == PmkiConversionFormat.ZTHES) {
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
                /*
                 * Iterate over the input format for:
                 * - collecting the extensions of the formats, in order to provide them to the file picker
                 * - select a default input format (rdf for the rdf lifter)
                 */
                let extList: string[] = []; 
                let defaultInputFormatIdx: number = 0;
                for (var i = 0; i < this.inputFormats.length; i++) {
                    extList.push("."+this.inputFormats[i].defaultFileExtension);
                    if (this.selectedLifterExtension.id == this.rdfExtensionId && this.inputFormats[i].name == "RDF/XML") {
                        defaultInputFormatIdx = i;
                    }
                }
                this.selectedInputFormat = this.inputFormats[defaultInputFormatIdx];
                //remove duplicated extensions
                extList = extList.filter((item: string, pos: number) => {
                    return extList.indexOf(item) == pos;
                });
                this.filePickerAccept = extList.join(",");
            }
        )
    }

    fileChangeEvent(file: File) {
        this.file = file;
        if (this.conversionFormat == PmkiConversionFormat.RDF) {
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
        return this.conversionFormat == PmkiConversionFormat.RDF;
    }

    load() {
        let rdfLifterSpec: PluginSpecification = {
            factoryId: this.selectedLifterExtension.id,
        }
        if (this.selectedLifterConfig != null) {
            if (this.selectedLifterConfig.requireConfiguration()) {
                this.basicModals.alert("Missing configuration", "The Lifter needs to be configured", ModalType.warning);
                return;
            }
            rdfLifterSpec.configType = this.selectedLifterConfig.type;
            rdfLifterSpec.configuration = this.selectedLifterConfig.getPropertiesAsMap();
        }

        this.loading = true;
        this.pmkiService.loadDevContributionData(this.token, this.projectName, this.contributorEmail, this.file, 
            this.selectedInputFormat.name, rdfLifterSpec, this.selectedImportAllowance).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            () => {
                let message: string = "Data loaded successfully";
                if (this.conversionFormat != PmkiConversionFormat.EXCEL) {
                    message += ". You will soon recieve an email containing details for connecting to the VocBench"
                }
                this.basicModals.alert("Load data", message).then(
                    () => {
                        this.router.navigate(["/home"]);
                    }
                )
            }
        )
    }


}