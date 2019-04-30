/**
 * -------Import all classes and packages -------------
 */
import responseFormat from '../../core/response-format';
import configContainer from '../../config/localhost';
import logger from '../../core/logger';
import NewsModel from '../../models/news/news-model';


/**
 *  -------Initialize variabls-------------
 */
let config = configContainer.loadConfig(),
    newsModel = new NewsModel();

class NewsController {

    /**
     * Get News
     * @param {*} req : HTTP request argument
     * @param {*} res : HTTP response argument
     * @param {*} next : Callback argument 
     */
    getNews(req, res, next) {
        let response = responseFormat.createResponseTemplate(),
            newsType = req.body.newsType;

        if (!newsType || !(newsType == 1 || newsType == 2)) {
            response = responseFormat.getResponseMessageByCodes(['newsType'], { code: 417 });
            res.status(200).json(response);
        } else {
            newsModel.getNews(newsType)
                .then((details) => {
                    response = responseFormat.getResponseMessageByCodes('', { content: { dataList: details } });
                    res.status(200).json(response);
                }).catch((error) => {
                    let resp = commonMethods.catchError('news-controller/getNews', error);
                    response = responseFormat.getResponseMessageByCodes(resp.message, { code: resp.code });
                    res.status(resp.code).json(response);
                });
        }
    }
}

module.exports = NewsController;

