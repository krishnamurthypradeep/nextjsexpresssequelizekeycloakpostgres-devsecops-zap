import express from 'express'

import { Product, Review } from '../models/index.js'
import { authenticate,requireRealmRole } from '../middleware/auth.js'

const router = express.Router()


router.use(authenticate())

router.get('/',requireRealmRole('guest'),async (req,res,next)=>{
    try {
        // select * from products
         const includeReviews = String(req.query.include || '').toLowerCase() === 'reviews';
         const products = await Product.findAll({
            include:includeReviews?[{model: Review,as:'reviews'}]:[]
         })
         res.status(200).json(products)
    } catch (error) {
        next(error)
    }
  
})
router.post('/',requireRealmRole('admin'),async (req,res,next)=>{
    try {
        // insert into products values (?,?,?,?,?)
         const products = await Product.create(req.body)
         res.status(201).json(products)
    } catch (error) {
        next(error)
    }
  
})

router.post('/:id/reviews',async (req,res,next)=>{
    try {
        // insert into products values (?,?,?,?,?)
        const product = await Product.findByPk(req.params.id)
         if(!product){
            return res.status(404).json({err:'product not found'})
         }

        const {title,body,stars} = req.body
         const review = await Review.create({
            title,body,stars,product_id:product.id
         })
         res.status(201).json(review)
    } catch (error) {
        next(error)
    }
  
})

router.get('/:id',async (req,res,next)=>{
    try {
        // select * from products where id=?
       const {id} = await req.params
        const product = await Product.findByPk(id, { include: [{ model: Review, as: 'reviews' }] });
if (!product) return res.status(404).json({ error: 'product not found' });
return res.json(product);
    } catch (error) {
        next(error)
    }
  
})


export default router


