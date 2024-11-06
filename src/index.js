const express=require("express")
const app=express()
const path=require("path")
const hbs=require("hbs")
const collection=require("./mongodb")


const templatePath=path.join(__dirname,'../templates')
const publicPath = path.join(__dirname, '../public');



app.use(express.static(publicPath))
app.use(express.json())
app.set("view engine","hbs")
app.set("views",templatePath)
app.use(express.urlencoded({extended:false}))

// app.get("/",(req,res)=>{
//     res.render("login")
// }) 
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "HomePage.html"));  // Serves main HTML page
});

// Login page route
app.get("/login", (req, res) => {
    const signupSuccess = req.query.signup === "success";
    res.render("login", { signupSuccess });  
});

app.get("/signup",(req,res)=>{
    res.render("signup")
})
           
app.post("/signup",async (req,res)=>{
const data={
    name:req.body.name,
    password:req.body.password
};

await collection.insertMany([data])

res.redirect("/login?signup=success");


});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.name });

        if (check) {
        
            if (check.password === req.body.password) {
                res.render("home", {userName: check.name});  

            } else {                
                res.render("login", { errorMessage:"Incorrect password" });
            }
        } else {
           
            res.render("login", { errorMessage: "No such person found" });
        }

    }
    
    catch (error) {
        res.render("login", { errorMessage: "An error occurred, please try again" });
    }
});



app.listen(3002,()=>{
    console.log("Port Connected")
})