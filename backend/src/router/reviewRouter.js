import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { attachUser } from "../middleware/attachUser.js";
import {Review} from "../models/index.js";

const router = express.Router();

router.post(
  "/products/:id/reviews",
  requireAuth,
  attachUser,
  async (req, res) => {
    const { user } = req; // Sequelize user row
    const productId = Number(req.params.id);

    const review = await Review.create({
      userId: user.id,
      productId,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json(review);
  }
);

export default router;
