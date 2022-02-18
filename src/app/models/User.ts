export class User {
    private email: string;
    private givenName: string;
    private familyName: string
    private iri: string;
    private phone: string;
    private address: string;
    private registrationDate: Date;
    private affiliation: string;
    private url: string;
    private avatarUrl: string;
    private languageProficiencies: string[];
    private status: UserStatusEnum;
    private admin: boolean = false;
    private superuser: boolean = false;
    private online: boolean = false;
    private samlLevel: SamlLevel;

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

    setPhone(phone: string) {
        this.phone = phone;
    }

    getPhone(): string {
        return this.phone;
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

    setSuperUser(superuser: boolean) {
        this.superuser = superuser;
    }

    isSuperUser(strict: boolean): boolean {
        if (strict) {
            return this.superuser;
        } else {
            return this.superuser || this.admin;
        }
        
    }

    setSamlLevel(samlLevel: SamlLevel) {
        this.samlLevel = samlLevel;
    }

    getSamlLevel(): SamlLevel {
        return this.samlLevel;
    }

    isSamlUser(): boolean {
        return this.samlLevel != null;
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






    /*
     * ===== Deserializer =====
     */

    /**
    * @param resp json response containing {"user"" : [{givenName: string, familyName: string, ...}, {...}]}
    */
    static createUsersArray(resp: any): User[] {
        let users: User[] = [];
        for (let i = 0; i < resp.length; i++) {
            users.push(this.parse(resp[i]));
        }
        return users;
    }

    /**
     * Parses a json response, creates and returns a User. Returns null if no user is present in input param
     * @param resp could be a "data" element of a response (containing a "user" element)
     * or directly a "user" element
     */
    static parse(userJson: any): User {
        if (userJson.email == null) { //user object is empty (scenario: getUser with no logged user)
            return null;
        }
        let user = new User(userJson.email, userJson.givenName, userJson.familyName, userJson.iri);
        user.setRegistrationDate(userJson.registrationDate);
        user.setStatus(userJson.status);
        user.setAdmin(userJson.admin);
        user.setSuperUser(userJson.superuser);
        user.setOnline(userJson.online);
        if (userJson.phone != undefined) {
            user.setPhone(userJson.phone);
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
        user.setSamlLevel(userJson.samlLevel);
        if (userJson.avatarUrl != undefined) {
            user.setAvatarUrl(userJson.avatarUrl);
        }
        if (userJson.languageProficiencies != undefined) {
            user.setLanguageProficiencies(userJson.languageProficiencies);
        }
        return user;
    }


}

export enum SamlLevel {
    LEV_1 = "LEV_1", //first user registered
    LEV_2 = "LEV_2" //other users already registered
}

export enum UserStatusEnum {
    NEW = "NEW",
    INACTIVE = "INACTIVE",
    ACTIVE = "ACTIVE"
}

export class UserForm {

    email: string;
    username: string;
    password: string;
    confirmedPassword: string;
    givenName: string;
    familyName: string;
    address: string;
    phone: string;
    affiliation: string;
    url: string;
    avatarUrl: string;
    iri: string;
    urlAsIri: boolean;
    languageProficiencies: string[];

    static emailRegexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    static iriRegexp = new RegExp("\\b(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]");

    constructor() { }

    static isValidEmail(email: string) {
        return UserForm.emailRegexp.test(email);
    }

    static isIriValid(iri: string) {
        return UserForm.iriRegexp.test(iri);
    }
}
