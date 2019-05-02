import { Injectable } from '@angular/core';
import { Project } from "../models/Project";
import { HttpManager } from "../utils/HttpManager";
import { IRI, AnnotatedValue } from '../models/Resources';
import { Observable } from 'rxjs';
import { ResourceDeserializer } from '../utils/ResourceUtils';
import { map } from 'rxjs/operators';

@Injectable()
export class PreferencesSettingsServices {

    private serviceName = "PreferencesSettings";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Sets the show_flag preference
     * @param show 
     */
    setShowFlags(show: boolean) {
        var params = {
            show: show
        };
        return this.httpMgr.doPost(this.serviceName, "setShowFlags", params);
    }

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
     * Gets the preferences of the currently logged user for the currently open project
     */
    getPUSettings(properties: string[], pluginID?: string) {
        var params: any = {
            properties: properties,
            pluginID: pluginID

        };
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
    getProjectSettings(properties: string[], project?: Project) {
        var params: any = {
            properties: properties,
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
    setProjectSetting(property: string, value?: string, project?: Project) {
        var params: any = {
            property: property,
            value: value
        };
        if (project != null) {
            params.projectName = project.getName();
        }
        return this.httpMgr.doPost(this.serviceName, "setProjectSetting", params);
    }

}