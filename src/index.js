import cron from 'node-cron';
import nodemailer from 'nodemailer';
import wreck from 'wreck';

const subreddits  = ['node', 'javascript', 'programming', 'webdev'];

let transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

cron.schedule('* * * * 0-7', function () {
    
    console.log('Cron running!');
    let articles = [];
    let count = 0;
    
    subreddits.forEach(function (sub) {

        const baseUrl = 'https://www.reddit.com/r/';
        const query = '/top.json?sort=top&t=week&limit=25';
        const url = baseUrl + sub + query;

        wreck.request('GET', url, {}, (error, response) => {

            wreck.read(response, null, (error, body) => {

                let data = JSON.parse(body.toString('utf8'));

                let mappedData = data.data.children.map((children) => {
                    if (children.data.subreddit === 'puppies') {
                        return '<a href=' + children.data.url + '><img style="width: 50%;" src=\"' + children.data.thumbnail + '\">' + '</img></a>';
                    } else {
                        return '<a style="font-size: 18px" href=' +  children.data.url + '>' + children.data.title + '</a>';
                    }
                })
                .map((article) => {
                    return '<p style="margin: 0 auto 40px auto">'+ article +'</p>';
                });

                articles = Array.concat(articles, mappedData);

                count++;
                if (count === subreddits.length) {
                    sendMail(articles);
                }
            });
        });
    }); 
});

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
