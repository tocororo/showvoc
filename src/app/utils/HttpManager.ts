import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { Project } from '../models/Project';
import { Properties } from '../models/Properties';
import { Value } from '../models/Resources';
import { Cookie } from './Cookie';
import { SVContext, ProjectContext } from './SVContext';
import { STResponseUtils } from './STServicesUtils';

@Injectable()
export class HttpManager {

    //services url parts
    static readonly serverpath: string = "semanticturkey";
    static readonly groupId: string = "it.uniroma2.art.semanticturkey";
    static readonly artifactId: string = "st-core-services";

    protected serverhost: string;

    //default request options, to eventually override through options parameter in doGet, doPost, ...
    private defaultRequestOptions: SVRequestOptions = new SVRequestOptions({
        errorAlertOpt: { show: true, exceptionsToSkip: [] }
    });

    constructor(private http: HttpClient, private router: Router, private basicModals: BasicModalsServices) {
        this.serverhost = HttpManager.getServerHost();
    }

    doGet(service: string, request: string, params: STRequestParams, options?: SVRequestOptions) {
        options = this.defaultRequestOptions.merge(options);

        let url: string = this.getRequestBaseUrl(service, request);

        //add parameters
        url += this.getParametersForUrl(params);
        url += this.getContextParametersForUrl();

        let httpOptions = {
            headers: new HttpHeaders({
                "Accept": STResponseUtils.ContentType.applicationJson
            }),
            withCredentials: true
        };

        //execute request
        return this.http.get(url, httpOptions).pipe(
            map(res => { 
                return this.handleOkOrErrorResponse(res); 
            }),
            catchError(error => {
                return this.handleError(error, options.errorAlertOpt);
            })
        );
    }

    doPost(service: string, request: string, params: STRequestParams, options?: SVRequestOptions) {
        options = this.defaultRequestOptions.merge(options);
        
        let url: string = this.getRequestBaseUrl(service, request);

        //add ctx parameters
        url += this.getContextParametersForUrl();

        //prepare POST data
        let postData: any = this.getPostData(params);

        let httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': "application/x-www-form-urlencoded",
                "Accept": STResponseUtils.ContentType.applicationJson
            }),
            withCredentials: true
        };

        //execute request
        return this.http.post(url, postData, httpOptions).pipe(
            map(res => { 
                return this.handleOkOrErrorResponse(res); 
            }),
            catchError(error => {
                return this.handleError(error, options.errorAlertOpt);
            })
        );
    }


    uploadFile(service: string, request: string, params: STRequestParams, options?: SVRequestOptions) {
        options = this.defaultRequestOptions.merge(options);

        let url: string = this.getRequestBaseUrl(service, request);

        //add ctx parameters
        url += this.getContextParametersForUrl();

        //prepare form data
        let formData = new FormData();
        for (let paramName in params) {
            if (params[paramName] != null) {
                formData.append(paramName, params[paramName]);
            }
        }

        let httpOptions = {
            headers: new HttpHeaders({
                "Accept": STResponseUtils.ContentType.applicationJson
            }),
            withCredentials: true
        };

        //execute request
        return this.http.post(url, formData, httpOptions).pipe(
            map(res => { 
                return this.handleOkOrErrorResponse(res); 
            }),
            catchError(error => {
                return this.handleError(error, options.errorAlertOpt);
            })
        );
    }

    /**
     * Execute a request to download a file as Blob object
     * @param service the service name
     * @param request the request name
     * @param params the parameters to send in the request. This parameter must be an object like:
     *  { 
	 * 	   "urlParName1" : "urlParValue1",
	 * 	   "urlParName2" : "urlParValue2",
	 * 	   "urlParName3" : "urlParValue3",
	 *  }
     * @param post tells if the download is done via post-request (e.g. Export.export() service)
     * @param options further options that overrides the default ones
     */
    downloadFile(service: string, request: string, params: STRequestParams, post?: boolean, options?: SVRequestOptions): Observable<Blob> {
        options = this.defaultRequestOptions.merge(options);
        
        let url: string = this.getRequestBaseUrl(service, request);

        if (post) {
            //add ctx parameters
            url += this.getContextParametersForUrl();

            //prepare POST data
            let postData: string = this.getPostData(params);

            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': "application/x-www-form-urlencoded",
                }),
                responseType: 'arraybuffer' as 'arraybuffer',
                withCredentials: true,
                observe: "response" as "response"
            };

            return this.http.post(url, postData, httpOptions).pipe(
                map(res => { 
                    return this.arrayBufferRespHandler(res); 
                }),
                catchError(error => { 
                    return this.handleError(error, options.errorAlertOpt);
                })
            );
        } else { //GET
            //add parameters
            url += this.getParametersForUrl(params);
            url += this.getContextParametersForUrl();

            let httpOptions = {
                headers: new HttpHeaders(),
                responseType: 'arraybuffer' as 'arraybuffer',
                withCredentials: true,
                observe: "response" as "response"
            };

            //execute request
            return this.http.get(url, httpOptions).pipe(
                map(res => { 
                    return this.arrayBufferRespHandler(res);
                }),
                catchError(error => {
                    return this.handleError(error, options.errorAlertOpt);
                })
            );
        }

    }

    /**
     * Composes and returns the base part of the URL of a request.
     * "http://<serverhost>/<serverpath>/<groupId>/<artifactId>/<service>/<request>?...
     * @param service the service name
     * @param request the request name
     * 
     */
     protected getRequestBaseUrl(service: string, request: string): string {
        return this.serverhost + "/" + HttpManager.serverpath + "/" + HttpManager.groupId + "/" + HttpManager.artifactId + "/" + service + "/" + request + "?";
    }

    /**
     * Returns the request context parameters.
     */
     private getContextParametersForUrl(): string {
        let params: string = "";

        /**
         * give priority to ctx_project in the following order:
         * - SVContext.tempProject (in this case the consumer is omitted => consumer is SYSTEM by default)
         * - HttpServiceContext.ctxProject (in this case the working project is set as consumer)
         * - SVContext.workingProject
         */
        let ctxProject: Project;
        let ctxConsumer: Project;

        if (SVContext.getTempProject() != null) { //if provided get ctxProject from SVContext.tempProject
            ctxProject = SVContext.getTempProject();
        } else if (HttpServiceContext.getContextProject() != null) { //otherwise get ctxProject from HttpServiceContext
            ctxProject = HttpServiceContext.getContextProject();
            //project provided in HttpServiceContext => set also the consumer
            if (HttpServiceContext.getConsumerProject() != null) {
                ctxConsumer = HttpServiceContext.getConsumerProject();
            } else {
                ctxConsumer = SVContext.getWorkingProject();
            }
        } else { //project not provided in SVContext.tempProject or HttpServiceContext => get it from SVContext
            ctxProject = SVContext.getWorkingProject();
        }
        //concat the url parameter
        if (ctxProject != null) {
            params += "ctx_project=" + encodeURIComponent(ctxProject.getName()) + "&";
        }
        if (ctxConsumer != null) {
            params += "ctx_consumer=" + encodeURIComponent(ctxConsumer.getName()) + "&";
        }

        //language (if languages provided in cookies, override the preference stored server side through the ctx_langs param)
        // let proj = SVContext.getWorkingProject();
        // if (proj != null && ctxProject != null && proj.getName() == ctxProject.getName()) {
        //     let langsCookie = Cookie.getUserProjectCookiePref(Properties.pref_languages, proj);
        //     if (langsCookie != null) {
        //         params += "ctx_langs=" + langsCookie + "&";
        //     }
        // }
        if (ctxProject != null) {
            let langsCookie = Cookie.getUserProjectCookiePref(Properties.pref_languages, ctxProject);
            if (langsCookie != null) {
                params += "ctx_langs=" + langsCookie + "&";
            }
        }
        
        return params;
    }


    private getParametersForUrl(params: STRequestParams): string {
        return this.getPostData(params) + "&"; //differs from getPostData simply for the ending & in order to append ctx parameters
    }

    private getPostData(params: STRequestParams): string {
        let postData: any;
        let strBuilder: string[] = [];
        for (let paramName in params) {
            let paramValue = params[paramName];
            if (paramValue == null) continue;

            if (Array.isArray(paramValue)) {
                let stringArray: string[] = [];
                for (let i = 0; i < paramValue.length; i++) {
                    if (paramValue[i] instanceof Value) {
                        stringArray.push((paramValue[i]).toNT());
                    } else {
                        stringArray.push(paramValue[i]);
                    }
                }
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(stringArray.join(",")));
            } else if (paramValue instanceof Map) {
                let stringMap: { [key: string]: string } = {};
                paramValue.forEach((value: any, key: string) => {
                    if (value instanceof Value) {
                        stringMap[key] = value.toNT();
                    } else {
                        stringMap[key] = value;
                    }
                })
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(JSON.stringify(stringMap)));
            } else if (paramValue instanceof Value) {
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(paramValue.toNT()));
            } else {
                strBuilder.push(encodeURIComponent(paramName) + "=" + encodeURIComponent(paramValue));
            }
        }
        postData = strBuilder.join("&");
        return postData;
    }

    /**
     * RESPONSE HANDLERS
     */

    /**
     * Second step of the "pipeline" of response management:
     * Gets the json or xml response and detect whether it is an error response, in case throws an Error, otherwise return the
     * response data content
     * @param res response json or xml returned by handleJsonXmlResponse
     */
    private handleOkOrErrorResponse(res: any | Document) {
        if (STResponseUtils.isErrorResponse(res)) {
            let err = new Error(STResponseUtils.getErrorResponseExceptionMessage(res));
            err.name = STResponseUtils.getErrorResponseExceptionName(res);
            err.stack = STResponseUtils.getErrorResponseExceptionStackTrace(res);
            throw err;
        } else {
            return STResponseUtils.getResponseData(res);
        }
    }

    /**
     * Analyze the err object in input, shows eventually the error modal and then forward an Error object.
     * @param err
     */
    private handleError(err: HttpErrorResponse | Error, errorAlertOpt: ErrorAlertOptions) {
        let error: Error = new Error();

        if (err instanceof HttpErrorResponse) { //error thrown by the angular HttpClient get() or post()
            if (err.error instanceof ErrorEvent) { //A client-side or network error occurred
                let errorMsg = "An error occurred:" + err.error.message;
                this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, errorMsg, ModalType.error);
                error.name = "Client Error";
                error.message = errorMsg;
            } else { //The backend returned an unsuccessful response code. The response body may contain clues as to what went wrong.
                let errorMsg: string;
                if (!err.ok && err.status == 0 && err.statusText == "Unknown Error") { //attribute of error response in case of no backend response
                    errorMsg = "Connection with ST server (" + this.serverhost + ") has failed; please check your internet connection";
                    this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, errorMsg, ModalType.error);
                    error.name = "ConnectionError";
                    error.message = errorMsg;
                } else { //backend error response
                    let status: number = err.status;
                    if (status == 401 || status == 403) { //user did a not authorized requests or is not logged in
                        if (err.error instanceof ArrayBuffer) {
                            errorMsg = String.fromCharCode.apply(String, new Uint8Array(err.error));
                        } else {
                            errorMsg = err.error;
                        }
                        error.name = "UnauthorizedRequestError";
                        error.message = err.message;

                        this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, errorMsg, ModalType.error).then(
                            () => {
                                //in case user is not logged at all (probably session timedout), reset context and redirect to home
                                if (err.status == 401) { 
                                    SVContext.resetContext();
                                    HttpServiceContext.resetContext();
                                    if (this.router.url != "/login") {
                                        //redirect to home only if not in login page, since 401 is returned even at login failed
                                        this.router.navigate(['/home']);
                                    }
                                };
                            },
                            () => {}
                        );
                    } else if (status == 500 || status == 404) { //server error (e.g. out of memory)
                        let errorMsg = (err.statusText != null ? err.statusText : "Unknown response from the server") + " (status: " + err.status + ")";
                        this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, errorMsg, ModalType.error);
                        error.name = "ServerError";
                        error.message = errorMsg;
                    }
                }
            }
        } else if (err instanceof Error) { //error already parsed and thrown in handleOkOrErrorResponse or arrayBufferRespHandler
            error = err;
            if (
                errorAlertOpt.show && 
                (errorAlertOpt.exceptionsToSkip == null || errorAlertOpt.exceptionsToSkip.indexOf(error.name) == -1) &&
                HttpServiceContext.isErrorInterceptionEnabled()
            ) { //if the alert should be shown
                let errorMsg = error.message != null ? error.message : "Unknown response from the server";
                let errorDetails = error.stack ? error.stack : error.name;
                this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, errorMsg, ModalType.error, errorDetails);
            }
        }
        return throwError(error);
    }


    /**
     * Handle the response of downloadFile that returns an array buffer.
     * This method check if the response is json, in case it could be an json error response.
     * In case, throws an error containing the error message in the response.
     * 
     * Note: this method is called only if the backend responds correctly with a 200 response, even if the response contains an error
     * (that is then parsed here).
     */
    private arrayBufferRespHandler(resp: HttpResponse<ArrayBuffer>) {
        let arrayBuffer = resp.body;
        let respContType = resp.headers.get("content-type");
        if (respContType.includes(STResponseUtils.ContentType.applicationJson + ";")) { //could be an error response
            //convert arrayBuffer to json object
            let respContentAsString = String.fromCharCode.apply(String, new Uint8Array(arrayBuffer));
            let jsonResp = JSON.parse(respContentAsString);
            if (STResponseUtils.isErrorResponse(jsonResp)) { //is an error
                let err = new Error(STResponseUtils.getErrorResponseExceptionMessage(jsonResp));
                err.name = STResponseUtils.getErrorResponseExceptionName(jsonResp);
                err.stack = STResponseUtils.getErrorResponseExceptionStackTrace(jsonResp);
                throw err;
            } else { //not an error => return a blob
                let blobResp = new Blob([arrayBuffer], { type: respContType });
                return blobResp;
            }
        } else { //not json => return a blob
            let blobResp = new Blob([arrayBuffer], { type: respContType });
            return blobResp;
        }
    }

    static getServerHost(): string {
        let st_protocol: string = window['st_protocol']; //protocol (http/https)
        let protocol: string = st_protocol ? st_protocol : location.protocol;
        if (!protocol.endsWith(":")) protocol += ":"; //protocol from location includes ending ":", st_protocol variable could not include ":"

        let st_host: string = window['st_host'];
        let host: string = st_host ? st_host : location.hostname;

        let st_port: string = window['st_port'];
        let port: string = st_port ? st_port : location.port;

        let st_path: string = window['st_path']; //url path (optional)
        
        let serverhost = protocol + "//" + host + ":" + port;
        if (st_path != null) {
            serverhost += "/" + st_path;
        }
        return serverhost;
    }

}

export class HttpServiceContext {
    private static ctxProject: Project; //project temporarly used in some scenarios (e.g. exploring other projects)
    private static ctxConsumer: Project; //consumer project temporarly used in some scenarios (e.g. service invoked in group management)

    //if true, the errors thrown by the service calls are intercepted and a modal is shown. Useful to set to false during bulk operations.
    private static interceptError: boolean = true;

    /**
     * Methods for managing a contextual project (project temporarly used in some scenarios)
     */
    static setContextProject(project: Project) {
        this.ctxProject = project;
    }
    static getContextProject(): Project {
        return this.ctxProject;
    }
    static removeContextProject() {
        this.ctxProject = null;
    }

    /**
     * Methods for managing a contextual consumer project (project temporarly used in some scenarios)
     */
    static setConsumerProject(project: Project) {
        this.ctxConsumer = project;
    }
    static getConsumerProject(): Project {
        return this.ctxConsumer;
    }
    static removeConsumerProject() {
        this.ctxConsumer = null;
    }

    /**
     * Disable/enable error interception. Is useful in some cases to disable temporarly the error interception,
     * in order to avoid to show multiple error modals that report the errors when multiple services are invoked.
     * It is better instead to collect all the error and show just a unique report.
     * (This code is copied from the HttpManager of Vocbench, in that case it was useful for the multiple addition/edit. 
     * Maybe here in ShowVoc it is not necessary. I keep it anyway)
     */
    static isErrorInterceptionEnabled(): boolean {
        return this.interceptError;
    }
    static enableErrorInterception() {
        this.interceptError = true;
    }
    static disableErrorInterception() {
        this.interceptError = false;
    }

    static resetContext() {
        this.ctxProject = null;
        this.ctxConsumer = null;
    }
}


//inspired by angular RequestOptions
export class SVRequestOptions {

    errorAlertOpt: ErrorAlertOptions;
    
    constructor({ errorAlertOpt }: SVRequestOptionsArgs = {}) {
        this.errorAlertOpt = errorAlertOpt != null ? errorAlertOpt : null;
    }

    /**
     * Creates a copy of the `SVRequestOptions` instance, using the optional input as values to override existing values.
     * This method will not change the values of the instance on which it is being  called.
     * @param options 
     */
    merge(options?: SVRequestOptions): SVRequestOptions {
        //if options is provided and its parameters is not null, override the value of the current instance
        return new SVRequestOptions({
            errorAlertOpt: options && options.errorAlertOpt != null ? options.errorAlertOpt : this.errorAlertOpt
        });
    }

}
//inspired by angular RequestOptionsArgs
interface SVRequestOptionsArgs {
    /**
     * To prevent an alert dialog to show up in case of error during requests.
     * Is useful to handle the error from the component that invokes the service.
     */
    errorAlertOpt?: ErrorAlertOptions;
}
class ErrorAlertOptions {
    show: boolean; //if true HttpManager show the error alert in case of error response, skip the show alert otherwise
    exceptionsToSkip?: string[]; //if provided, tells for which exceptions the alert should be skipped (useful only if show is true)
}

export class STRequestParams { [key: string]: any }