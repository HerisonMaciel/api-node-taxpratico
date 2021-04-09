const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.postCadastro = (req, res, next) => {
    const usuario = {
        nome: req.body.nome,
        email: req.body.email,
    }
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error: error})}
        conn.query('SELECT * FROM usuarios WHERE email = ?', [usuario.email], (error, result) =>{
            if(error){ return res.status(500).send({error : error})}
            if(result.length > 0){
                conn.release();
                res.status(409).send({mensagem: "Email já cadastrado!"})
            }else{
                bcrypt.hash(req.body.senha, 8, (errBcrypt, hash) => {
                    if(errBcrypt){ return res.status(500).send({error : errBcrypt})}
                    mysql.query('INSERT INTO usuarios (nome, email, senha) VALUES (?,?,?)', 
                    [usuario.nome, usuario.email, hash],
                    (error, result) => {
                        conn.release();
                        if(error){ return res.status(500).send({error : error})}
                        const response = {
                            mensagem: "Usuário criado com sucesso!",
                            usuarioCriado: {
                                id: result.insertId,
                                nome: usuario.nome,
                                email: usuario.email
                            }
                        }
                        return res.status(201).send({response});
                    }
                    )    
                });
            }
        })
    });
};

exports.postLogin = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error: error})}
        mysql.query('SELECT * FROM usuarios WHERE email = ?' ,[req.body.email], (error, results, fields) => {
            conn.release();
            if(error){ return res.status(500).send({error: error}) }
            if(results.length < 1){
                return res.status(401).send({ mensagem: "Falha na autenticação!" })
            }
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if(err){
                    return res.status(401).send({ mensagem: "Falha na autenticação!" })
                }
                if(result){
                    const token = jwt.sign({
                        id: results[0].id,
                        nome: results[0].nome,
                        email: results[0].email
                    }, 
                        process.env.KEY,
                        { expiresIn: "2h" } //key expira em 2h
                    )
                    return res.status(200).send({ mensagem: "Autenticado com sucesso!" , token: token})
                }
                return res.status(401).send({ mensagem: "Falha na autenticação!" })
            })
        }
    )
    })
};