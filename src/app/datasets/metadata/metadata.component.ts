import { Component, OnInit } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { CreateDownloadModal } from "src/app/administration/projects-manager/create-download-modal";
import { LoadDownloadModal } from "src/app/administration/projects-manager/load-download-modal";
import { ModalOptions } from "src/app/modal-dialogs/Modals";
import { SharedModalsServices } from "src/app/modal-dialogs/shared-modals/shared-modal.service";
import { Languages } from "src/app/models/LanguagesCountries";
import { DatasetMetadata, ProjectDatasetMapping } from "src/app/models/Metadata";
import { Settings } from "src/app/models/Plugins";
import { Project } from "src/app/models/Project";
import { AnnotatedValue, IRI } from "src/app/models/Resources";
import { CommonUtils } from "src/app/models/Shared";
import { DirectoryEntryInfo, DownloadsMap, EntryType, SingleDownload } from "src/app/models/Storage";
import { DownloadServices } from "src/app/services/download.service";
import { MetadataRegistryServices } from "src/app/services/metadata-registry.service";
import { ProjectsServices } from "src/app/services/projects.service";
import { StorageServices } from "src/app/services/storage.service";
import { AuthorizationEvaluator, STActionsEnum } from "src/app/utils/AuthorizationEvaluator";
import { SVContext } from "src/app/utils/SVContext";
import { LocalizedMap } from "src/app/widget/localized-editor/localized-editor-modal";

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
    isUpdateFilesAuthorized: boolean;

    project: Project;
    facets: { [key: string]: any };
    dataset: AnnotatedValue<IRI>;
    datasetMetadata: DatasetMetadata;

    private readonly PROJ_DOWNLOAD_DIR_PATH = "proj:/download";
    distributions: DownloadInfo[] = [];
    files: FileInfo[] = [];


    constructor(private metadataRegistryService: MetadataRegistryServices, private downloadService: DownloadServices,
        private storageService: StorageServices, private projectService: ProjectsServices,
        private sharedModals: SharedModalsServices, private modalService: NgbModal, private translate: TranslateService) { }

    ngOnInit() {

        //auth required for management of downloads and files are more or less the same, so I realy on just one auth check
        this.isUpdateDownloadsAuthorized = AuthorizationEvaluator.isAuthorized(STActionsEnum.downloadGenericAction); //for create/delete/edit distribution downloads
        this.isUpdateFacetsAuthorized = AuthorizationEvaluator.isAuthorized(STActionsEnum.projectSetProjectFacets);
        // this.isUpdateFilesAuthorized = AuthorizationEvaluator.isAuthorized(STActionsEnum.projectSetProjectFacets); //for create/delete/edit files

        this.project = SVContext.getWorkingProject();

        this.metadataRegistryService.findDatasetForProjects([this.project]).subscribe(
            (datasetsMapping: ProjectDatasetMapping) => {
                this.dataset = datasetsMapping[this.project.getName()];
                if (this.dataset != null) { //if project has not been profiled, its dataset IRI is not available in MDR
                    this.metadataRegistryService.getDatasetMetadata(this.dataset.getValue()).subscribe(
                        (metadata: DatasetMetadata) => {
                            this.datasetMetadata = metadata;
                        }
                    );
                }
            }
        );


        this.initFacets();

        this.initDistributions().subscribe(
            () => {
                /*
                uploaded files are in the same storage folder of distributions. 
                They need to be filtered excluding those files already considered by distributions, 
                so uploaded files need to be initialized only after distributions initialization
                */
                this.initUploadedFiles();
            }
        );
    }

    /* ==============
     * Facets
     * ============== */

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
     * to
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

    /* ==============
     * Distributions
     * ============== */

    private initDistributions(): Observable<void> {
        this.distributions = [];
        return this.downloadService.getDownloadInfoList().pipe(
            map(downloadsInfo => {
                let downloadMap: DownloadsMap = downloadsInfo.getPropertyValue("fileNameToSingleDownloadMap");
                for (let dlName in downloadMap) {
                    let d: SingleDownload = downloadMap[dlName];
                    let download: DownloadInfo = {
                        fileName: d.fileName,
                        format: d.format,
                        langToLocalizedMap: d.langToLocalizedMap,
                        localizedLabel: this.getDownloadLocalizedLabel(d),
                        date: new Date(d.timestamp),
                        dateLocal: CommonUtils.datetimeToLocale(new Date(d.timestamp))
                    };
                    this.distributions.push(download);
                }
            })
        );
    }

    private getDownloadLocalizedLabel(download: SingleDownload): string {
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

    createDistribution() {
        const modalRef: NgbModalRef = this.modalService.open(CreateDownloadModal, new ModalOptions("lg"));
        modalRef.componentInstance.project = this.project;
        modalRef.result.then(
            () => {
                this.initDistributions().subscribe();
            },
            () => { }
        );
    }

    deleteDistribution(download: DownloadInfo) {
        this.downloadService.removeDownload(download.fileName).subscribe(
            () => {
                this.distributions.splice(this.distributions.indexOf(download), 1);
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

    editDistributionLabels(download: DownloadInfo) {
        let localizeMap: LocalizedMap = new Map();
        for (let lang in download.langToLocalizedMap) {
            localizeMap.set(lang, download.langToLocalizedMap[lang]);
        }
        this.sharedModals.localizedEditor({ key: "METADATA.DISTRIBUTIONS.DISTRIBUTION_LABELS" }, localizeMap, false).then(
            (map: LocalizedMap) => {
                let newMap: { [lang: string]: string } = {};
                map.forEach((label, lang) => {
                    newMap[lang] = label;
                });
                this.downloadService.updateLocalizedMap(download.fileName, newMap).subscribe(
                    () => {
                        this.initDistributions().subscribe();
                    }
                );
            },
            () => { }
        );
    }

    //Download Files

    private initUploadedFiles() {
        this.storageService.list(this.PROJ_DOWNLOAD_DIR_PATH).subscribe(
            (entries: DirectoryEntryInfo[]) => {
                //filter those entries which are files (not dir) and the name is not already returned in the downloads list
                this.files = entries
                    .filter(e => e.type == EntryType.FILE && !this.distributions.some(d => d.fileName == e.name))
                    .map(e => {
                        return {
                            name: e.name,
                            date: new Date(e.creationTimestamp),
                            dateLocal: CommonUtils.datetimeToLocale(new Date(e.creationTimestamp))
                        };
                    });
            }
        );
    }

    uploadFile() {
        const modalRef: NgbModalRef = this.modalService.open(LoadDownloadModal, new ModalOptions("lg"));
        modalRef.componentInstance.project = this.project;
        modalRef.result.then(
            () => {
                this.initUploadedFiles();
            },
            () => { }
        );
    }

    deleteFile(file: FileInfo) {
        this.storageService.deleteFile(file.name).subscribe(
            () => {
                this.files.splice(this.files.indexOf(file), 1);
            }
        );
    }

    downloadFile(file: FileInfo) {
        this.storageService.getFile(this.PROJ_DOWNLOAD_DIR_PATH + "/" + file.name).subscribe(
            blob => {
                let exportLink = window.URL.createObjectURL(blob);
                let aElement: HTMLAnchorElement = document.createElement("a");
                aElement.download = file.name;
                aElement.href = exportLink;
                aElement.click();
            }
        );
    }

}

interface DownloadInfo {
    fileName: string;
    localizedLabel: string;
    langToLocalizedMap: { [lang: string]: string };
    date: Date;
    dateLocal: string;
    format: string;
}

interface FileInfo {
    name: string;
    date: Date;
    dateLocal: string;
}