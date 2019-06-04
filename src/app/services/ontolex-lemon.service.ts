import { Injectable } from '@angular/core';
import { HttpManager } from "../utils/HttpManager";
import { Observable } from 'rxjs';
import { IRI, AnnotatedValue } from '../models/Resources';
import { map } from 'rxjs/operators';
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class OntoLexLemonServices {

    private serviceName = "OntoLexLemon";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns lexicons
     */
    getLexicons(): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getLexicons", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }


    /**
     * Returns the entries in a given lexicon that starts with the supplied character.
     * @param index 
     * @param lexicon 
     */
    getLexicalEntriesByAlphabeticIndex(index: string, lexicon: IRI): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {
            index: index,
            lexicon: lexicon
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntriesByAlphabeticIndex", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns the lexicon which the lexicalEntry belongs to
     * @param lexicalEntry 
     */
    getLexicalEntryLexicons(lexicalEntry: IRI): Observable<AnnotatedValue<IRI>[]> {
        var params: any = {
            lexicalEntry: lexicalEntry
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntryLexicons", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

}
