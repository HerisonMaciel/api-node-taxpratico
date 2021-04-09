const mysql = require('../mysql').pool;

exports.getProdutos = (req, res, next) => {
    mysql.getConnection((error, coon) => {
        if(error){ return res.status(500).send({error: error})}
        coon.query(
            'SELECT * FROM produtos',
            (error, result, fields) =>{
                coon.release();
                if(error){ return res.status(500).send({error: error})}
                const response = {
                    quantidade: result.length,
                    produtos: result.map(prod => {
                        return {
                            id_produto: prod.id,
                            nome: prod.nome,
                            preco: prod.preco,
                            imagem: prod.imagem,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de um produto específico',
                                url: process.env.CAMINHO + 'produtos/' + prod.id
                            }
                        }
                    })
                } 
                return res.status(200).send({response})
            }
        )
    });
}

exports.getProduto = (req, res, next) => {
    const id = req.params.id_produto;
    mysql.getConnection((error, coon) => {
        if(error){ return res.status(500).send({error: error})}
        coon.query(
            'SELECT * FROM produtos WHERE id = ?',[id],
            (error, result, fields) =>{
                coon.release();
                if(error){ return res.status(500).send({error: error})};
                if(result.length == 0){return res.status(404).send({
                    mensagem: 'Produto não encontrado'
                })};
                const response = {
                    produto: {
                        id_produto  : result[0].id,
                        nome        : result[0].nome,
                        preco       : result[0].preco,
                        imagem      : result[0].imagem,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: process.env.CAMINHO + 'produtos/'
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )
    });
}

exports.postProduto = (req, res, next) => {
    console.log(req.file);
    const produto = {
        nome: req.body.nome,
        preco: req.body.preco,
        imagem: req.file.path
    }
    mysql.getConnection((error, coon) => {
        if(error){ return res.status(500).send({error: error})}
        coon.query(
            'INSERT INTO produtos (nome, preco, imagem) VALUES (?,?,?)',
            [produto.nome, produto.preco, produto.imagem],
            (error, result, field) => {
                coon.release();
                if(error){ return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto inserido com sucesso!',
                    produtoCriado: {
                        id_produto  : result.id,
                        nome        : produto.nome,
                        preco       : produto.preco,
                        imagem      : produto.imagem,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os produtos',
                            url: process.env.CAMINHO + 'produtos/'
                        }
                    }
                }
                return res.status(201).send(response);
            }
        );
    });
}

exports.patchProduto = (req, res, next) => {
    const produto = {
        id: req.body.id,
        nome: req.body.nome,
        preco: req.body.preco
    }
    mysql.getConnection((error, coon) => {
        if(error){ return res.status(500).send({error: error})}
        coon.query(
            `UPDATE produtos
                SET     nome  = ?,
                        preco = ?
                WHERE   id    = ?`,
                [produto.nome, produto.preco, produto.id],
            (error, result, field) => {
                coon.release();
                if(error){ return res.status(500).send({error: error})}
                if(result.affectedRows == 0){return res.status(404).send({
                    mensagem: 'Produto não encontrado'
                })};
                const response = {
                    mensagem: 'Produto atualizado com sucesso!',
                    produtoAtualizado: {
                        id_produto  : result.id,
                        nome        : result.nome,
                        preco       : result.preco,
                        imagem      : result.imagem,
                        request: {
                            tipo: 'PATCH',
                            descricao: 'Retorna os detalhes de um produto específico',
                            url: process.env.CAMINHO + 'produtos/' + produto.id
                        }
                    }
                }
                res.status(202).send(response);
            }
        );
    });
}

exports.deleteProduto = (req, res, next) => {
    const produto = {
        id: req.body.id,
    }
    mysql.getConnection((error, coon) => {
        if(error){ return res.status(500).send({error: error})}
        coon.query(
            'DELETE FROM produtos WHERE id = ?',[produto.id],
            (error, result, field) => {
                coon.release();
                if(error){ return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Produto removido com sucesso!',
                    request: {
                        tipo: 'POST',
                        descricao: 'Inserir produto',
                        url: process.env.CAMINHO + 'produtos/',
                        body: {
                            nome: "String",
                            preco: "Number"
                        }
                    }
                }
                res.status(202).send(response);
            }
        );
    });
}