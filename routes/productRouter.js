const router = require('express').Router()
const productControl =require('../controller/productControl')
//Read and write
router.route('/products')
.get(productControl.getProducts)
.post(productControl.createProduct)

//delete and update
router.route('/products/:id')
.delete(productControl.deleteProduct)
.put(productControl.updateProduct)





module.exports = router