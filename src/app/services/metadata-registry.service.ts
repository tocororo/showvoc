import { Injectable } from '@angular/core';
import { IRI, AnnotatedValue, Literal } from '../models/Resources';
import { HttpManager } from '../utils/HttpManager';
import { Project } from '../models/Project';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResourceDeserializer, ResourceUtils } from '../utils/ResourceUtils';
import { LinksetMetadata, Target } from '../models/Metadata';

@Injectable()
export class MetadataRegistryServices {

    private serviceName = "MetadataRegistry";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns metadata about the linksets sets embedded in a given dataset
     * @param dataset 
     * @param treshold minimum number of links (before linkset coalescing)
     * @param coalesce whether or not merge linksets for the same pair of datasets
     */
    getEmbeddedLinksets(dataset: IRI, treshold?: number, coalesce?: boolean): Observable<LinksetMetadata[]> {
        let params: any = {
            dataset: dataset,
            treshold: treshold,
            coalesce: coalesce
        }
        return this.httpMgr.doGet(this.serviceName, "getEmbeddedLinksets", params).pipe(
            map(stResp => {
                let linksets: LinksetMetadata[] = [];
                for (let lsJson of stResp) {
                    let l: LinksetMetadata = {
                        sourceDataset: ResourceUtils.parseIRI(lsJson.sourceDataset),
                        targetDataset: this.parseTarget(lsJson.targetDataset),
                        registeredTargets: lsJson.registeredTargets.map(rt => this.parseTarget(rt)),
                        linkCount: lsJson.linkCount,
                        linkPredicate: lsJson.linkPredicate ? ResourceUtils.parseIRI(lsJson.linkPredicate) : null
                    }
                    linksets.push(l);
                }
                console.log("returning linksets", linksets);
                return linksets;
            })
        );
    }

    private parseTarget(targetJson: any): Target {
        let titles: Literal[] = [];
        for (let title of targetJson.titles) {
            titles.push(ResourceUtils.parseLiteral(title));
        }
        return {
            dataset: ResourceUtils.parseIRI(targetJson.dataset),
            projectName: targetJson.projectName,
            uriSpace: targetJson.uriSpace,
            titles: titles
        }
    }

    /**
     * 
     * @param projects 
     */
    findDatasetForProjects(projects: Project[]): Observable<{[project: string]: AnnotatedValue<IRI>}> {
        let params: any = {
            projects: projects.map(p => p.getName())
        }
        return this.httpMgr.doGet(this.serviceName, "findDatasetForProjects", params).pipe(
            map(stResp => {
                let mappings: {[project: string]: AnnotatedValue<IRI>} = {};
                for (let key in stResp) {
                    mappings[key] = ResourceDeserializer.createIRI(stResp[key]);
                }
                return mappings;
            })
        );
    }

}