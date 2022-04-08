import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { CheckOptions, ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { TransitiveImportMethodAllowance } from 'src/app/models/Metadata';
import { ExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { DataFormat } from 'src/app/models/RDFFormat';
import { ShowVocConstants } from "src/app/models/ShowVoc";
import { ExtensionsServices } from 'src/app/services/extensions.service';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { ShowVocServices } from "src/app/services/showvoc.service";
import { SVContext } from 'src/app/utils/SVContext';
import { CreateDownloadModal } from "./create-download-modal";

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
        private svService: ShowVocServices, private basicModals: BasicModalsServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.baseURI = this.project.getBaseURI();
        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                //sort extensions in order to force RDFDeserializingLifter in 1st position, so selected as default
                extensions.sort((e1, e2) => {
                    if (e1.id.includes("RDFDeserializingLifter")) {
                        return -1;
                    } else if (e2.id.includes("RDFDeserializingLifter")) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
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
                this.selectedInputFormat = this.inputFormats.find(f => f.name == "RDF/XML"); //select rdf/xml as default choice

                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                this.inputFormats.forEach(f => {
                    f.fileExtensions.forEach(fExt => {
                        extList.push("." + fExt);
                    });
                });
                //remove duplicated extensions
                extList = extList.filter((item: string, pos: number) => extList.indexOf(item) == pos);
                this.filePickerAccept = extList.join(",");
            }
        );
    }

    fileChangeEvent(file: File) {
        this.file = file;
        this.inputOutputService.getParserFormatForFileName(file.name).subscribe(
            format => {
                if (format != null) {
                    for (let i = 0; i < this.inputFormats.length; i++) {
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
            this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, { key: "MESSAGES.BASEURI_REQUIRED" }, ModalType.warning);
            return;
        }

        let rdfLifterSpec: PluginSpecification = {
            factoryId: this.selectedLifterExtension.id,
        };
        if (this.selectedLifterConfig != null) {
            if (this.selectedLifterConfig.requireConfiguration()) {
                this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, { key: "MESSAGES.LIFTER_NOT_CONFIGURED" }, ModalType.warning);
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
                let checkOpt: CheckOptions = {
                    label: { key: "ADMINISTRATION.DATASETS.MANAGEMENT.CREATE_DOWNLOAD" },
                    value: true,
                };
                this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, { key: "MESSAGES.DATA_LOADED" }, null, null, checkOpt).then(
                    (checkOptResult: CheckOptions) => {
                        if (checkOptResult.value) {
                            const modalRef: NgbModalRef = this.modalService.open(CreateDownloadModal, new ModalOptions("lg"));
                            modalRef.componentInstance.project = this.project;
                        }
                        this.activeModal.close();
                    }
                );
            }
        );
    }

    close() {
        this.activeModal.dismiss();
    }

}