const db = require('../database')

module.exports = {
    getTrips: (req, res) => {
        let sql = `select * from trips as t join pictures as p on t.trip_id = p.trip_id where p.is_main = 1`
        if(req.params.path){
            sql += ` and t.path = '${req.params.path}'`
        }
        if(req.query.trip_id){
            sql += ` and t.trip_id = '${req.query.trip_id}'`
        }
        db.query(sql, (err, result) => {
            if (err) throw err
            if (result.length > 0){
                let data = result.map(val => {
                    return {
                        trip_id: val.trip_id,
                        path: val.path,
                        trip_name: val.trip_name,
                        picture_link: val.picture_link,
                        meeting_point: val.meeting_point,
                        price: val.price,
                        duration: val.duration,
                        category: val.category,
                        region: val.region,
                        quota: val.quota,
                        description: val.description,
                        itinerary: val.itinerary,
                        price_includes: val.price_includes,
                        price_excludes: val.price_excludes,
                        faq: val.faq
                    }
                })
                res.send({
                    status: 200,
                    results: data
                })
            } else {
                res.send({
                    status: 404,
                    message: 'Data not found',
                    results: result
                })
            }
        })
    }
}