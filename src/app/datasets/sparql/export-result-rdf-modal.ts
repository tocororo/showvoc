import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { RDFFormat } from 'src/app/models/RDFFormat';
import { ExportServices } from 'src/app/services/export.service';
import { SparqlServices } from 'src/app/services/sparql.service';

@Component({
	selector: 'export-result-rdf-modal',
	templateUrl: './export-result-rdf-modal.html'
})
export class ExportResultRdfModal {

    @Input() query: string;
    @Input() inferred: boolean;

    exportFormats: RDFFormat[];
    selectedExportFormat: RDFFormat;

    loading: boolean = false;
    
    constructor(public activeModal: NgbActiveModal, private exportService: ExportServices, private sparqlService: SparqlServices,
        private basicModals: BasicModalsServices) { }
    
    ngOnInit() {
        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.exportFormats = formats;
                //select RDF/XML as default
                for (var i = 0; i < this.exportFormats.length; i++) {
                    if (this.exportFormats[i].name == "RDF/XML") {
                        this.selectedExportFormat = this.exportFormats[i];
                        return;
                    }
                }
            }
        );
    }

	ok() {
        this.loading = true;
        this.sparqlService.exportGraphQueryResultAsRdf(this.query, this.selectedExportFormat, this.inferred).subscribe(
            blob => {
                this.loading = false;
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink("SPARQL.ACTIONS.EXPORT_RESULTS", null, exportLink, "sparql_export." + this.selectedExportFormat.defaultFileExtension);
            }
        );
		this.activeModal.close();
	}

	close() {
		this.activeModal.dismiss();
	}

}
