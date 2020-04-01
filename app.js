const express  = require("express")
const mysql  = require("mysql")
const bodyParser = require("body-parser")

const app = express();

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
  });


/* configure the database */

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root"
  });
  
con.connect(function (err) {
    if (err) console.log(err);
    console.log("connected");
});
  
sql = "use CDB";
con.query(sql, function (err, res) {
    if (err) console.log(err);
    console.log(res);
});

app.post("/onSubmit",(req,res)=>{
    console.log("Request recieved");
    console.log(req.body);
    res.send("Success");
})

app.post('/addPersonDetails',(req,res)=>{
    console.log(req.body);
    sql = "Insert Into Person_Details values(?,?,?,?,?)"
    con.query(sql,[req.body.PersonID,req.body.Address,req.body.City,req.body.State,req.body.Infected],(err,response)=>{
        if(err) {
            console.log(err)
            res.send(false);
        }    

        res.send(true);
    })
})

app.post("/addTravelDetails",(req,res)=>{
    console.log(req.body);
    
    locationArray = req.body.LocationArray;
    for(var i=0;i<locationArray.length;i++){
        var location = locationArray[i];
        //console.log(location.ModeOfTransport);
        sql = "Insert Into Travel_Details values(?,?,?,?,?,?,?)"
        con.query(sql,[location.PersonID,location.Location,location.Latitude,location.Longitude,location.FromTime,location.ToTime,location.ModeOfTransport],(err,response)=>{
            if(err){
                console.log(err)
                res.send(false);    
            }    
        })
    }
    res.send(true);    
})

app.get("/getTravelData",(req,res)=>{
    sql = "select * from Person_Details Natural JOIN Travel_Details"
    con.query(sql,(err,response)=>{
        if(err) {
            console.log(err)
        }
        console.log(response);    
        res.send(response);
    })    
})


app.listen(3000,()=>{
    console.log("Server started on port 3000");
})


/* Functions */



