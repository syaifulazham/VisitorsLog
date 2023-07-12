var mysql = require('mysql');
const auth = require('./auth');

let __DATA__SCHEMA__ = 'visitors';

let API = {
    events:{
        register: (d, fn)=>{
            
            var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
            var data = [d.title,d.event_date_start,d.event_date_end,
                        d.title,d.venue,d.address1,d.address2,d.postcode,d.town,d.state,d.target_visitors*1,d.event_date_start,d.event_date_end]
            //console.log('conn options: ',auth.auth()[__DATA__SCHEMA__], data);
            var sql = `
            INSERT INTO events_register(eventid, title,venue,address1,address2,postcode,town,state,target_visitors,event_date_start,event_date_end)
            VALUES(sha(concat(?,?,?)),?,?,?,?,?,?,?,?,?,?)
            `;

            con.query(sql, data, (err, result)=>{
                if (err) {
                    console.log(err);
                } else {
                    
                    con.end();
                    //con.release();

                    fn({msg: `Inserted ${result.affectedRows} rows`});
                }
            });
        },
        update: (d, fn) =>{
            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var data = [
                    d.title,
                    d.venue,
                    d.address1,
                    d.address2,
                    d.postcode,
                    d.town,
                    d.state,
                    d.target_visitors,
                    d.event_date_start,
                    d.event_date_end,
                    d.id
                ];
                var sql = `
                UPDATE events_register
                SET title = ?,
                    venue = ?,
                    address1 = ?,
                    address2 = ?,
                    postcode = ?,
                    town = ?,
                    state = ?,
                    target_visitors = ?,
                    event_date_start = ?,
                    event_date_end = ?
                WHERE id = ?
                `;

                con.query(sql, data, (err, result)=>{
                    console.log(result);
                    if(err) console.log(err);
                    con.end();
                    fn({
                        status: true,
                        msg: "data berjaya disimpan"
                    });
                });
            }catch(err){
                console.log(err);
                fn({
                    status: false,
                    msg: err
                });
            }
        },
        list: (fn) =>{
            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var sql = `
                SELECT 
                id,eventid,title,
                venue,address1,address2,
                postcode,town,state,target_visitors,
                DATE_FORMAT(event_date_start, "%Y-%m-%d") event_date_start,
                DATE_FORMAT(event_date_end, "%Y-%m-%d") event_date_end
                 
                FROM events_register;
                `;

                con.query(sql, (err, result)=>{
                    con.end();
                    fn(result);
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        },
        byid: (id,fn) =>{
            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var sql = `
                SELECT a.*,
                DATE_FORMAT(event_date_start, "%Y-%m-%d") dt_start,
                DATE_FORMAT(event_date_end, "%Y-%m-%d") dt_end  
                FROM events_register a where id = ?;
                `;

                con.query(sql, [id],(err, result)=>{
                    console.log(result);
                    con.end();
                    fn(result);
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        },
        log: (id, fn) => {
            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var sql = `
                SELECT a.*,
                DATE_FORMAT(event_date_start, "%d-%m-%Y") dt_start,
                DATE_FORMAT(event_date_end, "%d-%m-%Y") dt_end FROM events_register a where eventid = ?;
                `;

                con.query(sql, [id],(err, result)=>{
                    con.end();
                    fn(result);
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        },
        preregistered: (id, fn) => {
            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var sql = `
                SELECT * FROM events_visitors where preregistrationid = ?;
                `;

                con.query(sql, [id],(err, result)=>{
                    con.end();
                    fn(result);
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        },

        sign: (p, fn) => {
            console.log('xxxxxxx====>>>>',p);
            var data = [
                p.eventid,
                p.nama,
                p.email,
                p.notel,
                p.organisasi,
                p.negeri,
                p.umur,
                p.jantina,
                p.pelawat,
                p.pengiring,
                p.bilpelajar,
                p.hadir
            ];

            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var sql = `
                insert into events_visitors(eventid,nama,email,notel,organisasi,negeri,umur,jantina,pelawat,pengiring,bilpelajar,hadir)
                values(?,?,?,?,?,?,?,?,?,?,?,?)
                `;

                con.query(sql, data,(err, result)=>{
                    con.end();
                    fn({
                        status: true,
                        msg: result
                    });
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        },

        presign: (p, fn) => {
            //console.log('xxxxxxx====>>>>',p);
            var data = [
                p.eventid,
                p.nama,
                p.email,
                p.notel,
                p.organisasi,
                p.negeri,
                p.umur,
                p.jantina,
                p.pelawat,
                p.pengiring,
                p.bilpelajar,
                p.qrstring,
                0
            ];

            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var sql = `
                insert into events_visitors(eventid,nama,email,notel,organisasi,negeri,umur,jantina,pelawat,pengiring,bilpelajar,preregistrationid,hadir)
                values(?,?,?,?,?,?,?,?,?,?,?,?,?)
                `;

                con.query(sql, data,(err, result)=>{
                    con.end();
                    fn({
                        status: true,
                        msg: result
                    });
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        },

        update_presign: (id, fn) => {
            
            try{
                var con = mysql.createConnection(auth.auth()[__DATA__SCHEMA__]);
                var sql = `
                update events_visitors set hadir = 1 where preregistrationid = ?
                `;

                con.query(sql, id,(err, result)=>{
                    con.end();
                    fn({
                        status: true,
                        msg: result
                    });
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        },
    }
}


module.exports = API;