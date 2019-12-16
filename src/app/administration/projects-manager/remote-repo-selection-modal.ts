import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RemoteRepositoryAccessConfig, Repository } from 'src/app/models/Project';
import { RepositoriesServices } from 'src/app/services/repositories.service';

@Component({
    selector: "remote-repo-selection-modal",
    templateUrl: "./remote-repo-selection-modal.html",
})
export class RemoteRepoSelectionModal {

    @Input() title: string;
    @Input() repoConfig: RemoteRepositoryAccessConfig;

    repoList: Repository[];
    selectedRepo: Repository;

    constructor(public activeModal: NgbActiveModal, private repoService: RepositoriesServices) { }

    ngOnInit() {
        this.repoService.getRemoteRepositories(
            this.repoConfig.serverURL, this.repoConfig.username, this.repoConfig.password).subscribe(
            repositories => {
                this.repoList = repositories;
                this.repoList.sort((r1: Repository, r2: Repository) => {
                    return r1.id.toLocaleLowerCase().localeCompare(r2.id.toLocaleLowerCase());
                });
            }
        );
    }

    ok() {
        this.activeModal.close(this.selectedRepo);
    }

    close() {
        this.activeModal.dismiss();
    }

}