import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Observable, of } from "rxjs";
import { catchError, finalize, map, mergeMap } from "rxjs/operators";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from "src/app/modal-dialogs/Modals";
import { Project } from 'src/app/models/Project';
import { RDFFormat } from "src/app/models/RDFFormat";
import { Literal } from "src/app/models/Resources";
import { DownloadServices } from "src/app/services/download.service";
import { SVContext } from "src/app/utils/SVContext";

@Component({
    selector: "create-download-modal",
    templateUrl: "./create-download-modal.html",
})
export class CreateDownloadModal {

    @Input() project: Project;

    fileName: string;

    localized: Literal;

    formats: RDFFormat[];
    format: RDFFormat;

    zipped: boolean = true;

    loading: boolean;

    constructor(public activeModal: NgbActiveModal, private downloadService: DownloadServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.downloadService.getAvailableFormats().subscribe(
            formats => {
                this.formats = formats;
                this.format = this.formats.find(f => f.name == "RDF/XML");
            }
        );
    }

    private createDownload(overwrite: boolean): Observable<boolean> {
        return this.downloadService.createDownload(this.fileName, this.localized.getLabel(), this.localized.getLanguage(), this.format, this.zipped, overwrite).pipe(
            map(() => {
                return true;
            }),
            finalize(() => {
                this.loading = false;
            }),
            catchError((err: Error) => {
                //the only error not automatically handled is FileAlreadyExistsException
                return from(
                    this.basicModals.confirm({ key: "COMMONS.STATUS.WARNING" }, { key: "MESSAGES.ALREADY_EXISTING_FILE_OVERWRITE_CONFIRM" }, ModalType.warning).then(
                        () => {
                            return this.createDownload(true).pipe(
                                map(() => {
                                    return true;
                                })
                            );
                        },
                        () => {
                            return of(false);
                        }
                    )
                ).pipe(
                    mergeMap(done => done)
                );
            })
        );
    }

    ok() {
        this.loading = true;
        SVContext.setTempProject(this.project);
        this.createDownload(false).subscribe(
            (success: boolean) => {
                if (success) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.OPERATION_DONE" }, { key: "MESSAGES.DOWNLOAD_CREATED" });
                    SVContext.removeTempProject();
                    this.activeModal.close();
                }
            }
        );
    }

    close() {
        SVContext.removeTempProject();
        this.activeModal.dismiss();
    }

}