const Products  = require("../models/productModels")

//Filter,sorting and paginating
class APIfeatures
{
    constructor(query,queryString)
    {
        this.query = query;
        this.queryString=queryString;
    }
    filtering()
    {
        const queryObj = {...this.queryString} //queryString = req.query
        //console.log({before:queryObj})
        const excludedFields =['page','sort','limit']
        excludedFields.forEach(el=> delete(queryObj[el]))

        //console.log({after:queryObj})

        let queryStr=JSON.stringify(queryObj)
        queryStr=queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match=>
        '$' + match)
         //console.log({queryObj,queryStr})
// //gte = greater than or equal
// //lte = lesser than or equal
// //lt = lesser than
// //gt = greater than
        this.query.find(JSON.parse(queryStr))
        return this;
    }
sorting()
{
        if(this.queryString.sort)
        {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query=this.query.sort(sortBy)
        }
        else
        {
            this.query=this.query.sort('-createdAt')
        }
        return this;
    }
    paginating()
    {
        const page=this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}


const productControl = {
getProducts: async (req,res) =>
{
    try
    {
        //console.log(req.query)
        const features =new APIfeatures (Products.find(),req.query) 
        .filtering().sorting().paginating()
        const products = await features.query

        res.json({
            status : "success",
            result : products.length,
            products:products
        })

        //const products= await Products.find()
        //res.json(products)
    }catch(err)
    {
        return  res.status(500).json({msg:err.message})
    }
},

//Product create
createProduct: async (req,res) =>
{
    try
    {
        const {product_id,title,price,description,content,images,category} = req.body
        if(!images) return res.json({message:"No images uploaded"})
        const product = await Products.findOne({product_id})
        if(product)
        return res.json("this product is already exists")
        const newProduct = new Products(
            {product_id,title:title.toLowerCase(),price,description,content,images,category}
        )
        await newProduct.save()
        res.json({msg:"Products are created"})
     }
catch(err)
    {
        return  res.status(500).json({msg:err.message})
    }
},

//Delete Product
deleteProduct: async (req,res) =>
{
    try
    {
await Products.findByIdAndDelete(req.params.id)
res.json({Message:"Product deleted"})
    }catch(err)
    {
        return  res.status(500).json({Message:err.message})
    }
},

//Update Product
updateProduct: async (req,res) =>
{
    try
    {
        const {title,price,description,content,images,category} = req.body
        if(!images) return res.json({message:"No images uploaded"})
        await Products.findOneAndUpdate({_id:req.params.id},{title:title.toLowerCase(),price,description,content,images,category})
        res.json({Message:"Products are updated"})
    }catch(err)
    {
        return  res.status(500).json({Message:err.message})
    }
}
}

module.exports = productControl