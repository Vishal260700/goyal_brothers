// Dependencies
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const async = require('async');
const assert = require('assert');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ----------------- App Settings ----------------

var app = express();
app.set('port', (process.env.PORT || 3000));
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(app.get('port'), function(){
  console.log('Server started on port '+app.get('port'));
});

// ----------------- FireStore DB Setup ---------------------

var firebase = require("firebase/app");

require("firebase/auth");
require("firebase/firestore");
require("firebase/database");
 
const firebaseConfig = {
  	apiKey: "AIzaSyCz_bo_f2NmedEvNXuuhi5Pn2q-94tD0Wo",
	authDomain: "gobros-2c9b5.firebaseapp.com",
	databaseURL: "https://gobros-2c9b5.firebaseio.com",
	projectId: "gobros-2c9b5",
	storageBucket: "gobros-2c9b5.appspot.com",
	messagingSenderId: "780966309654",
	appId: "1:780966309654:web:05a61e405e879d202faa37",
	measurementId: "G-7CL0J6LP08"
};
 
firebase.initializeApp(firebaseConfig);
 
var database = firebase.database();
var firestore = firebase.firestore();
var auth = firebase.auth();

// --------- helper functions -----------

function encrypt(data, pass) {
  var cipher = crypto.createCipher('aes-256-ecb', pass);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

// ---------------- node-angular setup ------------------

app.use(cors());

// -------------- Contact Us Mailing System -------------------

app.post("/contactUs", function(req,res){
  
  const output = `
  <style>
  table, td, th {  
    border: 1px solid #ddd;
    text-align: left;
  }
 
  table {
    border-collapse: collapse;
    width: 100%;
  }
 
  th, td {
    padding: 15px;
  }
  </style>
  <p>We have recieved your message at ${new Date(Date.now()).toLocaleString()}</p>
  <table border="2px">  
    <tr><th>Message</th><td> ${req.body.msg}</td></tr>
  </table>
  <p>*This is an automatically generated mail. Please do not reply.*</p>
 `;
	let transporter = nodemailer.createTransport({
	  host: 'smtp.gmail.com',
	  port: 587,
	  secure: false,
	  auth: {
	      user: 'goyalbrothersprayagraj@gmail.com',
	      pass: "ifbpsffksqanvslf"
	  },
	  tls:{
	    rejectUnauthorized:false
	  }
	});
	 
	 
	let mailOptions = {
	    from: '"GoBros" <goyalbrothersprayagraj@gmail.com>',
	    to: req.body.email,//  list of receivers
	    subject: 'Message Sucessfully recieved',
	    html: output
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	    	console.log(error);
	    } else {
	    	console.log("Successfully sent mail");
	    }
	    });

	let item = {
		requestMail : req.body.email,
		message : req.body.msg,
		time : req.body.time,
		read : false
	}

	var d = new Date();
	var ms = d.getTime();
	var secretKey = ms.toString()

	uid = encrypt(req.body.email, secretKey);

	let ref = firestore.collection('contactGoBros').doc(uid);

	let getDoc = ref.get()
		.then(doc => {
		    if (!doc.exists) {
		      // subscriber is unique
		      ref.set(item).then(function(){
		      	console.log("Sucessfully Contacted");
		      })
		      .catch(function(error){
		        console.log("Something Went Wrong");
		      });
			}else{
		  		console.log("Already Contacted");
		  	}
		})

});

// ------------- NEWSLETTER SUBBING ---------------

app.post('/newsLetter', (req, res, next) => {
	
	// Query to check for
	let item = {
		mail : req.body.email
	}

	uid = encrypt(req.body.email, "newsLetter");

	let ref = firestore.collection('newsLetter').doc(uid);

	let getDoc = ref.get()
  	.then(doc => {
	    if (!doc.exists) {
	      // subscriber is unique
	      ref.set(item).then(function(){
	      	console.log("Sucessfully Subbed");
	      })
	      .catch(function(error){
	        console.log("Something Went Wrong");
	      });
		}else{
	  		console.log("Already Subbed");
	  	}
 	})

});

// ---------- Home Page Product Overview Data Retrieval ------------

app.post('/getProds', (req,res,next) => {

	let query = {
		"prodType" : req.body.prodType
	}

	console.log(query);

	

})

// ---------- DASHBOARD -----------------

// Upload Product (One at a time)
app.post('/addProduct', (req, res, next) => {
	
	let item = {
      prodName : req.body.prodName,
      prodPrice : req.body.prodPrice,
      prodType : req.body.prodType,
      prodTags : req.body.prodTags,
      prodSizes : req.body.prodSizes,
      prodColors : req.body.prodColors
    }

	uid = encrypt(req.body.prodName, req.body.prodType);

	let ref = firestore.collection('GoBrosProds').doc(uid);

	let getDoc = ref.get()
  	.then(doc => {
	    if (!doc.exists) {
	      // new product
	      ref.set(item).then(function(){
	      	console.log("New Product Added Sucessfully");
	      })
	      .catch(function(error){
	        console.log("Something Went Wrong");
	      });
		}else{
	  		console.log("Similiar Product already available");
	  	}
 	})

})


// ------------- NEWLETTER BULK MAIL ---------------------
app.post('/newsSpread', (req,res,next) => {

	// Mail settings
	const output = `
	<p>This is to inform our users and newsLetter subscribers that GoBros is live now. We have a message from our author.</p>
  	<p>${req.body.msg}</p>`;

	let transporter = nodemailer.createTransport({
	  host: 'smtp.gmail.com',
	  port: 587,
	  secure: false,
	  auth: {
	      user: 'goyalbrothersprayagraj@gmail.com',
	      pass: "ifbpsffksqanvslf"
	  },
	  tls:{
	    rejectUnauthorized:false
	  }
	});

	let subs = []
	let newsSubscribers = []
    let ref = firestore.collection('newsLetter');
	let query = ref.get()
	  .then(snapshot => {
	    if (snapshot.empty) {
	      res.json(null);
	      console.log('No Subs.');
	      return;
	    }else{
	      snapshot.forEach(doc => {
	      	let tempObj = doc.data()
	      	subs.push(tempObj['mail']);
		  });
	    }
	    subs.forEach(mail => {
	    	if(mail != undefined){
	    		newsSubscribers.push(mail);
	    	}
	    })
	    let mailOptions = {
		    from: '"GoBros" <goyalbrothersprayagraj@gmail.com>',
		    to: newsSubscribers,//  list of receivers
		    subject: 'Message Sucessfully recieved',
		    html: output
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
		    if (error) {
		    	console.log(error);
		    	res.json(null);
		    } else {
		    	console.log("Successfully sent mail");
		    	res.json("Success");
		    }
	    });

	  })
	  .catch(err => {
	  	res.json(null);
	    console.log('Error sending Mails', err);
	  });
});

// ----------------- Contact Queries Reqs -------------
app.post('/contactQueries', (req, res, next) => {

	let data = []

	let ref = firestore.collection('contactGoBros');

	ref.get()
  	.then(docs => {
	    docs.forEach(doc => {
	    	data.push([doc.data(), doc.id]);
	    })
	    res.json(data);
 	})
 	.catch(err => {
    	console.log("Error getting docs");
    	res.json(null);
	});   

})

app.post('/delQuery', (req,res,next) => {
	let queryId = req.body.ID;
	firestore.collection('contactGoBros').doc(queryId).delete().then(doc => {
		console.log("Successfully Deleted");
		res.json("Success");
	}).catch(err => {
		res.json(null);
	})

})

app.post('/updateQuery', (req,res,next) => {
	let queryId = req.body.ID;
	firestore.collection('contactGoBros').doc(queryId).update({read : true}).then(doc => {
		console.log("Successfully Updated");
		res.json("Success");
	}).catch(err => {
		res.json(null);
	})
})


app.post('/updateQueryOppossite', (req,res,next) => {
	let queryId = req.body.ID;
	firestore.collection('contactGoBros').doc(queryId).update({read : false}).then(doc => {
		console.log("Successfully Updated");
		res.json("Success");
	}).catch(err => {
		res.json(null);
	})
})







