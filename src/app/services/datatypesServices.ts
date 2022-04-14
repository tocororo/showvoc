import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatatypeRestrictionDescription, DatatypeRestrictionsMap, FacetsRestriction } from '../models/Datatypes';
import { AnnotatedValue, IRI } from '../models/Resources';
import { OWL, XmlSchema } from '../models/Vocabulary';
import { HttpManager, STRequestParams } from '../utils/HttpManager';
import { NTriplesUtil, ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class DatatypesServices {

    private serviceName = "Datatypes";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     */
    getDatatypes(): Observable<AnnotatedValue<IRI>[]> {
        let params: STRequestParams = {};
        return this.httpMgr.doGet(this.serviceName, "getDatatypes", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    getDatatypeRestrictions(): Observable<DatatypeRestrictionsMap> {
        let params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getDatatypeRestrictions", params).pipe(
            map(stResp => {
                let dtRestrMap: DatatypeRestrictionsMap = new Map();
                for (let dt in stResp) {
                    dtRestrMap.set(dt, this.parseDatatypeRestrictionDescription(stResp[dt]));
                }
                return dtRestrMap;
            })
        );
    }


    private parseDatatypeRestrictionDescription(descriptionJson: any): DatatypeRestrictionDescription {
        let description: DatatypeRestrictionDescription = new DatatypeRestrictionDescription();
        let facetsJson = descriptionJson.facets;
        let enumerationsJson = descriptionJson.enumerations;
        if (Object.keys(facetsJson).length != 0) { //facetsJson not empty?
            let facetsDescription: FacetsRestriction = new FacetsRestriction();
            for (let key in facetsJson) {
                let value: string = facetsJson[key];
                /**
                 * the initial + for the min/max facets is used for converting a string to number (independently if int or float)
                 * see https://stackoverflow.com/a/14668510/5805661
                 */
                if (key == OWL.onDatatype.getIRI()) {
                    facetsDescription.base = NTriplesUtil.parseIRI(value);
                } else if (key == XmlSchema.maxExclusive.getIRI()) {
                    facetsDescription.facets.maxExclusive = +NTriplesUtil.parseLiteral(value).getLabel();
                } else if (key == XmlSchema.maxInclusive.getIRI()) {
                    facetsDescription.facets.maxInclusive = +NTriplesUtil.parseLiteral(value).getLabel();
                } else if (key == XmlSchema.minExclusive.getIRI()) {
                    facetsDescription.facets.minExclusive = +NTriplesUtil.parseLiteral(value).getLabel();
                } else if (key == XmlSchema.minInclusive.getIRI()) {
                    facetsDescription.facets.minInclusive = +NTriplesUtil.parseLiteral(value).getLabel();
                } else if (key == XmlSchema.pattern.getIRI()) {
                    facetsDescription.facets.pattern = NTriplesUtil.parseLiteral(value).getLabel();
                }
            }
            description.facets = facetsDescription;
        } else if (enumerationsJson.length != 0) { //enumeration array not empty?
            description.enumerations = ResourceDeserializer.createLiteralArray(enumerationsJson).map(l => l.getValue());
        }
        return description;
    }

}