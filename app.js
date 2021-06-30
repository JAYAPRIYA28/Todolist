const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name : "Buy Food"
});
const item2 = new Item ({
  name : "Cook Food"
});
const item3 = new Item ({
  name : "Eat Food"
});


const defaultItems = [item1, item2, item3];
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("successfully running");
        }
      });
      res.redirect("/")
    }
    else{
    res.render("list", {listTitle: "Today", newListItems:foundItems});
  }
  });



});

// app.post("/",function(req, res){
//
// });

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listItem = req.body.list;
  const item = new Item({
    name : newItem
  });

  if(newItem == "Today"){
    item.save();

    res.redirect("/");
  }else{
    List.findOne({name:listItem},function(err, foundList){
      if(err){
        console.log(err);
      }else{
        if(foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listItem)
        }
      }
    });
  }



});

app.post("/delete", function(req, res){

  const deletedItem = req.body.checkbox;
  const newList = req.body.newList;
  console.log(deletedItem);
 if(newList === "Today"){
   Item.findByIdAndRemove(deletedItem, function(err){
     if(err){
       console.log(err);
     }else{
       console.log("successfully deleted");
       res.redirect("/");
     }
   });
 }else{
   List.findOneAndUpdate({name: newList},{$pull:{items: {_id:deletedItem}}},function(err,foundList){
     if(err){
       console.log(err);
     }else{
       res.redirect("/"+ newList)
     }
   });
 }


});

app.get("/:name", function(req,res){
  const name = _.capitalize(req.params.name);

  List.findOne({name: name}, function(err, foundList){
    if(err){
      console.log(err);
    }else{
      if(!foundList){
        //if not equal to foundList it will create a new list
        const list = new List({
          name : name,
          items : defaultItems
        });

        list.save();
      //using this comment to save the new list to a foundList
        res.redirect("/"+ name);

      }
     else{
       // if foundList is equal to the same params list using this command to pass
       // list name to the render
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
     }
    }

  });


});
//
// app.get("/about", function(req, res){
//   res.render("about");
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
