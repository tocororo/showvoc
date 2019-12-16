import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransitiveImportMethodAllowance } from 'src/app/models/Metadata';
import { ExtensionFactory, ExtensionPointID, Settings, PluginSpecification } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { DataFormat } from 'src/app/models/RDFFormat';
import { ExtensionsServices } from 'src/app/services/extensions.service';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
    selector: "load-data-modal",
    templateUrl: "./load-data-modal.html",
})
export class LoadDataModal {

    @Input() project: Project;

    loading: boolean;

    baseURI: string;
    useProjectBaseURI: boolean = true;

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

    constructor(public activeModal: NgbActiveModal, private extensionService: ExtensionsServices, private inputOutputService: InputOutputServices,
        private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.baseURI = this.project.getBaseURI();
        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                this.lifters = extensions;
            }
        );
    }

    // onBaseUriCheckboxChange() {
    //     if (this.useProjectBaseURI) {
    //         this.baseURI = this.project.getBaseURI();
    //     }
    // }

    changeUseProjectBaseUri() {
        this.useProjectBaseURI = !this.useProjectBaseURI;
        if (this.useProjectBaseURI) {
            this.baseURI = this.project.getBaseURI();
        }
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
                    extList.push("." + this.inputFormats[i].defaultFileExtension);
                    if (this.inputFormats[i].name == "RDF/XML") {
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

    ok() {
        if (this.baseURI == null || this.baseURI.trim() == "") {
            this.basicModals.alert("Load Data", "BaseURI required", ModalType.warning);
            return;
        }

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

        PMKIContext.setTempProject(this.project);
        this.inputOutputService.loadRDF(this.project.getBaseURI(), this.selectedImportAllowance, this.file, this.selectedInputFormat.name, null, rdfLifterSpec).subscribe(
            () => {
                PMKIContext.removeTempProject();
                this.activeModal.close();
            }
        );
    }

    close() {
        this.activeModal.dismiss();
    }

}