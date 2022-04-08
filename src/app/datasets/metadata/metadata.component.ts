import { Component, OnInit } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CreateDownloadModal } from "src/app/administration/projects-manager/create-download-modal";
import { ModalOptions } from "src/app/modal-dialogs/Modals";
import { SharedModalsServices } from "src/app/modal-dialogs/shared-modals/shared-modal.service";
import { Languages } from "src/app/models/LanguagesCountries";
import { DatasetMetadata, ProjectDatasetMapping } from "src/app/models/Metadata";
import { Settings } from "src/app/models/Plugins";
import { Project } from "src/app/models/Project";
import { AnnotatedValue, IRI } from "src/app/models/Resources";
import { CommonUtils } from "src/app/models/Shared";
import { DownloadsMap, SingleDownload } from "src/app/models/Storage";
import { DownloadServices } from "src/app/services/download.service";
import { MetadataRegistryServices } from "src/app/services/metadata-registry.service";
import { ProjectsServices } from "src/app/services/projects.service";
import { AuthorizationEvaluator, STActionsEnum } from "src/app/utils/AuthorizationEvaluator";
import { SVContext } from "src/app/utils/SVContext";
import { LocalizedEditorModal, LocalizedMap } from "src/app/widget/localized-editor/localized-editor-modal";

@Component({
    selector: 'metadata-component',
    templateUrl: './metadata.component.html',
    host: { class: "pageComponent" },
    styles: [`
    .table > tbody > tr:first-child > td {
        border-top: none;
    }
    `]
})
export class MetadataComponent implements OnInit {

    isUpdateFacetsAuthorized: boolean;
    isUpdateDownloadsAuthorized: boolean;

    project: Project;
    facets: { [key: string]: any };
    dataset: AnnotatedValue<IRI>;
    datasetMetadata: DatasetMetadata;

    downloads: DownloadInfo[] = [];

    constructor(private metadataRegistryService: MetadataRegistryServices, private downloadService: DownloadServices, private projectService: ProjectsServices,
        private sharedModals: SharedModalsServices, private modalService: NgbModal, private translate: TranslateService) { }

    ngOnInit() {

        this.isUpdateDownloadsAuthorized = AuthorizationEvaluator.isAuthorized(STActionsEnum.downloadGenericAction);
        this.isUpdateFacetsAuthorized = AuthorizationEvaluator.isAuthorized(STActionsEnum.projectSetProjectFacets);

        this.project = SVContext.getWorkingProject();

        this.metadataRegistryService.findDatasetForProjects([this.project]).subscribe(
            (datasetsMapping: ProjectDatasetMapping) => {
                this.dataset = datasetsMapping[this.project.getName()];
                this.metadataRegistryService.getDatasetMetadata(this.dataset.getValue()).subscribe(
                    (metadata: DatasetMetadata) => {
                        this.datasetMetadata = metadata;
                    }
                );
            }
        );

        this.initFacets();
        this.initDownloads();
    }

    initFacets() {
        let pFacets: Settings = this.project.getFacets();
        let facetsMap = pFacets.getPropertiesAsMap();
        if (facetsMap['customFacets'] == null) {
            delete facetsMap['customFacets'];
        }
        this.facets = this.flattenizeFacetsMap(facetsMap);
    }

    editFacets() {
        this.sharedModals.configurePlugin(this.project.getFacets()).then(
            facets => {
                this.projectService.setProjectFacets(this.project, facets).subscribe(
                    () => {
                        this.project.setFacets(facets); //update facets in project
                        this.initFacets();
                    }
                );
            },
            () => { }
        );
    }

    /**
     * Convert a facets map (which can have nested map as value) to a flat map.
     * E.g.
     * {
     *      key: value1,
     *      key2: {
     *          key21: value21,
     *          key22: value22
     *      }
     * }
     *
     * become
     *
     * {
     *      key: value1,
     *      key21: value21,
     *      key22: value22
     * }
     * @param facets
     * @returns
     */
    private flattenizeFacetsMap(facets: { [key: string]: any }): { [key: string]: string } {
        let fMap: { [key: string]: string } = {};
        for (let fKey in facets) {
            if (facets[fKey] instanceof Object) { //value is a nested map
                let nestedMap = this.flattenizeFacetsMap(facets[fKey]);
                for (let nestedKey in nestedMap) {
                    fMap[nestedKey] = nestedMap[nestedKey];
                }
            } else { //plain string value
                fMap[fKey] = facets[fKey];
            }
        }
        return fMap;
    }


    private initDownloads() {
        this.downloads = [];
        this.downloadService.getDownloadInfoList().subscribe(
            downloadsInfo => {
                let downloadMap: DownloadsMap = downloadsInfo.getPropertyValue("fileNameToSingleDownloadMap");
                for (let dlName in downloadMap) {
                    let d: SingleDownload = downloadMap[dlName];
                    let download: DownloadInfo = {
                        fileName: d.fileName,
                        format: d.format,
                        langToLocalizedMap: d.langToLocalizedMap,
                        localizedLabel: this.getDownloadLocalized(d),
                        date: new Date(d.timestamp),
                        dateLocal: CommonUtils.datetimeToLocale(new Date(d.timestamp))
                    };
                    this.downloads.push(download);
                }
            }
        );
    }

    private getDownloadLocalized(download: SingleDownload): string {
        /*
        get the localized label according the following order:
        - the language set for interface translation
        - the browser language
        - priority languages in SV
        - first localized available
        */
        let translateLang = this.translate.currentLang;
        let localizedLabel: string = download.langToLocalizedMap[translateLang];
        if (localizedLabel != null) {
            return localizedLabel;
        }

        //if not found, try with the browser language
        let browserLang: string = navigator.language || navigator['userLanguage'];
        localizedLabel = download.langToLocalizedMap[browserLang];
        if (localizedLabel != null) {
            return localizedLabel;
        }
        //if the browser language has a country code (e.g. en-GB, it-IT), look only for the lang code
        if (browserLang.includes("-")) {
            browserLang = browserLang.substring(0, browserLang.indexOf("-"));
            localizedLabel = download.langToLocalizedMap[browserLang];
            localizedLabel = download.langToLocalizedMap[browserLang];
            if (localizedLabel != null) {
                return localizedLabel;
            }
        }
        //if not found, try with the priority languages
        let prioritizedLang = Languages.priorityLangs.find(l => download.langToLocalizedMap[l] != null);
        if (prioritizedLang != null) {
            localizedLabel = download.langToLocalizedMap[prioritizedLang];
            if (localizedLabel != null) {
                return localizedLabel;
            }
        }
        //if not found returns the first one in the map
        return download.langToLocalizedMap[Object.keys(download.langToLocalizedMap)[0]];
    }

    createDownload() {
        const modalRef: NgbModalRef = this.modalService.open(CreateDownloadModal, new ModalOptions("lg"));
        modalRef.componentInstance.project = this.project;
        modalRef.result.then(
            () => {
                this.initDownloads();
            },
            () => { }
        );
    }

    deleteDownload(download: DownloadInfo) {
        this.downloadService.removeDownload(download.fileName).subscribe(
            () => {
                this.downloads.splice(this.downloads.indexOf(download), 1);
            }
        );
    }

    downloadDistribution(download: DownloadInfo) {
        this.downloadService.getFile(download.fileName).subscribe(
            blob => {
                let exportLink = window.URL.createObjectURL(blob);
                let aElement: HTMLAnchorElement = document.createElement("a");
                aElement.download = download.fileName;
                aElement.href = exportLink;
                aElement.click();
            }
        );
    }

    editLabel(download: DownloadInfo) {
        const modalRef: NgbModalRef = this.modalService.open(LocalizedEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = this.translate.instant("METADATA.DISTRIBUTIONS.DISTRIBUTION_LABELS");
        modalRef.componentInstance.localizedMap = download.langToLocalizedMap;
        modalRef.result.then(
            (map: LocalizedMap) => {
                this.downloadService.updateLocalizedMap(download.fileName, map).subscribe(
                    () => {
                        this.initDownloads();
                    }
                );
            },
            () => { }
        );
    }

}

interface DownloadInfo {
    fileName: string;
    localizedLabel: string;
    langToLocalizedMap: { [key: string]: string }
    date: Date;
    dateLocal: string;
    format: string;
}