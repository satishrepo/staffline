/**
 *  -------Import all classes and packages -------------
 */
import pwdPolicy from 'password-rules';
import configContainer from '../config/localhost';
import enums from '../core/enums';

let config = configContainer.loadConfig();

export default class PasswordPolicy {

    constructor() {
    }

    validate(password) {
        let options = {
            minimumLength: enums.passwordPolicy.minimumLength,
            maximumLength: enums.passwordPolicy.maximumLength,
            requireCapital: enums.passwordPolicy.requireCapital,
            requireLower: enums.passwordPolicy.requireLower,
            requireNumber: enums.passwordPolicy.requireNumber,
            requireSpecial: enums.passwordPolicy.requireSpecial
        }

        return pwdPolicy(password, options);
    }

}