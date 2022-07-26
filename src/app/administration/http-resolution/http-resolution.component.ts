import { ChangeDetectorRef, Component } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { concatMap, tap } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from 'src/app/modal-dialogs/Modals';
import { Project } from 'src/app/models/Project';
import { HttpResolutionServices } from 'src/app/services/http-resolution.service';
import { ProjectsServices } from 'src/app/services/projects.service';
import { ContentNegotiationConfigurationModal } from './content-negotiation-config-modal';

@Component({
    selector: 'http-resolution',
    templateUrl: './http-resolution.component.html',
    host: { class: "vbox" }
})
export class HttpResolutionComponent {


    mappings: MappingStruct[];

    testInput: string;
    testOutput: string;

    constructor(private projectService: ProjectsServices, private httpResolutionService: HttpResolutionServices,
        private basicModals: BasicModalsServices, private modalService: NgbModal, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        let initProject = this.projectService.listProjects().pipe(
            tap(projects => {
                this.mappings = projects.map(p => {
                    return { project: p, enabled: false, uriRegexp: [] };
                });
            })
        );

        let initSettings = this.httpResolutionService.getUri2ProjectSettings().pipe(
            tap((uri2ProjectMap: { [uri: string]: string }) => {
                if (uri2ProjectMap != null) {
                    for (let entry of Object.entries(uri2ProjectMap)) {
                        let regexp = entry[0];
                        let projectName = entry[1];
                        let mapping = this.mappings.find(m => m.project.getName() == projectName);
                        mapping.enabled = true;
                        mapping.uriRegexp.push(regexp);
                    }
                    this.mappings.sort((m1, m2) => m1.project.getName().toLocaleLowerCase().localeCompare(m2.project.getName().toLocaleLowerCase()));
                }
            })
        );

        initProject.pipe(
            concatMap(() => initSettings)
        ).subscribe();
    }

    enableResolution(mapping: MappingStruct) {
        mapping.enabled = !mapping.enabled;
        if (mapping.enabled && mapping.uriRegexp.length == 0) {
            this.addRegexp(mapping);
        }
        if (!mapping.enabled) { //disable http resolution
            this.storeSettings();
        }
    }

    addRegexp(mapping: MappingStruct) {
        mapping.pendingRegexp = mapping.project.getDefaultNamespace() + ".*";
    }

    confirmAddRegexp(mapping: MappingStruct, newRegexp: string) {
        if (mapping.uriRegexp.includes(newRegexp)) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Regular expression already existing for the current dataset" }, ModalType.warning);
            mapping.pendingRegexp = null;
            return;
        }
        if (this.isValidRegExp(newRegexp)) {
            mapping.uriRegexp.push(newRegexp);
            this.storeSettings();
            mapping.pendingRegexp = null;
        }
    }

    cancelAddRegexp(mapping: MappingStruct) {
        mapping.pendingRegexp = null;
        if (mapping.uriRegexp.length == 0) { //no regexp => disable resolution
            mapping.enabled = false;
        }
    }

    deleteRegexp(mapping: MappingStruct, index: number) {
        mapping.uriRegexp.splice(index, 1);
        this.storeSettings();
    }

    updateRegexp(mapping: MappingStruct, index: number, newRegexp: string) {
        if (this.isValidRegExp(newRegexp)) {
            mapping.uriRegexp[index] = newRegexp;
            this.storeSettings();
        } else {
            let regexpBackup = mapping.uriRegexp[index];
            mapping.uriRegexp[index] = null;
            this.changeDetectorRef.detectChanges();
            mapping.uriRegexp[index] = regexpBackup;
        }
    }

    testResolution() {
        let mappingCandidates: MappingStruct[] = this.mappings.filter(m => m.uriRegexp.some(regexp => this.testInput.match(regexp)));
        if (mappingCandidates.length == 0) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "No regular expressions matches this input" }, ModalType.warning);
        } else if (mappingCandidates.length > 1) {
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, {
                key: "Found regular expressions for multiple datasets that matches this input (" +
                    mappingCandidates.map(m => m.project.getName()).join(", ") + "). This might leads to undesired behaviour"
            }, ModalType.warning);
            return;
        } else {
            this.testOutput = mappingCandidates[0].project.getName();
        }
    }

    private isValidRegExp(regexp: string): boolean {
        try {
            new RegExp(regexp);
            return true;
        } catch (error) {
            let message = "Invalid regular expression\n" + regexp;
            if (error instanceof Error) {
                message = error.message;
            }
            this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: message }, ModalType.warning);
            return false;
        }
    }

    configureContentNegotiation(mapping: MappingStruct) {
        const modalRef: NgbModalRef = this.modalService.open(ContentNegotiationConfigurationModal, new ModalOptions("xl"));
        modalRef.componentInstance.project = mapping.project;
    }

    storeSettings() {
        for (let m of this.mappings) {
            if (!m.enabled) continue;
            for (let regexp of m.uriRegexp) {
                if (regexp.trim() == "") {
                    this.basicModals.alert({ key: "COMMONS.STATUS.WARNING" }, { key: "Detected empty regexp mapped to dataset " + m.project.getName() }, ModalType.warning);
                    return;
                }
                if (!this.isValidRegExp(regexp)) {
                    return;
                }
            }
        }

        let uri2ProjectMap: { [re: string]: string } = {};
        this.mappings
            .filter(m => m.enabled)
            .forEach(m => {
                m.uriRegexp.forEach(regexp => {
                    uri2ProjectMap[regexp] = m.project.getName();
                });
            });
        this.httpResolutionService.storeUri2ProjectSettings(uri2ProjectMap).subscribe();
    }

}


interface MappingStruct {
    project: Project;
    enabled: boolean;
    uriRegexp: string[];
    pendingRegexp?: string;
}