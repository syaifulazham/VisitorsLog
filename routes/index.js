const express = require('express');
const session = require('express-session');

const qrcode = require('qrcode');
const nodemailer = require('nodemailer');

const crypto = require('crypto');

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');

const bodyParser = require('body-parser');

const API = require('./mysql_crud');
const auth = require('./auth');

var router = express.Router();


router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


//router.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
router.use(bodyParser.json());

var actions = {
    events: {
        register: (req, res) => {
            var d = {
                title: req.body.title,
                venue: req.body.venue,
                address1: req.body.address1,
                address2: req.body.address2,
                postcode: req.body.postcode,
                town: req.body.town,
                state: req.body.state,
                target_visitors: req.body.target_visitors,
                event_date_start: req.body.event_date_start,
                event_date_end: req.body.event_date_end
            };
            API.events.register(d, (result) => {
                console.log(result);
                res.send(result);
            });
        },
        update: (req, res) => {
            console.log('req borang===@@@', req.body)
            var d = {
                title: req.body.title,
                venue: req.body.venue,
                address1: req.body.address1,
                address2: req.body.address2,
                postcode: req.body.postcode,
                town: req.body.town,
                state: req.body.state,
                target_visitors: req.body.target_visitors,
                event_date_start: req.body.event_date_start,
                event_date_end: req.body.event_date_end,
                id: req.body.id
            };
            API.events.update(d, (result) => {
                res.send(result);
            });
        },
        list: (req, res) => {
            API.events.list((result) => {
                res.send(result);
            });
        },
        sign: (req, res) => {
            API.events.sign(req.body.borang, result => {
                res.send(result);
            })
        },
        presign: (req, res) => {
            API.events.presign(req.body.borang, result => {
                console.log('this is presigned: ', result);
                res.send(result);
            })
        },

    },

}


var EMAIL = {
    sendQR: async (req, res) => {
        var borang = req.body.borang;
        var strCode = borang.eventid + borang.email;
        var shaHash = crypto.createHash('sha256').update(strCode).digest('hex');
        try {
            borang.qrstring = shaHash;
            API.events.presign(borang, result => {

            });

            // Generate the QR code based on the provided string
            //const qrCodeString = 'Your QR Code Data';
            const qrCodeBuffer = await qrcode.toBuffer(shaHash);

            // Create a Nodemailer transporter
            const transporter = nodemailer.createTransport(auth._EMAIL_);

            // Send the email with the QR code as an attachment
            const mailOptions = {
                from: auth._EMAIL_.auth.user,
                to: borang.email,
                subject: 'Prapendaftaran kehadiran ' + borang.title,
                html: `
                    <html>
                        <body>
                            <span>Anda menerima email ini kerana anda telah berdaftar pra-pendaftaran untuk mengkadiri</span><br />
                            <strong>${borang.title}</strong><br/>
                            <span>Alamat: </span><strong>${borang.title}, ${borang.alamat}</strong><br/>
                            <span>Tarikh: </span><strong>${borang.tarikh}</strong><br/>
                            <br/><br/>
                            <span>**Sila gunakan QR-CODE yang disertakan untuk pendaftaran dilokasi</span>

                        </body>
                    </html>
                `,
                attachments: [
                    {
                        filename: 'qrcode.png',
                        content: qrCodeBuffer,
                    },
                ],
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    res.status(500).send('Error sending email');
                } else {
                    console.log('Email sent:', info.response);
                    res.send('Email sent successfully');
                }
            });

        } catch (error) {
            console.error('Error generating QR code:', error);
            res.status(500).send('Error generating QR code');
        }
    }
}


router.get('/', (req, res) => {
    console.log('default page.... get(/)');
    API.events.list((result) => {
        res.render('index.ejs', { title: 'Log Pelawat', data: result, page: 'list.ejs' });
    });
});

router.get('/list', (req, res) => {
    API.events.list((result) => {
        res.render('index.ejs', { title: 'Log Pelawat', data: result, page: 'list.ejs' });
    });
});

router.get('/qrscan', (req, res) => {
    res.render('index.ejs', { title: 'Log Kehadiran QR-Code', data: [], page: 'qrscan.ejs' });
});

router.post('/scan', (req, res) => {
    const imageData = req.body.imageData;
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    const buffer = Buffer.from(base64Data, 'base64');
    loadImage(buffer)
        .then((image) => {
            const canvas = createCanvas(image.width, image.height);
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, image.width, image.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                console.log('Scanned content:', code.data);
                API.events.update_presign(code.data, result=>{
                    API.events.preregistered(code.data, result2=>{
                        //console.log('===========================>>>>>>',result2);
                        res.send(result2);
                    })
                })
                // Do something with the scanned content
                
            } else {
                //console.error('No QR code found.');
                res.sendStatus(400);
            }
        })
        .catch((error) => {
            //console.error('Error loading image:', error);
            res.sendStatus(500);
        });
});

router.get('/byid/:id', (req, res) => {
    const evid = req.params.id;
    console.log('Event ID: ', evid)
    API.events.byid(evid, (result) => {
        console.log('this is the data', result)
        res.render('index.ejs', { title: 'Update Log Pelawat', data: result[0], page: 'update.ejs' });
    });
});

router.get('/register', (req, res) => {
    //console.log('register page.... get(/register)',res);
    try {
        res.render('index.ejs', { title: 'Log Pelawat', page: 'register.ejs' });
    } catch (err) {
        console.log(err);
    }
});

router.get('/log/:id', (req, res) => {
    const evid = req.params.id;
    API.events.log(evid, (result) => {
        res.render('log.ejs', { title: 'Log Pelawat', data: result });
    });
});

router.get('/log-prereg/:id', (req, res) => {
    const evid = req.params.id;
    API.events.log(evid, (result) => {
        res.render('log-prereg.ejs', { title: '(Pra-pendaftaran) Log Pelawat', data: result });
    });
});

router.get('/test', (req, res) => {

})

router.post('/api/ev/register', actions.events.register);
router.post('/api/ev/update', actions.events.update);
router.post('/api/ev/list', actions.events.list);
router.post('/api/log/sign', actions.events.sign);
router.post('/api/log/presign', EMAIL.sendQR);



module.exports = router;