/**
 *  -------Import all classes and packages -------------
 */
import otplib from 'otplib';

export default class OTPLib {

    constructor() {
        //
    }

    generateOTP() {

        const secret = otplib.authenticator.generateSecret();
        const token = otplib.authenticator.generate(secret);

        return {
            secret,
            token
        }
    }

    verifyOTP(secret, token) {
        const otpValid = otplib.authenticator.verify({
            secret: secret,
            token: token
        });
        return otpValid;
    }
}