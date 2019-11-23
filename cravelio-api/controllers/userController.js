const db = require('../database')
const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fs = require('fs')
const juice = require('juice')
const moment = require('moment')
const apiKey = require('../configs/apiKey')
const emailSecretKey = require('../configs/emailSecretKey')
const accountVerification = require('../email-templates/accountVerification')
const resetPassword = require('../email-templates/resetPassword')

let options = {
    auth: {
        api_key: apiKey,
        domain: 'mail.cravelio.com'
    }
}

let transporter = nodemailer.createTransport(mg(options))

module.exports = {
    getUsers: (req, res) => {
        let sql = `SELECT * FROM users`

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                if (result.length > 0) {
                    res.send({
                        status: 200,
                        results: result
                    })
                } else {
                    res.send({
                        status: 404,
                        message: 'User not found',
                        results: result
                    })
                }
            } catch(err) {
                console.log(err)
            }
        })
    },
 
    getUserByEmail: (req, res) => {
        let sql = `SELECT * FROM users WHERE email = '${req.query.email}'`

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                if (result.length > 0) {
                    res.send({
                        status: 200,
                        results: result
                    })
                } else {
                    res.send({
                        status: 404,
                        message: 'User not found',
                        results: result
                    })
                }
            } catch(err) {
                console.log(err)
            }
        })
    },

    createUser: (req, res) => {
        let sql = `INSERT INTO users (first_name, last_name, email, password, is_verified, created_at, updated_at)
        VALUES ('${req.body.first_name}', '${req.body.last_name}', '${req.body.email}', 
        '${req.body.password}', 0, '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')}',
        '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')}')`

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                res.send({
                    status: 201,
                    message: 'Create user success',
                    results: result
                })
            } catch(err) {
                console.log(err)
            }
        })
    },

    sendVerificationLink: (req, res) => {
        let token = crypto.randomBytes(8).toString("hex")

        let sql = `UPDATE tokens SET is_invalid = 1 WHERE email = '${req.body.email}'`

        let sql2 = `INSERT INTO tokens (token_id, email, token, is_invalid, expired_at) 
        VALUES (0, '${req.body.email}', '${token}', 0,
        '${moment(new Date()).add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss.SSS')}')`

        let mailOptions = {
            from: 'Cravelio <donotreply@cravelio.com>',
            to: req.body.email,
            subject: 'Verify your account',
            html: juice(accountVerification(token))
        }

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                db.query(sql2, (err2, result2) => {
                    try {
                        if (err2) throw err2
        
                        try {
                            transporter.sendMail(mailOptions, (err3, info) => {
                                if (err3) throw err3
                
                                res.send({
                                    status: 200,
                                    message: 'Email sent'
                                })
                            })
                        } catch(err3) {
                            console.log(err3)
                        }
                    } catch(err2) {
                        console.log(err2)
                    }
                })
            } catch(err) {
                console.log(err)
            }
        })
    },

    checkVerificationLink: (req, res) => {
        db.query(`SELECT * FROM tokens WHERE token = '${req.query.token}' AND is_invalid = 0`, (err, result) => {
            try {
                if (err) throw err

                if (result.length > 0) {
                    if (new Date(result[0].expired_at) > new Date()) {
                        db.query(`UPDATE users SET is_verified = 1 WHERE email = '${result[0].email}'`, (err2, result2) => {
                            try {
                                if (err2) throw err2
                
                                res.send({
                                    status: 200,
                                    message: 'Account has been verified'
                                })
                            } catch(err2) {
                                console.log(err2)
                            }
                        })
                    } else {
                        res.send({
                            status: 401,
                            message: 'Token has expired',
                            results: result[0].email
                        })
                    }
                } else {
                    res.send({
                        status: 404,
                        message: 'Token invalid',
                        results: result
                    })
                }
            } catch(err) {
                console.log(err)
            }
        })
    },

    loginUser: (req, res) => {
        let sql = `SELECT * FROM users WHERE email = '${req.query.email}' AND password = '${req.query.password}'`

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                if (result.length > 0) {
                    res.send({
                        status: 200,
                        results: result
                    })
                } else {
                    res.send({
                        status: 401,
                        message: 'Wrong email or password',
                        results: result
                    })
                }
            } catch(err) {
                console.log(err)
            }
        })
    },

    getUserById: (req, res) => {
        let sql = `SELECT * FROM users WHERE user_id = ${req.params.id}`

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                if (result.length > 0) {
                    res.send({
                        status: 200,
                        results: result
                    })
                } else {
                    res.send({
                        status: 404,
                        message: 'User not found',
                        results: result
                    })
                }
            } catch(err) {
                console.log(err)
            }
        })
    },

    editWithoutProfilePicture: (req, res) => {
        let sql = `UPDATE users SET first_name = '${req.body.first_name}',
        last_name = '${req.body.last_name}', email = '${req.body.email}',
        updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')}',`

        if (req.body.password) {
            sql += ` password = '${req.body.password}',`
        }

        if (req.body.birth_date) {
            sql += ` birth_date = '${req.body.birth_date}',`
        }

        if (req.body.address) {
            sql += ` address = '${req.body.address}',`
        }

        if (req.body.phone_number) {
            sql += ` phone_number = '${req.body.phone_number}',`
        }

        sql = sql.slice(0, -1)
        sql += ` WHERE user_id = ${req.params.id}`

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                res.send({
                    status: 200,
                    message: 'Edit profile success',
                    results: result
                })
            } catch(err) {
                console.log(err)
            }
        }) 
    },

    editWithProfilePicture: (req, res) => {
        try {
            if (req.validation) throw req.validation
            if (req.file.size > 5000000) throw {error: true, message: 'Image size too large'}

            let data = JSON.parse(req.body.data)

            let sql = `UPDATE users SET first_name = '${data.first_name}',
            last_name = '${data.last_name}', email = '${data.email}',
            updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')}',`
    
            if (req.file.filename) {
                sql += ` profile_picture = '${req.file.filename}',`
            }

            if (data.password) {
                sql += ` password = '${data.password}',`
            }
    
            if (data.birth_date) {
                sql += ` birth_date = '${data.birth_date}',`
            }
    
            if (data.address) {
                sql += ` address = '${data.address}',`
            }
    
            if (data.phone_number) {
                sql += ` phone_number = '${data.phone_number}',`
            }
    
            sql = sql.slice(0, -1)
            sql += ` WHERE user_id = ${req.params.id}`

            db.query(sql, (err, result) => {
                try {
                    if (err) throw err

                    res.send({
                        status: 200,
                        message: 'Edit profile success',
                        results: result
                    })
                } catch (error) {
                    fs.unlinkSync(req.file.path)
                    console.log(error)                
                }
            })
        } catch (error) {
            fs.unlinkSync(req.file.path)
            console.log(error)
        }
    },

    sendPasswordLink: (req, res) => {
        let info = {}
        info.email = req.body.email
        info.expiry = new Date(new Date().getTime() +  10 * 60 * 1000)

        let token = jwt.sign(info, emailSecretKey)

        let mailOptions = {
            from: 'Cravelio <donotreply@cravelio.com>',
            to: req.body.email,
            subject: 'Forgot Password',
            html: juice(resetPassword(token))
        }

        try {
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) throw err

                res.send({
                    status: 200,
                    message: 'Email sent'
                }) 
            }) 
        } catch(err) {
            console.log(err)
        }
    },

    checkPasswordLink: (req, res) => {
        let token = req.query.token
        let data = jwt.verify(token, emailSecretKey)

        try {
            if (new Date(data.expiry) > new Date()) {
                res.send({
                    status: 200,
                    message: 'Link is active'
                })
            } else {
                res.send({
                    status: 404,
                    message: 'Link has expired'
                })
            }
        } catch(err) {
            console.log(err)
        }
    },

    resetPassword: (req, res) => {
        let sql = `UPDATE users SET password = '${req.body.password}' WHERE email = '${data.email}'`
        let token = req.body.token
        let data = jwt.verify(token, emailSecretKey)

        db.query(sql, (err, result) => {
            try {
                if (err) throw err

                if (result.length > 0) {
                    res.send({
                        status: 200,
                        results: result
                    })
                } else {
                    res.send({
                        status: 401,
                        message: 'Error resetting password',
                        results: result
                    })
                }
            } catch(err) {
                console.log(err)
            }
        })
    }
}