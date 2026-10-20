require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const app = express();
const production = process.env.NODE_ENV === 'production';
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('Set SESSION_SECRET to at least 32 characters in .env');
if (production) app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy: {directives: {defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'"],connectSrc:["'self'"]}}}));
app.use(express.json({limit:'10kb'}));
app.use(session({name:'rbac.sid',secret:process.env.SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'strict',secure:production,maxAge:30*60*1000}}));
const dataFile = path.join(__dirname,'users.json');
const users = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile,'utf8')) : [];
function persist(){fs.writeFileSync(dataFile,JSON.stringify(users,null,2),{mode:0o600});}
function safe(u){return {id:u.id,username:u.username,role:u.role};}
function authenticated(req,res,next){const u=users.find(u=>u.id===req.session.userId);if(!u)return res.status(401).json({error:'Authentication required'});req.user=u;next();}
function adminOnly(req,res,next){if(req.user.role!=='Admin')return res.status(403).json({error:'Forbidden'});next();}
function csrf(req,res,next){if(['POST','PUT','PATCH','DELETE'].includes(req.method)){const origin=req.get('origin');if(origin && origin!==`${req.protocol}://${req.get('host')}`)return res.status(403).json({error:'Origin rejected'});}next();}
app.use('/api',csrf);
const loginLimiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-7',legacyHeaders:false});
app.get('/api/public',(req,res)=>res.json({message:'Public endpoint available to everyone'}));
app.post('/api/register',loginLimiter,async(req,res)=>{const {username,password}=req.body||{};if(typeof username!=='string'||!/^[a-zA-Z0-9_]{3,30}$/.test(username)||typeof password!=='string'||password.length<12||password.length>128)return res.status(400).json({error:'Username must be 3-30 letters, digits or underscores; password must be 12-128 characters'});if(users.some(u=>u.username.toLowerCase()===username.toLowerCase()))return res.status(409).json({error:'Username unavailable'});const u={id:crypto.randomUUID(),username,role:'User',passwordHash:await bcrypt.hash(password,12)};users.push(u);persist();res.status(201).json({user:safe(u)});});
app.post('/api/login',loginLimiter,async(req,res,next)=>{const {username,password}=req.body||{};if(typeof username!=='string'||!username.trim()||typeof password!=='string'||!password)return res.status(400).json({error:'Username and password required'});const u=users.find(u=>u.username.toLowerCase()===username.toLowerCase());const valid=await bcrypt.compare(password,u?.passwordHash||'$2a$12$abcdefghijklmnopqrstuuZp7a3SHhZXz3o4u5u2tnXvV3ERh9w56');if(!u||!valid)return res.status(401).json({error:'Invalid username or password'});req.session.regenerate(err=>{if(err)return next(err);req.session.userId=u.id;res.json({user:safe(u)});});});
app.post('/api/logout',(req,res,next)=>req.session.destroy(err=>{if(err)return next(err);res.clearCookie('rbac.sid');res.json({message:'Logged out'});}));
app.get('/api/user',authenticated,(req,res)=>res.json({message:'User dashboard',user:safe(req.user)}));
app.get('/api/admin',authenticated,adminOnly,(req,res)=>res.json({message:'Admin dashboard',users:users.map(safe)}));
app.use(express.static(path.join(__dirname,'public')));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'});});
if(require.main===module)app.listen(process.env.PORT||3000,()=>console.log(`Running at http://localhost:${process.env.PORT||3000}`));
module.exports=app;
