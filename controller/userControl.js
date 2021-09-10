const users = require('../models/userModel')
const Payments = require('../models/paymentModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userControl={
    register:async (req,res) =>
    {
        try
        {
            const {name,email,password} = req.body
            const user = await users.findOne({email})
            if(user) 
            {
                return res.status(400).json({msg:"This email already exits"})
            }
            if(password.length<6)
            {
                return  res.status(400).json({msg:"Password should be atleat 6 characters"})
            } 
//password encryption
 const passwordHash = await bcrypt.hash(password,10)
 const newUser =new users(
 {
name,email,password:passwordHash
 })

 
 //Save into MONGODB
 await newUser.save()
 //res.json("register successful")

// then create jsonwebtokens to authentication
const accesstoken = createAccessToken({id:newUser._id})
const refreshtoken = createRefreshToken({id:newUser._id})

res.cookie('refreshtoken',refreshtoken,{
 httpOnly:true,
 path:"/user/refresh_token",
 maxAge:7*24*60*60*1000 //7Day
})

//res.json({msg:"Register successful"})
res.json({accesstoken})

}
catch(err)
        {
        return res.status(500).json({msg:err.message})
        }
},

//Refresh token
refreshToken:(req,res) =>
{
    try
    {
    const rf_token = req.cookies.refreshtoken;
    if(!rf_token) return res.status(400).json({msg:"Please Login or Register"})
        
    jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>
        {
            if(err) return res.status(400).json({msg:"Please Login or Register"}) 
            
            const accesstoken = createAccessToken({id:user.id})
            
            res.json({accesstoken})
        })
        //res.json({rf_token})
    }catch(err)
    {
        return res.status(500).json({msg:err.message})
    }
},

//Login Route
login: async(req,res)=>
    {
        try
        {
         const {email,password} = req.body
        //email            
        const user =await users.findOne({email})
        
        if(!user) return res.status(400).json({message:"User does not exists"})

        //password
        const isMatch=await bcrypt.compare(password,user.password)
        
        if(!isMatch) return res.status(400).json({message:"Incorrect Password"})
  
        // //if Login successful
        //res.json({message:"Login successful"})

         //If login successful create access token and refresh token
        const accesstoken = createAccessToken({id:user.id})
        const refreshtoken = createRefreshToken({id:user.id})

        res.cookie('refreshtoken',refreshtoken,{
         httpOnly:true,
         path:"/user/refresh_token",
         maxAge:7*24*60*60*1000 //7Day
        })
        res.json({accesstoken})
    }
catch(err)
        {
            return res.status(500).json({msg:err.message})            
        }
},

//Logout
logout:async (req,res)=>
{
try{
res.clearCookie('refreshtoken',{path:'/user/refresh_token'})
return res.json({message:"Logged Out"})
}
catch(err)
    {
        return res.status(500).json({msg:err.message})
    }
},

//getuser for authentication

getUser :async (req,res) =>
{
    try
    {
        const user=await users.findById(req.user.id).select('-password')
        if(!user) return res.json({message:"user does not exist"})
      res.json(user)
    }
    catch(err){
        return res.status(500).json({msg:err.message})
    }
},

addCart:async(req,res) =>
{
    try
    {
        const user = await users.findById(req.user.id)
        if(!user) return res.status(400).json({msg:"User does not exist"})

        await users.findOneAndUpdate({_id: req.user.id},
            {cart:req.body.cart})
        return res.json({msg:"Added to Cart"})
    }catch(err){
        return res.status(500).json({msg:err.message})
    }
},

history:async(req,res) =>
{
    try
    {
        const history = await Payments.find({user_id:req.user.id})
        res.json(history)
    }catch(err)
    {
        res.status(500).json({msg:err.msg})
    }
}
}


const createAccessToken = (user) =>
{
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'11m'})
}

const createRefreshToken = (user) =>
{
    return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}


module.exports = userControl