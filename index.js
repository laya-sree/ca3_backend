require('dotenv').config();
const express=require('express');
const cookieParser=require('cookie-parser');
const jwt=require('jsonwebtoken');
const PORT=8080;
const app=express();

app.use(express.json()) 

const users=[
    {username:"user", password:"user123", role:'user'},
    {username:"admin", password:'admin123', role:'admin'},
]


app.get('/',(req,res)=>{
    return res.status(200).send(`<h1>Welcome to backend</h1>`)
})

app.post('/login',(req,res)=>{
    try{
        const {username, password}=req.body;
        const user=users.find(u=>u.username==username, u.password==password);

        if(!user){
            return res.status(404).send({message:"User doesn't exsist"})
        }

        const token=jwt.sign({username:username, password:password}, SECRET_KEY, {expiresIn: '15m'});
        res.cookie('token', token, {httpOnly:true, secure:true});
        res.status(200).send({message:"User logged in successfully", token:token})

    }catch(er){
        return res.status(500).send({message:er.message})
    }

})


const middleWare=(roles=[])=>{
    return (req,res,next)=>{
        const token=req.headers.authorization?.split(" ")[1] || req.cookie;
        if(!token){
            return res.status(401).send({message:"Unauthorized"});
        }
        try{

            const decoded=jwt.verify(token,SECRET_KEY);
            
            if (roles.length>0 && !roles.includes(decoded.role)){
                return res.status(401).send({message:"Forbidden"});
            }

            req.user=decoded;
            next();

        }catch(er){
            return res.status(500).send({message: "Internal server error", error:er.message })
        }

    }
    
}


app.get('/profile',middleWare(), (req,res)=>{
    return res.send({message:" Welcome to your profile!"});
})

app.get('/admin-dashboard', middleWare(roles=["admin"]), (req,res)=>{
    return res.send({message:" Welcome to admin dashboard!"});
})

app.listen(PORT, ()=>{
    console.log(`app is running on http://localhost:${PORT}`);
})