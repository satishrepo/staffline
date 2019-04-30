/**
 * -------Import all classes and packages -------------
 */
import express from 'express';
import NewsController from '../../controllers/news/news-controller';

/**
 * -------Initialize global variabls-------------
 */
let app = express();
let router = express.Router();
let newsController=new NewsController();

/**
 *  -------Declare all routes-------------
 */

let routerGetNews=router.route('/news');

/**
 *  ------ Bind all routes with related controller method-------------
 */
routerGetNews
    .post(newsController.getNews.bind(newsController));

module.exports=router;