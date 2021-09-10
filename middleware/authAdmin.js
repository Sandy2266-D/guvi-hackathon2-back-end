const users = require ("../models/userModel")
const authAdmin = async (req,res,next) =>
{
try
{
//get user info by ID
const user =await users.findOne({
    _id:req.user.id
})
if(user.role==0)
return res.status(400).json({msg:"Admin resource denied"})
next()
}
catch(err)
{
    return res.json({msg:err.message})
}
}
module.exports = authAdmin