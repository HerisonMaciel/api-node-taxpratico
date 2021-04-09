const express = require('express');
const router = express.Router();
const multer = require('multer');
const login = require('../middleware/login');

const produtoController = require('../controllers/produtos-controller');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        //cb(null, new Date().toISOString() + file.originalname);
        let data = new Date().toISOString().replace(/:/g, '-') + '-';
        cb(null, data + file.originalname );
    } 
})

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // limite máximo da imagem 5mb
    }
});


//Pega todos os produtos via GET
router.get('/', produtoController.getProdutos);

//Pega um produto por id via GET
router.get('/:id_produto', produtoController.getProduto);

//Insere um produto via POST
router.post('/', login, upload.single('imagem'), produtoController.postProduto);

//Edita um produto via PATCH
router.patch('/', login, produtoController.patchProduto);

//Deleta um produto via DELETE
router.delete('/', login, produtoController.deleteProduto);

module.exports = router;