router.get(
"/recommended/:candidateId",
async(req,res)=>{

try{

const jobs = await Job.find({})
.limit(10)
.sort({
 createdAt:-1
});


return res.json({
 success:true,
 jobs
});


}
catch(error){

console.log(
"Recommended jobs error:",
error
);


return res.status(500).json({

success:false,

message:error.message

});


}


});