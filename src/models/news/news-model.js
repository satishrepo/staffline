/**
 *  -------Import all classes and packages -------------
 */
import { dbContext, Sequelize } from "../../core/db";
import configContainer from "../../config/localhost";
import logger from "../../core/logger";
import { NewsMaster } from '../../entities/news/news';
import enums from '../../core/enums';

/**
 *  -------Initialize global variabls-------------
 */
let config = configContainer.loadConfig();

export default class NewsModel {
    constructor() {
        //
    }
    getNews(newsType) {
        return NewsMaster.findAll({
            where: {
                Active: 'Y',
                NewsType: ~~newsType,
                $or: [
                    {
                        NEWSCATEGORY:  ~~enums.newsCategory.outside
                    },
                    {
                        NEWSCATEGORY:  ~~enums.newsCategory.both
                    }
                ]
            },
            order: [
                ['NewsDate', 'DESC']
            ],
            attributes: [
                ["NewsID", "newsId"],
                ["NewsName", "newsName"],
                ["NewsDate", "newsDate"],
                ["NewsDetails", "newsDetails"],
                ["MoreDetails", "moreDetails"]
            ]
        });
    }
}