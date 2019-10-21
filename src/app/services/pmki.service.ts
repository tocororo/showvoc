import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigurationObject, Reference } from '../models/Configuration';
import { PluginSpecification } from '../models/Plugins';
import { RepositoryAccess } from '../models/Project';
import { IRI } from '../models/Resources';
import { HttpManager, PMKIRequestOptions } from "../utils/HttpManager";
import { TransitiveImportMethodAllowance } from '../models/Metadata';

@Injectable()
export class PmkiServices {

    private serviceName = "PMKI";

    constructor(private httpMgr: HttpManager) { }

    /**
     * 
     */
    initPMKI(): Observable<void> {
        var params = {};
        return this.httpMgr.doPost(this.serviceName, "initPmki", params);
    }

    /**
     * 
     */
    testVocbenchConfiguration(): Observable<void> {
        var params = {};
        let options: PMKIRequestOptions = new PMKIRequestOptions({
            errorAlertOpt: { 
                show: false, //don't automatically show alert in case of error
            } 
        });
        return this.httpMgr.doGet(this.serviceName, "testVocbenchConfiguration", params, options);
        // return this.httpMgr.doGet(this.serviceName, "testVocbenchConfiguration", params);
    }

    /**
     * 
     * @param mailTo 
     */
    testEmailConfig(mailTo: string) {
        var params = {
            mailTo: mailTo
        };
        return this.httpMgr.doGet(this.serviceName, "testEmailConfig", params);
    }

    /**
     * 
     */
    getContributionReferences(): Observable<Reference[]> {
        var params = {};
        return this.httpMgr.doGet(this.serviceName, "getContributionReferences", params).pipe(
            map(stResp => {
                let references: Reference[] = [];
                for (var i = 0; i < stResp.length; i++) {
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
        var params = {
            configuration: JSON.stringify(configuration)
        };
        return this.httpMgr.doPost(this.serviceName, "submitContribution", params);
    }

    /**
     * 
     * @param relativeReference 
     */
    rejectContribution(relativeReference: string) {
        var params = {
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
        var params = {
            projectName: projectName,
            model: model,
            lexicalizationModel: lexicalizationModel,
            baseURI: baseURI,
            repositoryAccess: repositoryAccess.stringify(),
            coreRepoSailConfigurerSpecification: JSON.stringify(coreRepoSailConfigurerSpecification),
            configurationReference: configurationReference,
            pmkiHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname
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
        var params = {
            projectName: projectName,
            model: model,
            lexicalizationModel: lexicalizationModel,
            baseURI: baseURI,
            coreRepoSailConfigurerSpecification: JSON.stringify(coreRepoSailConfigurerSpecification),
            configurationReference: configurationReference,
            pmkiHostAddress: location.protocol+"//"+location.hostname+((location.port !="") ? ":"+location.port : "")+location.pathname
        };
        return this.httpMgr.doPost(this.serviceName, "approveDevelopmentContribution", params);
    }

    /**
     * 
     * @param configurationReference 
     */
    approveMetadataContribution(configurationReference: string) {
        var params = {
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
        var params = {
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
        var params = {
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
        var params = {
            projectName: projectName,
            status: status
        };
        return this.httpMgr.doPost(this.serviceName, "setProjectStatus", params);
    }
}