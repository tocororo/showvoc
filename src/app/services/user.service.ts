import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from "../models/User";
import { HttpManager } from "../utils/HttpManager";
import { PMKIContext } from '../utils/PMKIContext';

@Injectable()
export class UserServices {

    private serviceName = "Users";

    constructor(private httpMgr: HttpManager, private router: Router) { }

    /**
     * Returns the user corrently logged (response contains user object).
     * Returns null if no user is logged (response contains empty user object).
     * Throw exception if no user is register at all (in this case the response of getUser() is empty).
     */
    getUser(): Observable<User> {
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getUser", params).pipe(
            map((stResp: any) => {
                if (stResp.user != null) { //user object in respnse => serialize it (it could be empty, so no user logged)
                    let user: User = User.createUser(stResp.user);
                    if (user != null) {
                        PMKIContext.setLoggedUser(user);
                    }
                    return user;
                } else { //no user object in the response => there is no user registered
                    this.router.navigate(["/Registration/1"]);
                }
			})
		);
	}

}
