enum ContentType {
    applicationXml = "application/xml",
    applicationJson = "application/json"
}

export class STResponseUtils {

    public static ContentType = ContentType;

    /**
     * Returns the data content of the response
     */
    static getResponseData(stResp: any) {
        return stResp.result;
    }

    /**
     * Returns true if the response is an error/exception/fail response
     */
    static isErrorResponse(stResp: any): boolean {
        return (this.isError(stResp) || this.isException(stResp) || this.isFail(stResp));
    }

    /**
     * Returns the error message in case the response is an error/exception/fail response
     * To use only in case isErrorResponse returns true
     */
    static getErrorResponseMessage(stResp: any): string {
        let msg: string;
        if (this.isError(stResp)) {
            msg = this.getErrorMessage(stResp);
        } else if (this.isException(stResp)) {
            msg = this.getExceptionMessage(stResp);
        } else if (this.isFail(stResp)) {
            msg = this.getFailMessage(stResp);
        }
        return msg;
    }

    static getErrorResponseExceptionName(stResp: any): string {
        return this.getExceptionName(stResp);
    }

    static getErrorResponseExceptionMessage(stResp: any): string {
        let message: string;
        //07/09/2017 currently ST return only exception error response, so I get directly the message of an exception response
        let errorMsg = this.getExceptionMessage(stResp);
        let errorMsgStartingIdx = errorMsg.indexOf(":");
        //if there is no ":" it means that the error msg contains just the exception name, so return it as the whole message
        if (errorMsgStartingIdx == -1) {
            return errorMsg;
        }
        message = errorMsg.substring(errorMsgStartingIdx + 2, errorMsg.length);
        return message;
    }

    static getErrorResponseExceptionStackTrace(stResp: any): string {
        return this.getExceptionStackTrace(stResp);
    }

    /**
     * Checks if the response is an exception response
     */
    private static isException(stResp: any): boolean {
        if (stResp.stresponse != undefined) {
            return stResp.stresponse.type == "exception"; //old json responses have stresponse object
        } else {
            return false; //new json responses, in case of error return an XML response
        }
    }

    /**
	 * Returns the exception message
	 */
    private static getExceptionMessage(stResp: any): string {
        return stResp.stresponse.msg;
    }

    /**
	 * Returns the exception name
	 */
    private static getExceptionName(stResp: any): string {
        return stResp.stresponse.exception;
    }

    /**
	 * Returns the exception stack trace
	 */
    private static getExceptionStackTrace(stResp: any): string {
        return stResp.stresponse.stackTrace;
    }

	/**
	 * Checks if the response is an exception response
	 */
    private static isError(stResp: any): boolean {
        if (stResp.stresponse != undefined) {
            return stResp.stresponse.type == "error"; //old json responses have stresponse object
        } else {
            return false; //new json responses, in case of error return an XML response
        }
    }

	/**
	 * Returns the exception message
	 */
    private static getErrorMessage(stResp: any): string {
        return stResp.stresponse.msg;
    }

	/**
	 * Checks if the response is a fail response
	 */
    private static isFail(stResp: any): boolean {
        if (stResp.stresponse != undefined) {
            return stResp.stresponse.reply.status == "fail"; //old json responses have stresponse object
        } else {
            return false; //new json responses, in case of error return an XML response
        }
    }

	/**
	 * Returns the fail message
	 */
    private static getFailMessage(stResp: any): string {
        return stResp.stresponse.reply.msg;
    }

}