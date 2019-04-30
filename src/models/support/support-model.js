/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import { VacationRequests } from "../../entities/vacations/vacations";
import CommonMethods from "../../core/common-methods";
import enums from '../../core/enums';

/**
 *  -------Initialize global variabls-------------
 */

import { Department } from '../../entities/support/department';

let config = configContainer.loadConfig();

export default class SupportModel {

    constructor() {
        //
    }

    /**
     * get Department Contacts
     *  
     */

    getContacts()
    {
        let query = "EXEC API_SP_uspSupportContacts @appId='" + enums.appRefParentId.contactParentId + "' " ;
        return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
            .then((data) => {
                let query = "EXEC API_SP_uspSupportContacts @appId='" + enums.appRefParentId.emailParentId + "' " ;
                return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
                    .then((data1) => { 
                        return {contacts : data, emails: data1};
                    })

            })
    }
    
     
}