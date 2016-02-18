import cron from 'node-cron';
import nodemailer from 'nodemailer';
import wreck from 'wreck';

const subreddits  = ['node', 'javascript', 'programming', 'webdev'];

let transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

//cron.schedule('* * * * 0-7', function () {

console.log('Cron running!');
let articles = [];
let count = 0;

function getArticle(url) {
    return new Promise((resolve, reject) => {
        wreck.request('GET', url, {}, (error, response) => {
            if (error) { reject(error); }

            wreck.read(response, null, (error, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(body.toString('utf8'));
                }
            });
        });
    });
}

function getArticles(subreddits) {
    return subreddits.map((subreddit) => {
        return getArticle(getUrl(subreddit));
    });
}

function getUrl(subreddit) {
    const baseUrl = 'https://www.reddit.com/r/';
    const query = '/top.json?sort=top&t=week&limit=5';

    return baseUrl + subreddit + query;
}

function sendMail(articles) {
    let mailOptions = {
        to: 'shaunwarman1@gmail.com',
        from: 'Mail Test',
        subject: 'Mail Test',
        html: articles.join(' ')
    };

    transporter.sendMail(mailOptions, (error, response) => {
        if (error){
            return console.log(error);
        }
        console.log('Message sent: ' + response.response);
    });
};

async function main(subreddits) {

    try {

        const articles = await getArticles(subreddits);

        /**
         * Filter json here { data: [{children}*5]}, {}, {}, {}
         */

        const data = await Promise.all(articles);

        const htmlData = JSON.parse(data);

        const html = htmlData.data.children.map((children) => {
            return '<p style="margin: 0 auto 40px auto"><a style="font-size: 18px" href=' +  children.data.url + '>' + children.data.title + '</a></p>';
        });

        sendMail(html);
    } catch (error) {
        console.log(error);
    }
}

main(subreddits);