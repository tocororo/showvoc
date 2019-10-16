import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { Project } from 'src/app/models/Project';
import { RDFFormat } from 'src/app/models/RDFFormat';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { PmkiServices } from 'src/app/services/pmki.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
    selector: 'load-data',
    templateUrl: './load-data.component.html',
    host: { class: "pageComponent" }
})
export class LoadDataComponent {

    private token: string;

    projectName: string;
    file: File;

    rdfFormats: RDFFormat[];
    selectedFormat: RDFFormat;
    filePickerAccept: string;

    constructor(private inputOutputService: InputOutputServices, private pmkiService: PmkiServices, private basicModals: BasicModalsServices,
        private activeRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];
        //TODO get basic contribution info from the token (resource name and baseURI)

        this.inputOutputService.getInputRDFFormats().subscribe(
            formats => {
                this.rdfFormats = formats;

                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                this.rdfFormats.forEach(f => {
                    if (f.name == "RDF/XML") { //set rdf as default
                        this.selectedFormat = f;
                    }
                    f.fileExtensions.forEach(ext => {
                        extList.push("."+ext);
                    })
                })
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
                    for (var i = 0; i < this.rdfFormats.length; i++) {
                        if (this.rdfFormats[i].name == format) {
                            this.selectedFormat = this.rdfFormats[i];
                            return;
                        }
                    }
                }
            }
        );
    }

    load() {
        PMKIContext.setTempProject(new Project(this.projectName));
        this.pmkiService.loadStableContributionData(this.token, this.projectName, this.file, this.selectedFormat.name).subscribe(
            () => {
                PMKIContext.removeTempProject();
                this.basicModals.alert("Load data", "Data loaded successfully").then(
                    () => {
                        this.router.navigate(["/home"]);
                    }
                )
            }
        )
    }


}