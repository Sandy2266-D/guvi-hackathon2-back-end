const Payments=require('../models/paymentModel')
const users=require('../models/userModel')
const products=require('../models/productModels')

const paymentControl = {
getPayments:async(req,res) =>
{
    try
    {
const payments = await Payments.find()
res.json(payments)
    }catch(err)
    {
        return res.status(500).json({msg:err.msg})
    }
},

createPayment:async(req,res)=>
{
    try
    {
        const user = await users.findById(req.user.id).select('name email')
        if(!user) return res.status(400).json({msg:"user does not exist"})

        const {cart,paymentID,address} = req.body;
        const{_id,name,email}=user;
        const newPayment = new Payments({
            user_id:_id,name,email,cart,paymentID,address
        })
        cart.filter(item=>
            {
                return sold(item._id,item.quantity,item.sold)
            })

        await newPayment.save()
        res.json({msg:"Payment Success"})
    }
    catch(err)
    {
        return res.status(500).json({msg:err.msg})
    }
}
}

const sold=async(id,quantity,oldSold) =>
{
    await products.findOneAndUpdate({_id:id},{
        sold:quantity + oldSold
    })
}

module.exports=paymentControl