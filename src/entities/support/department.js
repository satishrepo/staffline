/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from '../../core/db';

/**
 *  -------Define Department model -------------
 */
const Department = dbContext.define('Department', {
    deptCode: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "Dept_Code"
    },
    deptName: {
        type: Sequelize.STRING,
        field: "Dept_Name"
    },
    deptEmail: {
        type: Sequelize.STRING,
        field: "Dept_Email"
    },
    employee: {
        type: Sequelize.STRING,
        field: "Employee"
    },
    phone: {
        type: Sequelize.STRING,
        field: "Phone"
    },
    extension: {
        type: Sequelize.STRING,
        field: "Extension"
    },
    useInDigitalLibrary: {
        type: Sequelize.INTEGER,
        field: "useInDigitalLibrary"
    },
    displayOutside: {
        type: Sequelize.INTEGER,
        field: "DisplayOutside"
    }    
});

module.exports = {
    Department: Department  
}