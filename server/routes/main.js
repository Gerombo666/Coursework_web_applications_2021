const ObjectID = require('mongodb').ObjectID;
const nodemailer = require('../config/nodemailer.config');

module.exports = function (server, db) {
    server.get('/', async (req, res) => {
        try {
            const store = await db.collection('content').findOne({});
            db.collection('categories').find().toArray((err, result) => {
                const categories = result.map(category => category.title[0].toUpperCase() + category.title.slice(1));
                res.render('main/index', {
                    pageName: 'index',
                    title: `${store.title} | Главная`,
                    categories,
                    store: {
                        title: store.title,
                        info: store.info,
                        infoBottom: store.infoBottom,
                        color: store.color
                    }
                });
            });
        } catch {
            res.status(500).render('main/404');
        }
    });
    server.get('/how-to-buy', async (req, res) => {
        try {
            const store = await db.collection('content').findOne({});
            res.render('main/how-to-buy', {
                pageName: 'how-to-buy',
                title: `${store.title} | Как купить товар`,
                store: {
                    title: store.title,
                    howToBuy: store.howToBuy,
                    color: store.color
                }
            });
        } catch {
            res.status(500).render('main/404');
        }
    });
    server.get('/contacts', async (req, res) => {
        try {
            const store = await db.collection('content').findOne({});
            res.render('main/contacts', {
                pageName: 'contacts',
                title: `${store.title} | Контакты`,
                store: {
                    title: store.title,
                    contacts: store.contacts,
                    color: store.color
                }
            });
        } catch {
            res.status(500).render('main/404');
        }
    });
    server.get('/comments', async (req, res) => {
        try {
            const store = await db.collection('content').findOne({});
            res.render('main/comments', {
                pageName: 'comments',
                title: `${store.title} | Отзывы`,
                store: {
                    title: store.title,
                    color: store.color
                }
            });
        } catch {
            res.status(500).render('main/404');
        }
    });
    server.get('/my-orders', async (req, res) => {
        try {
            const store = await db.collection('content').findOne({});
            res.render('main/my-orders', {
                pageName: 'my-orders',
                title: `${store.title} | Мои покупки`,
                store: {
                    title: store.title,
                    color: store.color
                }
            });
        } catch {
            res.status(500).render('main/404');
        }
    });
    server.get('/product/:id', async (req, res) => {
        const store = await db.collection('content').findOne({});
        const product = new Promise((resolve, reject) => {
            db.collection('items').find({_id: ObjectID(req.params.id)}).toArray()
                .then((items) => {
                    const item = items.find(item => item);
                    resolve(item);
                });
        });

        product.then((item) => {
            return new Promise((resolve, reject) => {
                db.collection('categories').find({title: item.category}).toArray()
                    .then((categories) => {
                        const category = categories.find(category => category);
                        resolve({item, category});
                    });
            });
        })
        .then(((data) => {
            const item = data.item,
                category = data.category;
            res.render('main/product', {
                title: item.title,
                image: item.icon,
                img: item.img,
                count: item.count,
                category: item.category[0].toUpperCase() + item.category.slice(1),
                description_1: item.description_1,
                description_1_title: item.description_1_title,
                description_2: item.description_2,
                description_2_title: item.description_2_title,
                price: item.price,
                description: item.description,
                date: item.date,
                id: item._id,
                type: category.type,
                format: category.format,
                store: {
                    title: store.title,
                    recommendations: store.recommendations,
                    color: store.color
                }
            });
        }))
        .catch(() => {
            res.status(500).render('main/404');
        });
    });
    server.post('/my-orders', async (req, res) => {
        const buyers = await db.collection('buyers').find({email: req.body.email}).toArray();
        if (buyers.length > 0) {
            // рендерим html
            const html = buyers.map((buyer) => {
                return `
                    <b>Номер заказа: ${buyer.bill_id}</b><br>
                    <b>Дата оплаты: ${new Date(buyer.date).toLocaleDateString()}</b><br>
                    <b>Данные товара:</b><br>
                    <p>${buyer.data.join('<br>')}</p>
                    <p>======================================================================</p>
                `;
            });

            // высылаем данные покупателю
            try {
                await nodemailer.transporter.sendMail({
                    from: `"Ваши покупки." <${process.env.EMAIL_LOGIN}>`,
                    to: req.body.email, 
                    subject: "Данные купленных товаров находятся в этом письме.",
                    html: html.join('')
                });
                res.json({status: 'OK'});
            } catch (error) {
                console.log(error)
                res.json({status: 'ERR'});
            }
        } else {
            res.json({status: 'NF'});
        }
    });
}
