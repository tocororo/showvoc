export class User {
    private email: string;
    private givenName: string;
    private familyName: string
    private iri: string;
    private birthday: Date;
    private phone: string;
    private gender: string;
    private country: string;
    private address: string;
    private registrationDate: Date;
    private affiliation: string;
    private url: string;
    private avatarUrl: string;
    private languageProficiencies: string[];
    private status: UserStatusEnum;
    private admin: boolean = false;
    private online: boolean = false;

    constructor(email: string, givenName: string, familyName: string, iri: string) {
        this.email = email;
        this.givenName = givenName;
        this.familyName = familyName;
        this.iri = iri;
    }

    getEmail(): string {
        return this.email;
    }

    getGivenName(): string {
        return this.givenName;
    }

    getFamilyName(): string {
        return this.familyName;
    }

    getIri(): string {
        return this.iri;
    }

    setBirthday(birthday: Date) {
        this.birthday = birthday;
    }

    getBirthday(): Date {
        return this.birthday;
    }

    setPhone(phone: string) {
        this.phone = phone;
    }

    getPhone(): string {
        return this.phone;
    }

    setGender(gender: string) {
        this.gender = gender;
    }

    getGender(): string {
        return this.gender;
    }

    setCountry(country: string) {
        this.country = country;
    }

    getCountry(): string {
        return this.country;
    }

    setAddress(address: string) {
        this.address = address;
    }

    getAddress(): string {
        return this.address;
    }

    setRegistrationDate(registrationDate: Date) {
        this.registrationDate = registrationDate;
    }

    getRegistrationDate(): Date {
        return this.registrationDate;
    }

    setAffiliation(affiliation: string) {
        this.affiliation = affiliation;
    }

    getAffiliation(): string {
        return this.affiliation;
    }

    setUrl(url: string) {
        this.url = url;
    }

    getUrl(): string {
        return this.url;
    }

    setAvatarUrl(avatarUrl: string) {
        this.avatarUrl = avatarUrl;
    }

    getAvatarUrl(): string {
        return this.avatarUrl;
    }

    setLanguageProficiencies(languageProficiencies: string[]) {
        this.languageProficiencies = languageProficiencies;
    }

    getLanguageProficiencies(): string[] {
        return this.languageProficiencies;
    }

    setStatus(status: UserStatusEnum) {
        this.status = status;
    }

    getStatus(): UserStatusEnum {
        return this.status;
    }

    setAdmin(admin: boolean) {
        this.admin = admin;
    }

    isAdmin(): boolean {
        return this.admin;
    }

    setOnline(online: boolean) {
        this.online = online;
    }

    isOnline(): boolean {
        return this.online;
    }

    getShow(): string {
        return this.givenName + " " + this.familyName;
    }








     /**
     * @param resp json response containing {"user"" : [{givenName: string, familyName: string, ...}, {...}]}
     */
    static createUsersArray(resp: any): User[] {
        var users: User[] = [];
        for (var i = 0; i < resp.length; i++) {
            users.push(this.createUser(resp[i]));
        }
        return users;
    }

    /**
     * Parses a json response, creates and returns a User. Returns null if no user is present in input param
     * @param resp could be a "data" element of a response (containing a "user" element)
     * or directly a "user" element
     */
    static createUser(userJson: any): User {
        if (userJson.email == null) { //user object is empty (scenario: getUser with no logged user)
            return null;
        }
        var user = new User(userJson.email, userJson.givenName, userJson.familyName, userJson.iri);
        user.setRegistrationDate(userJson.registrationDate);
        user.setStatus(userJson.status);
        user.setAdmin(userJson.admin);
        user.setOnline(userJson.online);
        if (userJson.birthday != undefined) {
            user.setBirthday(userJson.birthday);
        }
        if (userJson.phone != undefined) {
            user.setPhone(userJson.phone);
        }
        if (userJson.gender != undefined) {
            user.setGender(userJson.gender)
        }
        if (userJson.country != undefined) {
            user.setCountry(userJson.country);
        }
        if (userJson.address != undefined) {
            user.setAddress(userJson.address);
        }
        if (userJson.affiliation != undefined) {
            user.setAffiliation(userJson.affiliation);
        }
        if (userJson.url != undefined) {
            user.setUrl(userJson.url);
        }
        if (userJson.avatarUrl != undefined) {
            user.setAvatarUrl(userJson.avatarUrl);
        }
        if (userJson.languageProficiencies != undefined) {
            user.setLanguageProficiencies(userJson.languageProficiencies);
        }
        return user;
    }


}

export enum UserStatusEnum {
    NEW = "NEW",
    INACTIVE = "INACTIVE",
    ACTIVE = "ACTIVE"
}

// export class UserDeserializer {
    
//     /**
//      * @param resp json response containing {"user"" : [{givenName: string, familyName: string, ...}, {...}]}
//      */
//     static createUsersArray(resp: any): User[] {
//         var users: User[] = [];
//         for (var i = 0; i < resp.length; i++) {
//             users.push(this.createUser(resp[i]));
//         }
//         return users;
//     }

//     /**
//      * Parses a json response, creates and returns a User. Returns null if no user is present in input param
//      * @param resp could be a "data" element of a response (containing a "user" element)
//      * or directly a "user" element
//      */
//     static createUser(userJson: any): User {
//         if (userJson.email == null) { //user object is empty (scenario: getUser with no logged user)
//             return null;
//         }
//         var user = new User(userJson.email, userJson.givenName, userJson.familyName, userJson.iri);
//         user.setRegistrationDate(userJson.registrationDate);
//         user.setStatus(userJson.status);
//         user.setAdmin(userJson.admin);
//         user.setOnline(userJson.online);
//         if (userJson.birthday != undefined) {
//             user.setBirthday(userJson.birthday);
//         }
//         if (userJson.phone != undefined) {
//             user.setPhone(userJson.phone);
//         }
//         if (userJson.gender != undefined) {
//             user.setGender(userJson.gender)
//         }
//         if (userJson.country != undefined) {
//             user.setCountry(userJson.country);
//         }
//         if (userJson.address != undefined) {
//             user.setAddress(userJson.address);
//         }
//         if (userJson.affiliation != undefined) {
//             user.setAffiliation(userJson.affiliation);
//         }
//         if (userJson.url != undefined) {
//             user.setUrl(userJson.url);
//         }
//         if (userJson.avatarUrl != undefined) {
//             user.setAvatarUrl(userJson.avatarUrl);
//         }
//         if (userJson.languageProficiencies != undefined) {
//             user.setLanguageProficiencies(userJson.languageProficiencies);
//         }
//         return user;
//     }
// }