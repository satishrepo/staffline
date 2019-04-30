/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define ResumeEducationDataType model -------------
 */
const ResumeEducationDataType = dbContext.define('ResumeEducationDataType', {
    employeeEducationId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "Auto_Id"
    },
    refId: {
        type: Sequelize.INTEGER,
        field: "Ref_Id"
    },
    resumeId: {
        type: Sequelize.INTEGER,
        field: "Resume_Id"
    },
    qualification: {
        type: Sequelize.STRING,
        field: "DegreeName"
    },
    institutionName: {
        type: Sequelize.STRING,
        field: "SchoolName"
    },    
    passingYear: {
        type: Sequelize.DATE,
        field: "DegreeEndDate"
    }
});

module.exports = {
    ResumeEducationDataType: ResumeEducationDataType,
}