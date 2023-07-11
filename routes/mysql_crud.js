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
                var data = [d.title,d.venue,d.address1,d.address2,d.postcode,d.town,d.state,d.target_visitors,d.event_date_start,d.event_date_end,d.eventid]
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
                    fn({
                        status: true,
                        msg: "data berjaya disimpan"
                    });
                });
            }catch(err){
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
                SELECT * FROM events_register where id = ?;
                `;

                con.query(sql, [id],(err, result)=>{
                    console.log(result);
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
                SELECT * FROM events_register where eventid = ?;
                `;

                con.query(sql, [id],(err, result)=>{
                    fn(result);
                });
            }catch(err){
                fn({
                    status: false,
                    msg: err
                });
            }
        }
    }
}


module.exports = API;