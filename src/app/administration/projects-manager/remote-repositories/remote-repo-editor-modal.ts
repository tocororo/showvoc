import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { BasicModalsServices } from "src/app/modal-dialogs/basic-modals/basic-modals.service";
import { Project, RepositorySummary } from "src/app/models/Project";
import { ProjectsServices } from "src/app/services/projects.service";

@Component({
    selector: "remote-repo-editor-modal",
    templateUrl: "./remote-repo-editor-modal.html",
})
export class RemoteRepoEditorModal {
    @Input() project: Project;

    private pristineRepoSummaries: RepositorySummary[];
    repoSummaries: RepositorySummary[];
    private allowBatchModify: boolean = false;

    private BATCH_ATTR: string = "batch";
    private MATCH_USERNAME_ATTR: string = "matchUsername";

    constructor(public activeModal: NgbActiveModal, private projectService: ProjectsServices, private basicModals: BasicModalsServices, 
        private translateService: TranslateService) { }

    ngOnInit() {
        this.initRepos();
    }

    private initRepos() {
        this.projectService.getRepositories(this.project, true).subscribe(
            repos => {
                this.pristineRepoSummaries = JSON.parse(JSON.stringify(repos)); //clone 
                this.repoSummaries = repos;
                if (this.repoSummaries.length > 1) {
                    this.allowBatchModify = true;
                    for (let i = 0; i < this.repoSummaries.length; i++) {
                        this.repoSummaries[i][this.BATCH_ATTR] = true;
                        this.repoSummaries[i][this.MATCH_USERNAME_ATTR] = true;
                    }
                }
            }
        );
    }

    applyChange(repo: RepositorySummary) {
        if (repo[this.BATCH_ATTR]) {
            let oldUsername: string = this.pristineRepoSummaries[this.repoSummaries.indexOf(repo)].remoteRepoSummary.username;
            this.projectService.batchModifyRepostoryAccessCredentials(this.project, repo.remoteRepoSummary.serverURL,
                repo[this.MATCH_USERNAME_ATTR], oldUsername, repo.remoteRepoSummary.username, repo.remoteRepoSummary.password).subscribe(
                    () => {
                        let msg: string = this.translateService.instant("MESSAGES.REPO_CREDENTIALS_BATCH_UPDATED.CREDENTIALS_OF_SERVER_URL", {serverUrl: repo.remoteRepoSummary.serverURL});
                        if (repo[this.MATCH_USERNAME_ATTR]) {
                            msg += " " + this.translateService.instant("MESSAGES.REPO_CREDENTIALS_BATCH_UPDATED.AND_USERNAME", {username: oldUsername});
                        }
                        msg += " " + this.translateService.instant("MESSAGES.REPO_CREDENTIALS_BATCH_UPDATED.UPDATED");
                        this.basicModals.alert({key:"COMMONS.STATUS.OPERATION_DONE"}, msg);
                        this.initRepos();
                    }
                );
        } else { //batch false or undefined (in case of just one repoSummary)
            this.projectService.modifyRepositoryAccessCredentials(this.project, repo.id,
                repo.remoteRepoSummary.username, repo.remoteRepoSummary.password).subscribe(
                    () => {
                        this.basicModals.alert({key:"COMMONS.STATUS.OPERATION_DONE"}, {key:"MESSAGES.REPO_CREDENTIALS_UPDATED", params:{repoId: repo.remoteRepoSummary.repositoryId}});
                    }
                );
        }
    }



    ok() {
        this.activeModal.close();
    }

}