import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatasetMetadata, LexicalizationSetMetadata, LinksetMetadata, ProjectDatasetMapping, Target } from '../models/Metadata';
import { Project } from '../models/Project';
import { AnnotatedValue, IRI, Literal, ResourcePosition } from '../models/Resources';
import { STRequestOptions, STRequestParams } from '../utils/HttpManager';
import { NTriplesUtil, ResourceDeserializer } from '../utils/ResourceUtils';
import { StMetadataRegistry } from '../utils/STMetadataRegistry';

@Injectable()
export class MetadataRegistryServices {

    private serviceName = "MetadataRegistry";

    constructor(private httpMgr: StMetadataRegistry) { }

    /**
     * 
     * @param dataset 
     */
    getEmbeddedLexicalizationSets(dataset: IRI): Observable<LexicalizationSetMetadata[]> {
        let params: STRequestParams = {
            dataset: dataset
        };
        return this.httpMgr.doGet(this.serviceName, "getEmbeddedLexicalizationSets", params);
    }

    /**
     * Returns metadata about the linksets sets embedded in a given dataset
     * @param dataset 
     * @param treshold minimum number of links (before linkset coalescing)
     * @param coalesce whether or not merge linksets for the same pair of datasets
     */
    getEmbeddedLinksets(dataset: IRI, treshold?: number, coalesce?: boolean): Observable<LinksetMetadata[]> {
        let params: STRequestParams = {
            dataset: dataset,
            treshold: treshold,
            coalesce: coalesce
        };
        return this.httpMgr.doGet(this.serviceName, "getEmbeddedLinksets", params).pipe(
            map(stResp => {
                let linksets: LinksetMetadata[] = [];
                for (let lsJson of stResp) {
                    let l: LinksetMetadata = new LinksetMetadata();
                    l.sourceDataset = NTriplesUtil.parseIRI(lsJson.sourceDataset);
                    l.targetDataset = this.parseTarget(lsJson.targetDataset);
                    l.registeredTargets = lsJson.registeredTargets.map(rt => this.parseTarget(rt));
                    l.linkCount = lsJson.linkCount;
                    l.linkPredicate = lsJson.linkPredicate ? NTriplesUtil.parseIRI(lsJson.linkPredicate) : null;
                    linksets.push(l);
                }
                //compute percentage for each link (not contained in the response)
                let totalLinkCount: number = 0; //count total number of linksets
                linksets.forEach(l => {
                    totalLinkCount += l.linkCount;
                });
                linksets.forEach(l => {
                    let percentage = l.linkCount / totalLinkCount * 100;
                    l.linkPercentage = Math.round((percentage + Number.EPSILON) * 100) / 100;
                });
                return linksets;
            })
        );
    }

    private parseTarget(targetJson: any): Target {
        let titles: Literal[] = [];
        for (let title of targetJson.titles) {
            titles.push(NTriplesUtil.parseLiteral(title));
        }
        return {
            dataset: NTriplesUtil.parseIRI(targetJson.dataset),
            projectName: targetJson.projectName,
            uriSpace: targetJson.uriSpace,
            titles: titles
        };
    }

    /**
     * 
     * @param projects 
     */
    findDatasetForProjects(projects: Project[]): Observable<ProjectDatasetMapping> {
        let params: STRequestParams = {
            projects: projects.map(p => p.getName())
        };
        return this.httpMgr.doGet(this.serviceName, "findDatasetForProjects", params).pipe(
            map(stResp => {
                let mappings: ProjectDatasetMapping = {};
                for (let key in stResp) {
                    mappings[key] = ResourceDeserializer.createIRI(stResp[key]);
                }
                return mappings;
            })
        );
    }

    /**
     * Find a dataset matching the given IRI.
     * @param iri 
     */
    findDataset(iri: IRI): Observable<ResourcePosition> {
        let params: STRequestParams = {
            iri: iri,
        };
        return this.httpMgr.doGet(this.serviceName, "findDataset", params).pipe(
            map(resp => {
                return ResourcePosition.deserialize(resp);
            })
        );
    }

    /**
     * 
     * @param dataset 
     */
    getDatasetMetadata(dataset: IRI): Observable<DatasetMetadata> {
        let params: STRequestParams = {
            dataset: dataset
        };
        return this.httpMgr.doGet(this.serviceName, "getDatasetMetadata", params).pipe(
            map(stResp => {
                return DatasetMetadata.deserialize(stResp);
            })
        );
    }

    /**
     * Discover the metadata for a dataset given an IRI. If discovery is unsuccessful, an exception is thrown.
     * Returns the id of the metadataDataset found.
     * @param iri 
     */
    discoverDataset(iri: IRI): Observable<AnnotatedValue<IRI>> {
        let params: STRequestParams = {
            iri: iri,
        };
        return this.httpMgr.doPost(this.serviceName, "discoverDataset", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRI(stResp);
            })
        );
    }

    /**
     * 
     * @param iri 
     */
    discoverDatasetMetadata(iri: IRI): Observable<DatasetMetadata> {
        let params: STRequestParams = {
            iri: iri
        };
        let options: STRequestOptions = new STRequestOptions({
            errorHandlers: [{
                className: "it.uniroma2.art.semanticturkey.exceptions.DeniedOperationException", action: 'skip'
            }]
        });
        return this.httpMgr.doGet(this.serviceName, "discoverDatasetMetadata", params, options).pipe(
            map(stResp => {
                return DatasetMetadata.deserialize(stResp);
            })
        );
    }

    /**
     * 
     * @param dataset 
     */
    getClassPartitions(dataset: IRI): Observable<{ [iri: string]: number }> {
        let params: STRequestParams = {
            dataset: dataset
        };
        return this.httpMgr.doGet(this.serviceName, "getClassPartitions", params);
    }

}