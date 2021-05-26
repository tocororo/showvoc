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
import { SVContext } from 'src/app/utils/SVContext';
import { ShowVocConstants } from "src/app/models/ShowVoc";
import { ShowVocServices } from "src/app/services/showvoc.service";

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
        private svService: ShowVocServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.baseURI = this.project.getBaseURI();
        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                this.lifters = extensions;
            }
        );
    }

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
            this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, {key:"MESSAGES.BASEURI_REQUIRED"}, ModalType.warning);
            return;
        }

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

        SVContext.setTempProject(this.project);
        this.loading = true;
        this.inputOutputService.loadRDF(this.project.getBaseURI(), this.selectedImportAllowance, this.file, this.selectedInputFormat.name, null, rdfLifterSpec).subscribe(
            () => {
                this.loading = false;
                SVContext.removeTempProject();
                //If the data has been loaded into a pristine project, change its status to staging 
                //(status change pristine->staging happens automatically only when data is loaded through loadStableContributionData() service)
                if (this.project['role'] == ShowVocConstants.rolePristine) { //role is an attribute attached in ProjectsManagerComponent, namely the component that opens this modal)
                    this.svService.setProjectStatus(this.project.getName(), ShowVocConstants.roleStaging).subscribe();
                }
                this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, {key:"MESSAGES.DATA_LOADED"}).then(
                    () => this.activeModal.close()
                )
            }
        );
    }

    close() {
        this.activeModal.dismiss();
    }

}