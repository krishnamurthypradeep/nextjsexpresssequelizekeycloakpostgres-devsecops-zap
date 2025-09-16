import express from 'express'
import { sequelize, Product } from './models/index.js';
import ProductRouter from './router/productRouter.js'
import { Sequelize } from 'sequelize';
import cors from 'cors';
import { authenticate } from "./middleware/auth.js";
import { attachUser } from "./middleware/attachUser.js";
const app = express()
app.use(cors({
  origin: ["http://localhost:3000"], // your Next.js frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


// middleware
app.use(express.json())

app.use('/api/products',ProductRouter)
app.use("/api/reviews", authenticate, attachUser);

// error handling middleware
app.use((err,req,res,next)=>{
    if( err instanceof Sequelize.ValidationError){
        return res.status(400).json({
      error: {
        message: "Validation error",
        details: err.errors.map(e => e.message)
      }
    })
    }
     if(err instanceof Sequelize.UniqueConstraintError){
    return res.status(400).json({
      error: {
        message: "A record with this unique value already exists.",
        details: err.errors.map(e => e.message)
      }
    })
  }
if (err.status === 404) {
    return res.status(404).json({
      error: {
        message: "Resource not found",
        details: err.message || null,
      },
    });
  }
  if (err.status === 500) {
    return res.status(500).json({
      error: {
        message: err.message || 'Internal Server Error',
        details: err.message || null,
      },
    });
  }


})


app.get('/',(req,res)=>{
    res.json({id:1,name:'Iphone16',price:7885.5})
})



 sequelize.sync({alter:true}).then(()=>{
     app.listen(4000,()=>console.log('server started'))
 }).catch(error => console.error("Unable to start the server:", error))
         // verify DB creds
//  await sequelize.sync({alter: true});                // only if you’re NOT using migrations

// const p = await Product.create({ name: 'Iphone16', code: 'Iphone16-2', 
//     price: 999.99,description:'iphone16 Pro',rating: 4.8,available: true });
// console.log('created:', p.id);

