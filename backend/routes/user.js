const express=require('express');
const {User}=require('../db')
const zod = require("zod");
const {JWT_SECRET}=require('../config');
const jwt=require("jsonwebtoken")

const router =express.Router();

const signUpBody=zod.object({
    userName:zod.string().email(),
    firstName:zod.string(),
    lastName:zod.string(),
    password:zod.string()
})
router.post('/signup',async (req,res)=>{
    const body = req.body;
    const { success } = signUpBody.safeParse(body)  //: This is destructuring assignment syntax in JavaScript. It allows you to extract properties from objects and assign them to variables with the same name. In this case, it extracts the success property from the object returned by safeParse() and assigns its value to a variable named success.
    if(!success){
        return req.status(411).json({
            message:"Email already exist",
        })
    }
    const existingUser=await User.findOne({
        username:req.body.username
    })
    if(existingUser){
        return res.status(411).json({
            message:"email already taken "
        })
    }
    const user=await User.create({
        username:req.body.username,
        password:req.body.password,
        firstName:req.body.firstName
    })
    const userId = user._id;

    /// ----- Create new account ------

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

		/// -----  ------

    const token=jwt.sign({
        userId
    },JWT_SECRET);
    res.json({
        message:"user creted successfully",
        token :token,
    })
})  

const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

router.post('/signin',async(req,res)=>{
    const body=req.body;
    const {success}=signinBody.safeParse(body);
    if(!success){
        return res.status(411).json({
            message:"user not found",
        })
    }
    const user=await User.findOne({
        username:req.body.username,
        password:req.body.password
    })
    if(user){
        const token =jwt.sign({
            userId:user._id
        },JWT_SECRET)   
        res.json({
            token:token
        })
        return ;
    }
})

router.get('/bulk',async(req,res)=>{
    const filter=req.query.filter||"";
    const users=await User.find({
        $or: [{
            firstName:{
                "$regex":filter
            }
        },{
            lastName:{
                "$regex":filter
            }
        }]
    })
    res.json({
        user:users.map(user=>({
            username:user.username,
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id
        }))
    })
})

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});
