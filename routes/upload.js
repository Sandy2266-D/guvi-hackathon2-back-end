const router = require('express').Router()
const cloudinary =require ('cloudinary')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const fs=require('fs')

//upload image on cloudinary
cloudinary.config(
    {
        cloud_name :process.env.CLOUD_NAME,
        api_key:process.env.CLOUD_API_KEY,
        api_secret:process.env.CLOUD_API_SECRET
    }
)

//Upload Image only used by Admin
router.post ('/upload',auth,authAdmin,(req,res)=>
{
    try
    {
console.log(req.files)

if(!req.files || Object.keys(req.files).length ===0)
return res.status(400).send('No files were uploaded')

const file = req.files.file;
if(file.size >1024*1024)
{
removeTmp(file.tempFilePath)
 return res.status(400).json({Message:"Size is too large"})
}

if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png')
{
    removeTmp(file.tempFilePath)
return res.json({Message:"file format are incorrect"})
}

cloudinary.v2.uploader.upload(file.tempFilePath,{folder:"test"},async(err,result)=>
{
     if(err) throw errr;
     removeTmp(file.tempFilePath)
//res.json({result})

 res.json({public_id:result.public_id,url:result.secure_url}) 
})  
//res.json("uploaded image")
}catch(err)
    {
        return  res.json({msg:err.message})

    }
})


//Delete 
router.post('/destroy',auth,authAdmin,(req,res)=>
{
try
{
const {public_id} = req.body;
if(!public_id) return res.json({msg:"No image is selected"})
cloudinary.v2.uploader.destroy(public_id,async(err,result)=>
{
if(err) throw err;
res.json({message:"delete image"})
})
}
catch(err)
{
    return res.json({msg:err.message})
}
})


const removeTmp =(path)=>
{
    fs.unlink(path,err =>
        {
            if(err) throw err;
        })
}

module.exports = router