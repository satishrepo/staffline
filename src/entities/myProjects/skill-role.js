/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define SkillRole model -------------
 */
const SkillRole = dbContext.define('Skill_Role', {
    skillRoleId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "Skill_Role_Id"
    },
    skillRoleName: {
        type: Sequelize.STRING,
        field: "Skill_Role_Name"
    }
});

module.exports = {
    SkillRole: SkillRole
}