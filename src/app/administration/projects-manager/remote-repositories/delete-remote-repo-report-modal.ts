import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExceptionDAO, RemoteRepositorySummary } from 'src/app/models/Project';


@Component({
    selector: "delete-remote-repo-report-modal",
    templateUrl: "./delete-remote-repo-report-modal.html",
    styles: ['.stacktrace { max-height: 120px; overflow: auto; white-space: pre; font-size: 12px; font-family: monospace; }']
})
export class DeleteRemoteRepoReportModal {

    @Input() deletingRepositories: RemoteRepositorySummary[];
    @Input() exceptions: ExceptionDAO[];

    failReports: FailReport[];

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.failReports = [];
        this.exceptions.forEach((e: ExceptionDAO, i: number) => {
            if (e != null) { //exception not null, it means that the corresponding repository deletion has failed
                this.failReports.push({
                    repositoryID: this.deletingRepositories[i].repositoryId,
                    exception: e,
                });
            }
        });
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}

class FailReport {
    repositoryID: string;
    exception: ExceptionDAO;
}