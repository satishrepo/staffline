/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';


/**
 *  -------Define CandidateSkills model -------------
 */
const CandidateSkills = dbContext.define('CandidateSkills', {
    candidateSkillId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "CandidateSkill_Id"
    },
    skillName: {
        type: Sequelize.STRING,
        field: "SkillName"
    },
    yearExp: {
        type: Sequelize.DECIMAL,
        field: "YearExp"
    },
    employeeDetailsId: {
        type: Sequelize.INTEGER,
        field: "EmployeeDetails_Id"
    },
    resumeId: {
        type: Sequelize.INTEGER,
        field: "Resume_Id"
    },
    isPrimary: {
        type: Sequelize.INTEGER,
        field: "IsPrimary"
    }    
});


module.exports = {
    CandidateSkills: CandidateSkills,
}