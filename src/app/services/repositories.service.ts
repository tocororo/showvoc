import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Repository } from "../models/Project";
import { HttpManager } from "../utils/HttpManager";

@Injectable()
export class RepositoriesServices {

    private serviceName = "Repositories";

    constructor(private httpMgr: HttpManager) { }

    /**
     * Updates the value of a triple replacing the old value with the new one
     */
    getRemoteRepositories(serverURL: string, username?: string, password?: string): Observable<Repository[]> {
        var params: any = {
            serverURL: serverURL
        };
        if (username != null && password != null) {
            params.username = username;
            params.password = password;
        }
        return this.httpMgr.doPost(this.serviceName, "getRemoteRepositories", params).pipe(
            map(stResp => {
                var repositories: Repository[] = [];
                for (var i = 0; i < stResp.length; i++) {
                    let repo: Repository = {
                        id: stResp[i].id,
                        location: stResp[i].location,
                        description: stResp[i].description,
                        readable: stResp[i].readable,
                        writable: stResp[i].writable
                    };
                    repositories.push(repo);
                }
                return repositories;
            }
            )
        );
    }


}