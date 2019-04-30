/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from "../../core/db";
import logger from "../../core/logger";
import configContainer from "../../config/localhost";

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class CrudOperationModel {

    constructor() {
        //
    }


    /** 
    * Common save(create/update) operation for table entitiy
    * @param {*} modelName : model name
    * @param {*} object : model object
    * @param {*} condition :where condition
    */

    saveModel(modelName, object, condition) {
        return modelName
            .findOne({ where: condition })
            .then(function (item) {
                if (item) {
                    for( let key in object)
                    {
                        object[key] = typeof object[key] == 'string' ? object[key].trim() : object[key];
                    } 
                    
                    return item.update(object);
                } else {
                    return modelName.create(object);
                }
            })
            .catch((err) => {
                logger.error('Error has occured in commonCrudModel save/update process - ', err);
                return false;

            })
    }

    /** 
    * commom delete operation for table entitiy
    * @param {*} modelName : model name
    * @param {*} where :  object of conditions
    */

    deleteModel(modelName, where) {
        return modelName.destroy({ where: where });

    }

    /** 
    * Common find operation for table entitiy
    * @param {*} modelName : model name
    * @param {*} where :  object of conditions
    */

    findModelByCondition(model, condition) {
        return model.findOne({ where: condition, raw: true })
            .then((data) => {
                return data;
            });
    }

    /** 
    * Common find ALL
    * @param {*} modelName : model name
    */

    findAll(model) {
        return model.findAll({ raw: true })
            .then((data) => {
                return data;
            });
    }

    findAllByCondition(model, condition, attributes, orderBy) { 
        let order  = orderBy == undefined ? [] : [orderBy]; 
        if (attributes && Array.isArray(attributes) && attributes.length > 0) {
            return model.findAll({ where: condition, attributes: attributes, raw: true, order : order })
                .then((data) => {
                    return data;
                });
        }
        else {
            return model.findAll({ where: condition, raw: true })
                .then((data) => {
                    return data;
                });
        }

    }


    updateAll(modelName, object, condition) {
        return modelName.update(object, {where:condition});
    }

    bulkSave(model, objectArray){
        return  model.bulkCreate(objectArray)
                .then( (rs) => {
                    return rs;
                })
    }


}