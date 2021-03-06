module.exports = function () {


    var mongoose = require("mongoose");
    var UserSchema = require("./user.schema.server")();
    var User = (mongoose.models.User)? mongoose.model("User")  :mongoose.model("User", UserSchema);

    var api = {
        createUser : createUser,
        findUserById: findUserById,
        findUserByUsername: findUserByUsername,
        deleteUser: deleteUser,
        updateUser: updateUser,
        findUserByCredentials:findUserByCredentials,
        getUsers: getUsers,
        findUserEnc:findUserEnc,
        findUserByFacebookId: findUserByFacebookId,
        findUserByGoogleId: findUserByGoogleId,
        updateGoogle: updateGoogle,
        updateFacebook: updateFacebook,
        updateFlickr:updateFlickr,
        saveFlickr:saveFlickr,
        findUserByFlickrId:findUserByFlickrId,
        createFlickr: createFlickr,
        findById: findById,
        findFacebookUser:findFacebookUser,
        register:register,
        unflickr:unflickr,
        findByUsername:findByUsername,
        saveUser:saveUser,
        follow:follow


    }
    return api;

    function follow(followMe){
        console.log("db: " + followMe);
        var follower = followMe.id; // who is doing the following
        var followee = followMe.follower; // who is being followed
        // you can not follow yourself
        if(follower === followee){
            return null;
        }
        //let the user know he is being followed ;)
        User.findByIdAndUpdate(followee,{$push:{"followedBy":mongoose.Types.ObjectId(follower)}});
        // follow the user
        return User.findByIdAndUpdate(follower,{$push:{"follows":mongoose.Types.ObjectId(followee)}});
    }



    function findByUsername(username){
        return User.findOne({"local.username": username});
    }

    function unflickr(id) {
        var user = User.findOne({"f_id": id});
        user.flickr = null;
        return User.update({"_id" : user._id}, user);
    }



    function register(user){
        var newUser = new User(user);

        console.log(newUser);
        return newUser.save();
    }


    function findFacebookUser(id) {
        return User.findOne({"facebook.id": id});
    }


    function findUserById(userId) {
        //return User.findById(userId);
        return User.findById(userId);
    }


    function allUsers(){
            return User.find({});
    }

    function findById(user){
        return User.findOne({"user.id":user.id});
    }


    function updateFlickr(user){
        return User.update({"_id" : user._id}, user, {upsert: true});
    }



    function updateGoogle(user){
      // return User.save({_id:user._id, googgle: user.googgle, local: user.local });
        return User.update({"_id" : user._id}, user, {upsert: true});
       // return User.update({"local.username" : user.local.username}, user, {upsert: true});
    }


    function createFlickr(user){
        console.log("create " + user);
        // return User.update()
        return User.create(user);
    }




    //create a new User object, pass flickrUser into it and save
    function saveUser(newUser){
        var localUser = new User(newUser);

        console.log("database: " + localUser);
        //return
        // return
        localUser.save();
        return User.findOne({"local.username": flickrUser.local.username});
        // return User.findOne({"local.username":flick.local.username});
    }



    //create a new User object, pass flickrUser into it and save
    function saveFlickr(flickrUser){
        var flickr = new User(flickrUser);

        console.log("database: " + flickr);
        console.log(flickrUser.local.username);

        //return
       // return
        return flickr.save();
        //return  User.findOne({"local.username":flickr.local.username});

       // console.log("found: " + user.local.username);
        //return user;
       // return User.findOne({"local.username":flick.local.username});
    }


    function updateFacebook(user){
        console.log("update " + user);
        //return User.update({"local.username" : user.username}, user, {upsert: true});
        // return User.update()
       return User.update({"_id" : user._id}, user, {upsert: true});
    }

    function findUserByFlickrId(flickrID){
        return User.findOne({"flickr.id" : flickrID});
    }


    function findUserByFacebookId(facebookID){
       return User.findOne({"facebook.id" : facebookID});
    }


    function findUserByGoogleId(googleID){
        return User.findOne({"google.id" : googleID});
    }


    function getUsers(){
      //  var usersProjection = {
        //    __v: false,
         //   flickr: false,

        //};

        return User.find({});
       // console.log("db users");
        //return {"screw" :"sscrew you"};
       // var users =
       // return User.find({"local.username":"john"});
      //  return users.select('-local.password');
    }


    function findUserEnc(username, password){
        var user = User.findOne({"local.username" : username});
        if(comparePassword(password, user.password)){
            return user;
        }else{
            return null;
        }
    }


    function comparePassword(password, userPassword, callback) {
        bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
            if (err)
                return callback(err);
            return callback(null, isPasswordMatch);
        });
    }



    function findUserByCredentials(username, password){
        //console.log(username, password);
       // var user = User.findOne({"username": username});
        //if()


        return User.findOne({"username": username, "password": password});
       // return User.find();
    }

    function  createUser(user) {
       // console.log("at model " + user);
        //user.createUser
       return User.create(user);
       // return User.update({"user._id" : user.id}, user, {upsert: true});
    }


    function findUserByUsername(username){
        //console.log(username);
       return User.findOne({"local.username": username});
        //return User.find({$text:{$search:"local:{username:"+ username+"}"}});
    }

    function updateUser(userId, user){
        return User
            .update({_id:userId},{
                $set: user
            })
    }

    function deleteUser(userId){
        return User.remove({_id:userId});
    }
}