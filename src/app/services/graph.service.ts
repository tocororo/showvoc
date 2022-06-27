import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { GraphModelRecord } from '../models/Graphs';
import { AnnotatedValue, IRI, RDFResourceRolesEnum, Resource } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { NTriplesUtil } from '../utils/ResourceUtils';
import { ResourcesServices } from './resources.service';

@Injectable()
export class GraphServices {

    private serviceName = "Graph";

    constructor(private httpMgr: HttpManager, private resourceService: ResourcesServices) { }

    getGraphModel(): Observable<GraphModelRecord[]> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getGraphModel", params).pipe(
            mergeMap(stResp => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    expandGraphModelNode(resource: IRI): Observable<GraphModelRecord[]> {
        let params: any = {
            resource: resource
        };
        return this.httpMgr.doGet(this.serviceName, "expandGraphModelNode", params).pipe(
            mergeMap((stResp) => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
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
            mergeMap((stResp) => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
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
            mergeMap((stResp) => {
                let plainModel: PlainGraphModelRecord[] = [];
                for (let record of stResp) {
                    plainModel.push(PlainGraphModelRecord.parse(record));
                }
                return this.enrichGraphModelRecords(plainModel);
            })
        );
    }

    private enrichGraphModelRecords(plainModel: PlainGraphModelRecord[]): Observable<GraphModelRecord[]> {
        let resURIs: string[] = [];
        //collecting IRIs
        plainModel.forEach(record => {
            if (record.source.isIRI() && resURIs.indexOf(record.source.stringValue()) == -1) {
                resURIs.push(record.source.stringValue());
            }
            if (resURIs.indexOf(record.link.stringValue()) == -1) {
                resURIs.push(record.link.stringValue());
            }
            if (record.target.isIRI() && resURIs.indexOf(record.target.stringValue()) == -1) {
                resURIs.push(record.target.stringValue());
            }
        });

        let unannotatedIRIs: IRI[] = resURIs.map(i => new IRI(i));
        if (unannotatedIRIs.length == 0) {
            return of([]);
        }

        return this.resourceService.getResourcesInfo(unannotatedIRIs).pipe(
            map((annotatedIRIs: AnnotatedValue<IRI>[]) => {
                let annotatedModel: GraphModelRecord[] = [];
                plainModel.forEach(record => {

                    let annotatedSource: AnnotatedValue<Resource>;
                    let annotatedLink: AnnotatedValue<IRI>;
                    let annotatedTarget: AnnotatedValue<Resource>;

                    if (record.source.isIRI()) {
                        annotatedSource = annotatedIRIs.find(res => res.getValue().equals(record.source));
                    }
                    if (annotatedSource == null) { //not found or blank node
                        annotatedSource = new AnnotatedValue(record.source);
                    }

                    annotatedLink = annotatedIRIs.find(res => res.getValue().equals(record.link));
                    if (annotatedLink == null) { //not found
                        annotatedLink = new AnnotatedValue(record.link);
                    }

                    if (record.target.isIRI()) {
                        annotatedTarget = annotatedIRIs.find(res => res.getValue().equals(record.target));
                    }
                    if (annotatedTarget == null) { //not found or blank node
                        annotatedTarget = new AnnotatedValue(record.target);
                    }

                    if (record.rangeDatatype) {
                        annotatedTarget.setAttribute("isDatatype", true);
                    }
                    annotatedModel.push({
                        source: annotatedSource,
                        link: annotatedLink,
                        target: annotatedTarget,
                        classAxiom: record.classAxiom,
                    });
                });
                return annotatedModel;
            })
        );
    }

}

class PlainGraphModelRecord { //not annotated
    source: Resource;
    link: IRI;
    target: Resource;
    classAxiom: boolean;
    rangeDatatype: boolean;

    static parse(recordJson: any): PlainGraphModelRecord {
        return {
            source: NTriplesUtil.parseResource(recordJson.source),
            link: NTriplesUtil.parseIRI(recordJson.link),
            target: NTriplesUtil.parseResource(recordJson.target),
            classAxiom: recordJson.classAxiom,
            rangeDatatype: recordJson.rangeDatatype
        };
    }
}