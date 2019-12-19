import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project } from "../models/Project";
import { AnnotatedValue, IRI } from '../models/Resources';
import { HttpManager } from "../utils/HttpManager";
import { ResourceDeserializer } from '../utils/ResourceUtils';

@Injectable()
export class PreferencesSettingsServices {

    private serviceName = "PreferencesSettings";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Sets the default active skos concept schemes
     * @param scheme s
     */
    setActiveSchemes(schemes?: IRI[]) {
        var params: any = {
            schemes: schemes
        }
        return this.httpMgr.doPost(this.serviceName, "setActiveSchemes", params);
    }

    /**
     * Returns the active schemes for the given project
     * @param projectName 
     */
    getActiveSchemes(project: Project): Observable<IRI[]> {
        var params: any = {
            projectName: project.getName()
        }
        return this.httpMgr.doGet(this.serviceName, "getActiveSchemes", params).pipe(
            map(stResp => {
                if (stResp == null) {
                    return null;
                } else {
                    let schemes: IRI[] = [];
                    let annSchemes: AnnotatedValue<IRI>[] = ResourceDeserializer.createIRIArray(stResp);
                    annSchemes.forEach(s => schemes.push(s.getValue()));
                    return schemes;
                }
            })
        );
    }

    /**
     * Gets the preferences of the currently logged user for a project
     * @param properties 
     * @param project if not specified, it is considered the open project (passed via ctx_project)
     * @param pluginID 
     */
    getPUSettings(properties: string[], project?: Project, pluginID?: string) {
        var params: any = {
            properties: properties,
            pluginID: pluginID,
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "getPUSettings", params);
    }

    /**
     * 
     * @param property 
     * @param value 
     */
    setPUSetting(property: string, value?: string, pluginID?: string) {
        var params: any = {
            property: property,
            value: value,
            pluginID: pluginID
        };
        return this.httpMgr.doPost(this.serviceName, "setPUSetting", params);
    }

    /**
     * Gets the settings for the currently open project
     * @param properties 
     * @param project 
     */
    getProjectSettings(properties: string[], project?: Project, pluginID?: string) {
        var params: any = {
            properties: properties,
            pluginID: pluginID
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "getProjectSettings", params);
    }

    /**
     * @param property 
     * @param project 
     */
    setProjectSetting(property: string, value?: string, project?: Project, pluginID?: string) {
        var params: any = {
            property: property,
            value: value,
            pluginID: pluginID
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doPost(this.serviceName, "setProjectSetting", params);
    }

    /**
     * 
     * @param properties 
     */
    getSystemSettings(properties: string[]) {
        var params = {
            properties: properties
        };
        return this.httpMgr.doGet(this.serviceName, "getSystemSettings", params);
    }

    /**
     * 
     * @param property 
     * @param value 
     */
    setSystemSetting(property: string, value?: string) {
        var params: any = {
            property: property,
            value: value
        };
        return this.httpMgr.doPost(this.serviceName, "setSystemSetting", params);
    }

    /**
     * 
     * @param properties 
     * @param project 
     * @param pluginID 
     */
    getPUSettingsProjectDefault(properties: string[], project?: Project, pluginID?: string) {
        var params: any = {
            properties: properties,
            pluginID: pluginID
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doGet(this.serviceName, "getPUSettingsProjectDefault", params);
    }

    /**
     * @param property 
     * @param project 
     */
    setPUSettingProjectDefault(property: string, value?: string, project?: Project, pluginID?: string) {
        var params: any = {
            property: property,
            value: value,
            pluginID: pluginID
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doPost(this.serviceName, "setPUSettingProjectDefault", params);
    }

}