import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationObject, Reference } from '../models/Configuration';
import { PluginSpecification } from '../models/Plugins';
import { RepositoryAccess } from '../models/Project';
import { IRI } from '../models/Resources';
import { HttpManager, STRequestOptions } from "../utils/HttpManager";
import { TransitiveImportMethodAllowance } from '../models/Metadata';

@Injectable()
export class ShowVocServices {

    private serviceName = "ShowVoc";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     */
    initShowVoc(): Observable<void> {
        let params = {};
        return this.httpMgr.doPost(this.serviceName, "initShowVoc", params);
    }

    /**
     * 
     */
    testVocbenchConfiguration(): Observable<void> {
        let params = {};
        let options: STRequestOptions = new STRequestOptions({
            errorHandlers: [{
                className: "*", action: 'skip'
            }]
        });
        return this.httpMgr.doGet(this.serviceName, "testVocbenchConfiguration", params, options);
    }

    /**
     * 
     */
    getContributionReferences(): Observable<Reference[]> {
        let params = {};
        return this.httpMgr.doGet(this.serviceName, "getContributionReferences", params).pipe(
            map(stResp => {
                let references: Reference[] = [];
                for (let i = 0; i < stResp.length; i++) {
                    references.push(Reference.deserialize(stResp[i]));
                }
                return references;
            })
        );
    }

    /**
     * 
     * @param configuration 
     */
    submitContribution(configuration: ConfigurationObject) {
        let params = {
            configuration: JSON.stringify(configuration)
        };
        return this.httpMgr.doPost(this.serviceName, "submitContribution", params);
    }

    /**
     * 
     * @param relativeReference 
     */
    rejectContribution(relativeReference: string) {
        let params = {
            relativeReference: relativeReference
        };
        return this.httpMgr.doPost(this.serviceName, "rejectContribution", params);
    }

    /**
     * 
     * @param projectName 
     * @param model 
     * @param lexicalizationModel 
     * @param baseURI 
     * @param repositoryAccess 
     * @param coreRepoSailConfigurerSpecification 
     * @param configurationReference 
     */
    approveStableContribution(projectName: string, model: IRI, lexicalizationModel: IRI, baseURI: string,
        repositoryAccess: RepositoryAccess, coreRepoSailConfigurerSpecification: PluginSpecification,
        configurationReference: string) {
        let params = {
            projectName: projectName,
            model: model,
            lexicalizationModel: lexicalizationModel,
            baseURI: baseURI,
            repositoryAccess: repositoryAccess.stringify(),
            coreRepoSailConfigurerSpecification: JSON.stringify(coreRepoSailConfigurerSpecification),
            configurationReference: configurationReference,
            showvocHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname
        };
        return this.httpMgr.doPost(this.serviceName, "approveStableContribution", params);
    }

    /**
     * 
     * @param projectName 
     * @param model 
     * @param lexicalizationModel 
     * @param baseURI 
     * @param coreRepoSailConfigurerSpecification 
     * @param configurationReference 
     */
    approveDevelopmentContribution(projectName: string, model: IRI, lexicalizationModel: IRI, baseURI: string, 
        coreRepoSailConfigurerSpecification: PluginSpecification, configurationReference: string) {
        let params = {
            projectName: projectName,
            model: model,
            lexicalizationModel: lexicalizationModel,
            baseURI: baseURI,
            coreRepoSailConfigurerSpecification: JSON.stringify(coreRepoSailConfigurerSpecification),
            configurationReference: configurationReference,
            showvocHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname
        };
        return this.httpMgr.doPost(this.serviceName, "approveDevelopmentContribution", params);
    }

    /**
     * 
     * @param configurationReference 
     */
    approveMetadataContribution(configurationReference: string) {
        let params = {
            configurationReference: configurationReference,
        };
        return this.httpMgr.doPost(this.serviceName, "approveMetadataContribution", params);
    }

    /**
     * 
     * @param token 
     * @param projectName 
     * @param inputFile 
     */
    loadStableContributionData(token: string, projectName: string, contributorEmail: string, inputFile: File, format: string,
        rdfLifterSpec: PluginSpecification, transitiveImportAllowance: TransitiveImportMethodAllowance) {
        let params = {
            token: token,
            projectName: projectName,
            contributorEmail: contributorEmail,
            inputFile: inputFile,
            format: format,
            rdfLifterSpec: JSON.stringify(rdfLifterSpec),
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.uploadFile(this.serviceName, "loadStableContributionData", params);
    }

    /**
     * 
     * @param token 
     * @param projectName 
     * @param inputFile 
     * @param format 
     * @param rdfLifterSpec 
     * @param transitiveImportAllowance 
     */
    loadDevContributionData(token: string, projectName: string, contributorEmail: string, inputFile: File, format: string,
        rdfLifterSpec: PluginSpecification, transitiveImportAllowance: TransitiveImportMethodAllowance) {
        let params = {
            token: token,
            projectName: projectName,
            contributorEmail: contributorEmail,
            inputFile: inputFile,
            format: format,
            rdfLifterSpec: JSON.stringify(rdfLifterSpec),
            transitiveImportAllowance: transitiveImportAllowance
        };
        return this.httpMgr.uploadFile(this.serviceName, "loadDevContributionData", params);
    }

    /**
     * 
     * @param projectName 
     * @param status 
     */
    setProjectStatus(projectName: string, status: string) {
        let params = {
            projectName: projectName,
            status: status
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectStatus", params);
    }
}