const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Define a sample schema
const ItemSchema = new mongoose.Schema({
    name: String,
});

const Item = mongoose.model("Item", ItemSchema);

// Get all items
router.get("/", async (req, res) => {
    const items = await Item.find();
    res.render("crud", { items });
});

// Add new item
router.post("/add", async (req, res) => {
    const { name } = req.body;
    if (name) {
        await Item.create({ name });
    }
    res.redirect("/crud");
});

// Delete an item
router.post("/delete/:id", async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.redirect("/crud");
});

module.exports = router;
