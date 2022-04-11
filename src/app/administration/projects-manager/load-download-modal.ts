import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Observable, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from "src/app/modal-dialogs/Modals";
import { Project } from 'src/app/models/Project';
import { ExportServices } from "src/app/services/export.service";
import { StorageServices } from "src/app/services/storage.service";
import { SVContext } from "src/app/utils/SVContext";

@Component({
    selector: "load-download-modal",
    templateUrl: "./load-download-modal.html",
})
export class LoadDownloadModal {

    @Input() project: Project;

    filePickerAccept: string;
    file: File;
    fileName: string;
    useFileName: boolean = true; //tells if the file needs to be uploaded with the same local file name

    loading: boolean;

    constructor(public activeModal: NgbActiveModal, private exportService: ExportServices, private storageService: StorageServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.exportService.getOutputFormats().subscribe(
            formats => {
                let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
                formats.forEach(f => {
                    f.fileExtensions.forEach(ext => {
                        extList.push("." + ext);
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
        this.fileName = file.name;
    }

    private createFile(file: File, path: string, overwrite: boolean = false): Observable<boolean> {
        return this.storageService.createFile(file, path, overwrite).pipe(
            map(() => {
                return true;
            }),
            catchError((err: Error) => {
                if (err.name.endsWith("FileAlreadyExistsException")) {
                    return from(
                        this.basicModals.confirm({ key: "COMMONS.ACTIONS.UPLOAD_FILE" }, { key: "MESSAGES.ALREADY_EXISTING_FILE_OVERWRITE_CONFIRM" }, ModalType.warning).then(
                            () => {
                                return this.storageService.createFile(file, path, true).pipe(
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
                } else {
                    return of(false);
                }
            })
        );
    }

    ok() {
        this.loading = true;
        SVContext.setTempProject(this.project);
        this.createFile(this.file, "proj:/download/" + this.fileName, false).subscribe(
            (success: boolean) => {
                if (success) {
                    this.basicModals.alert({ key: "COMMONS.STATUS.OPERATION_DONE" }, { key: "MESSAGES.FILE_UPLOADED" });
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