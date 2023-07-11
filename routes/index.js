const express = require('express');
const session = require('express-session');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const jsQR = require('jsqr');

const bodyParser = require('body-parser');

const API = require('./mysql_crud'); 

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
router.use(bodyParser.json());

var actions = {
    events:{
        register:(req, res)=>{
            var d = {
                title : req.body.title,
                venue : req.body.venue,
                address1 : req.body.address1,
                address2 : req.body.address2,
                postcode : req.body.postcode,
                town : req.body.town,
                state : req.body.state,
                target_visitors : req.body.target_visitors,
                event_date_start : req.body.event_date_start,
                event_date_end : req.body.event_date_end
            };
            API.events.register(d, (result)=>{
                console.log(result);
                res.send(result);
            });
        },
        update:(req, res)=>{
            var d = {
                title : req.body.txttitle,
                venue : req.body.txtvanue,
                address1 : req.body.txtaddr1,
                address2 : req.body.txtaddr2,
                postcode : req.body.txtpostcode,
                town : req.body.txttown,
                state : req.body.cmbstate,
                target_visitors : req.body.txttarget,
                event_date_start : req.body.dtstart,
                event_date_end : req.body.dtend
            };
            API.events.update(d, (result)=>{
                res.send(result);
            });
        },
        list:(req, res)=>{
            API.events.list((result)=>{
                res.send(result);
            });
        },
    },
    
}

router.get('/', (req,res)=>{
    console.log('default page.... get(/)');
    API.events.list((result)=>{
        res.render('index.ejs', {title: 'Log Pelawat', data:result, page:'list.ejs'});
    });
});

router.get('/list', (req,res)=>{
    API.events.list((result)=>{
        res.render('index.ejs', {title: 'Log Pelawat', data:result, page:'list.ejs'});
    });
});

router.get('/qrscan', (req,res)=>{
    res.render('index.ejs', {title: 'Log Kehadiran QR-Code', data:[], page:'qrscan.ejs'});
});

router.post('/scan', (req, res) => {
    const imageData = req.body.imageData; // Assuming you're sending the image data from the frontend
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
  
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
  
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
  
      if (code) {
        console.log('Scanned content:', code.data);
        // Do something with the scanned content
      } else {
        console.error('No QR code found.');
      }
    };
  
    img.onerror = (err) => {
      console.error(err);
    };
  
    img.src = `data:image/png;base64,${imageData}`;
    res.sendStatus(200);
  });

router.get('/byid/:id', (req,res)=>{
    const evid = req.params.id;
    console.log('Event ID: ',evid)
    API.events.byid(evid, (result)=>{
        console.log('this is the data',result)
        res.render('index.ejs', {title: 'Update Log Pelawat', data:result[0], page:'update.ejs'});
    });
});

router.get('/register', (req,res)=>{
    //console.log('register page.... get(/register)',res);
    try{
        res.render('index.ejs', {title: 'Log Pelawat', page:'register.ejs'});
    }catch(err){
        console.log(err);
    }
});

router.get('/log/:id', (req,res)=>{
    const evid = req.params.id;
    API.events.log(evid, (result)=>{
        res.render('log.ejs', {title: 'Log Pelawat', data:result});
    });
});

router.post('/api/ev/register', actions.events.register);
router.post('/api/ev/update', actions.events.update);
router.post('/api/ev/list', actions.events.list);



module.exports = router;