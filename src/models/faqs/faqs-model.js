/**
 *  -------Import all classes and packages -------------
 */
import configContainer from "../../config/localhost";
import { dbContext, Sequelize } from "../../core/db";
import { Faq } from "../../entities/faqs/faq";

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class FaqsModel {

    constructor() {
        //
    }

    getFaqsByFaqType(faqType) {
        return Faq.findAll({
            where: {
                category: faqType
            }
        })
    }
}