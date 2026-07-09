const express = require("express")
const router = express.Router()

//  Fő oldal
router.get("/", (req, res) => {
    res.write("Test")
    res.send()
})

module.exports = router