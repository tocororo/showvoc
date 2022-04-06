import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { TransitiveImportMethodAllowance } from 'src/app/models/Metadata';
import { ExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from 'src/app/models/Plugins';
import { Project } from 'src/app/models/Project';
import { DataFormat } from 'src/app/models/RDFFormat';
import { ExtensionsServices } from 'src/app/services/extensions.service';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { ShowVocServices } from 'src/app/services/showvoc.service';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: 'load-stable',
    templateUrl: './load-stable.component.html',
    host: { class: "pageComponent" }
})
export class LoadStableResourceComponent {

    private token: string;

    private readonly rdfExtensionId: string = "it.uniroma2.art.semanticturkey.extension.impl.rdflifter.rdfdeserializer.RDFDeserializingLifter";

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

    constructor(private inputOutputService: InputOutputServices, private extensionService: ExtensionsServices,
        private svService: ShowVocServices, private basicModals: BasicModalsServices,
        private activeRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];

        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                //allow only the rdf lifter
                this.lifters = [];
                this.lifters = [extensions.find(e => e.id == this.rdfExtensionId)];
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

    load() {
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

        this.loading = true;
        SVContext.setTempProject(new Project(this.projectName));
        this.svService.loadStableContributionData(this.token, this.projectName, this.contributorEmail, this.file,
            this.selectedInputFormat.name, rdfLifterSpec, this.selectedImportAllowance).pipe(
                finalize(() => { this.loading = false; })
            ).subscribe(
                () => {
                    SVContext.removeTempProject();
                    this.basicModals.alert({ key: "ADMINISTRATION.DATASETS.MANAGEMENT.LOAD_DATA" }, { key: "MESSAGES.DATA_LOADED" }).then(
                        () => {
                            this.router.navigate(["/home"]);
                        }
                    );
                }
            );
    }


}