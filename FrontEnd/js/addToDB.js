/* Send person details to backend */

function addPersonDetails(userData) {
    let postData = userData;
    $.ajax({
      url: 'http://localhost:3000/addPersonDetails',
      type: 'POST',
      data: postData,
      success: function (response) {
        console.log(response)
        if (response != true) {
          alert(response.sqlMessage)
          location.reload();
        }
        else
          console.log('Success');
      }
    });
  }

  function addTravelDetails(locationArray){
    let postData = {
      LocationArray: locationArray
    } 
    $.ajax({
      url: 'http://localhost:3000/addTravelDetails',
      type: 'POST',
      data: postData,
      success: function (response) {
        console.log(response)
        if (response != true) {
            alert(response.sqlMessage)
          location.reload();
        }
        else
          console.log('Success');
      }
    });
  }

  function importData(){


        //var selectedFile = evt.target.files[0];

       // var sfile = document.getElementById("fileUploader").value;

        var sfile = document.querySelector('input').files[0];
        console.log(sfile);
         var reader = new FileReader();
         reader.onload = function(event) {
           var data = event.target.result;
          var workbook = XLSX.read(data, {
               type: 'binary'
           });

           var travelDataArray = [];

          workbook.SheetNames.forEach(function(sheetName) {
            
              var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);


             // [{"Person_ID":10,"Infected_0/1":1,"Home_Street_address":"ABC","City/Town/Village":"BANGALore","State":"Kar"}]


             console.log(XL_row_object);
             //var json_object = JSON.stringify(XL_row_object);
            for(var i=0 ;i<XL_row_object.length ;i++)
            {

                if(sheetName==="Person data")
                {
                    // CREATE TABLE Person_Details (
                    //     PersonID int PRIMARY KEY, 
                    //     Address   varchar(255),
                    //     City      varchar(255),
                    //      State   varchar(255),
                    //     Infected tinyint(1) NOT NULL
                    // );
                    var userData = {
                        PersonID: Number,
                        //PersonName: String,
                        Address: String,
                        City: String,
                        State:String,
                        Infected: Boolean
                      }
                
                      userData.PersonID = XL_row_object[i].Person_ID;
                      userData.Address = XL_row_object[i].Home_Street_address;
                      userData.City = XL_row_object[i].City_Town_Village;
                      userData.State = XL_row_object[i].State;
                      userData.Infected = XL_row_object[i].Infected_0_1;
                
                      console.log(userData);
                       addPersonDetails(userData);
                }
                else{
        
                    var location = XL_row_object[i].Location_travelled_to_Street_Address 
                    + " "+XL_row_object[i].City_Town_Village + " " +XL_row_object[i].State; 
                      
                       //////date
                       var date_from = XL_row_object[i].Reached_at_Date_YYYYMMDD ;//
                       var date_to = XL_row_object[i].Left_at_Date_YYYYMMDD;// 
  
                       var datefrom = new Date(date_from);
                       var dateto = new Date(date_to);
  
                       // Javascript format to SQL format
                       dateto = dateto.toISOString().slice(0,10);
                       datefrom = datefrom.toISOString().slice(0,10);
                       //////
  
                       var fromDate = datefrom +" "+  XL_row_object[i].Reached_at_Time_hhmm ;
                       var toDate = dateto + " "+XL_row_object[i].Left_at_Time_hhmm ;


                    var travelData = {};
                    travelData.PersonID = XL_row_object[i].Person_ID;
                    travelData.FromTime =fromDate;
                    travelData.ToTime = toDate;
                    travelData.Mode_of_Transportation = XL_row_object[i].Mode_of_Transportation;
                    travelData.Latitude = 1;
                    travelData.Longitude = 1;
                    travelData.Location = location;

                    travelDataArray.push(travelData);


                }

            }
              

            })


            console.log(travelDataArray);
            console.log(travelDataArray.length);

            var locationArray=[];
      for (var i = 0; i < travelDataArray.length; i++) {

        var location = travelDataArray[i].Location;
        var nolocations = travelDataArray.length;
        //var PersonID = +document.getElementById("id").value;
        $.ajax({
          url: 'https://maps.googleapis.com/maps/api/geocode/json?&key=AIzaSyC6XaqrE4rLEskBpcUihpdDw3kRaW70pj8&address=' + location+' Karnataka',
          type: 'GET',
          indexValue: i,
          noOflocations : nolocations,
          success: function (response) {
            console.log(response)
            if (response.status !== 'OK') {
              alert("Invalid location details")
            }
            else {
              var locationData = {};
              console.log(this.indexValue);
              locationData.PersonID = travelDataArray[this.indexValue].PersonID;
              locationData.Latitude = response.results[0].geometry.location.lat;
              locationData.Longitude = response.results[0].geometry.location.lng;
              //locationData.Address = response.results[0].formatted_address;
              locationData.Location = travelDataArray[this.indexValue].Location;
              locationData.FromTime = travelDataArray[this.indexValue].FromTime;
              locationData.ToTime = travelDataArray[this.indexValue].ToTime;
              locationData.Mode_of_Transportation = travelDataArray[this.indexValue].Mode_of_Transportation
              locationArray.push(locationData);
              
              if(locationArray.length==this.noOflocations){
                console.log(locationArray);  
                addTravelDetails(locationArray);
              }
            }
          }
        })    
      }


        };

        reader.onerror = function(event) {
          console.error("File could not be read! Code " + event.target.error.code);
        };

        reader.readAsBinaryString(sfile);
 
  }