const Category = require("../models/categoryModel")
const Products = require("../models/productModels")

const categoryControl = {
    getCategories: async(req,res) =>
    {
     try
    {
     const categories=await Category.find()
     res.json(categories)
    }
    catch(err){
                return res.status(500).json({msg:err.message})
            }
        
    },

//create Category    
createCategory : async (req,res) =>
    {
        try
         {
//         //if user have role 1 ==>admin
//         //only admin can create,delete,update category
        const {name}=req.body
        const category = await Category.findOne({name})
//    res.json("check admin success")
         if(category)
         return res.status(400).json({message:"this category already exists"})
         const newCategory = new Category({name})
         await newCategory.save()
         res.json({message:"created a category"})
         }
         catch(err){
             return res.status(500).json({msg:err.message})
         }
},
 deleteCategory :async(req,res) =>
      {
        const products = await Products.findOne ({category:req.params.id})
        if(products) return res.status(400).json({msg:"Please Delete all products with a relationship."})
        try{
        await Category.findByIdAndDelete(req.params.id)
        res.json({msg:'category deleted'})
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    },
    updateCategory :async(req,res) =>
    {
     try{
         const {name} = req.body
        await Category.findOneAndUpdate({_id:req.params.id},{name})
        res.json({msg:'category updated'})
        }
        catch(err){
            return res.status(500).json({msg:err.message})
        }
    }
 }


module.exports = categoryControl