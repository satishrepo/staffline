/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define SkillTechnology model -------------
 */
const SkillTechnology = dbContext.define('Skill_Technology', {
    technologyId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "Technology_Id"
    },  
    technologyName: {
        type: Sequelize.STRING,
        field: "Technology_Name"
    }
});

module.exports = {
    SkillTechnology: SkillTechnology
}