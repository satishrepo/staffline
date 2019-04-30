import { dbContext, Sequelize } from "../../core/db";
import enums from '../../core/enums';

export default class StaffContactsModel {
  constructor() { }

  /**
   * Get Staff List with search filters
   */
  getStaffContacts(searchText, pageNum, pageSize) {
    let filter = '';
    searchText = (searchText) ? searchText.toString().replace(/'/g, "''+CHAR(39)+''") : "";

    if (searchText && searchText != "") {
      filter = " and email like ''%" + searchText + "%'' OR name like ''%" + searchText + "%'' OR jobTitle like ''%" + searchText + "%'' OR jobRole like ''%" + searchText + "%''"
    }
    let query = "EXEC API_SP_StaffContacts @pageNum=\'" + pageNum + "\', @pageSize=\'" + pageSize + "\' ,@where='" + filter + "' ";

    return dbContext.query(query, { type: dbContext.QueryTypes.SELECT })
      .then((details) => {
        let paging = {
          totalCount: 0,
          currentPage: enums.paging.pageCount,
        },
          staffs = [];

        if (details) {
          paging.totalCount = (details[0].totalCount) ? details[0].totalCount : 0;
          paging.currentPage = (details[1].currentPage) ? details[1].currentPage : enums.paging.pageCount;
          staffs = details.splice(2, details.length);
        }

        return [{
          paging: paging,
          staffs: staffs
        }];
      })
  }
}



