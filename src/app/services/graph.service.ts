import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { GraphModelRecord } from '../models/Graphs';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { ResourceUtils } from '../utils/ResourceUtils';
import { ResourcesServices } from './resources.service';

@Injectable()
export class GraphServices {

    private serviceName = "Graph";

    constructor(private httpMgr: HttpManager, private resourceService: ResourcesServices) { }

    getGraphModel(): Observable<GraphModelRecord[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getGraphModel", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandGraphModelNode(resource: IRI): Observable<GraphModelRecord[]> {
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "expandGraphModelNode", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandSubResources(resource: IRI, role: RDFResourceRolesEnum): Observable<GraphModelRecord[]> {
        let params: any = {
            resource: resource,
            role: role
        };
        return this.httpMgr.doGet(this.serviceName, "expandSubResources", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandSuperResources(resource: IRI, role: RDFResourceRolesEnum): Observable<GraphModelRecord[]> {
        let params: any = {
            resource: resource,
            role: role
        };
        return this.httpMgr.doGet(this.serviceName, "expandSuperResources", params).pipe(
            mergeMap((plainModel: PlainGraphModelRecord[]) => {
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    private enrichGraphModelRecords(plainModel: PlainGraphModelRecord[]): Observable<GraphModelRecord[]> {
        let resURIs: string[] = [];
        //collecting IRIs
        plainModel.forEach(record => {
            if (resURIs.indexOf(record.source) == -1) {
                resURIs.push(record.source);
            }
            if (resURIs.indexOf(record.link) == -1) {
                resURIs.push(record.link);
            }
            if (resURIs.indexOf(record.target) == -1) {
                resURIs.push(record.target);
            }
        });

        let unannotatedIRIs: IRI[] = [];
        resURIs.forEach(i => {
            unannotatedIRIs.push(new IRI(i));
        });

        if (unannotatedIRIs.length == 0) {
            return of([]);
        }

        return this.resourceService.getResourcesInfo(unannotatedIRIs).pipe(
            map((annotatedIRIs: AnnotatedValue<IRI>[]) => {
                let annotatedModel: GraphModelRecord[] = [];
                plainModel.forEach(record => {
                    annotatedModel.push({
                        source: annotatedIRIs[ResourceUtils.indexOfNode(annotatedIRIs, new IRI(record.source))],
                        link: annotatedIRIs[ResourceUtils.indexOfNode(annotatedIRIs, new IRI(record.link))],
                        target: annotatedIRIs[ResourceUtils.indexOfNode(annotatedIRIs, new IRI(record.target))],
                        classAxiom: record.classAxiom
                    });
                });
                return annotatedModel;
            })
        );
    }

}

class PlainGraphModelRecord {
    source: string;
    link: string;
    target: string;
    classAxiom: boolean;
}