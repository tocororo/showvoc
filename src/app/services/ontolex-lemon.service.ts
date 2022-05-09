import { Injectable } from '@angular/core';
import { HttpManager, STRequestParams } from "../utils/HttpManager";
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
        let params: STRequestParams = {};
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
        let params: STRequestParams = {
            index: index,
            lexicon: lexicon
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntriesByAlphabeticIndex", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    countLexicalEntriesByAlphabeticIndex(index: string, lexicon: IRI): Observable<number> {
        let params: STRequestParams = {
            index: index,
            lexicon: lexicon
        };
        return this.httpMgr.doGet(this.serviceName, "countLexicalEntriesByAlphabeticIndex", params);
    }

    /**
     * Returns the lexicon which the lexicalEntry belongs to
     * @param lexicalEntry 
     */
    getLexicalEntryLexicons(lexicalEntry: IRI): Observable<AnnotatedValue<IRI>[]> {
        let params: STRequestParams = {
            lexicalEntry: lexicalEntry
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntryLexicons", params).pipe(
            map(stResp => {
                return ResourceDeserializer.createIRIArray(stResp);
            })
        );
    }

    /**
     * Returns the 2-digits index of the given lexicalEntry 
     * @param lexicalEntry 
     */
    getLexicalEntryIndex(lexicalEntry: IRI): Observable<string> {
        let params: STRequestParams = {
            lexicalEntry: lexicalEntry
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntryIndex", params);
    }

    /**
     * 
     * @param lexicalEntry 
     */
    getLexicalEntryLanguage(lexicalEntry: IRI): Observable<string> {
        let params: STRequestParams = {
            lexicalEntry: lexicalEntry
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntryLanguage", params);
    }

}
