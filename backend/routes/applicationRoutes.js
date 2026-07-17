const express = require("express");
const router = express.Router();

const Application = require("../models/Application");


// GET candidate applications
router.get(
 "/candidate/:candidateId",
 async(req,res)=>{

  try{

   const applications =
     await Application.find({
       candidateId:req.params.candidateId
     })
     .populate("jobId")
     .sort({
       createdAt:-1
     });


   res.json({
    success:true,
    applications
   });


  }catch(error){

   console.log(error);

   res.status(500).json({
    success:false,
    message:error.message
   });

  }

 });


module.exports = router;