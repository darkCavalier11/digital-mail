var express = require("express");
var app = express();
var mongoose = require("mongoose");

var NodeRSA = require("node-rsa");

// DEFINE MODEL
var Mail = require("./mail");

var math = require("mathjs");

// CONNECT TO MONGODB SERVER
var db = mongoose.connection;

const url =
    "mongodb+srv://mongodb:eZkcX4tgeynri9VB@cluster0.zbg9d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

db.on("error", console.error);
db.once("open", function () {
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongodb atlas");
});

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.set("port", process.env.PORT || 5001);

app.use(express.static(__dirname + "/public"));

// views is directory for all template files
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", function (request, response) {
    response.render("pages/inbox");
});

app.get("/compose", function (request, response) {
    response.render("pages/compose");
});

app.get("/view/:id", function (request, response) {
    Mail.findOne({ _id: request.params.id }, function (err, email) {
        if (err) return res.status(500).send({ error: "database failure" });
        console.log(email.subject);
        response.render("pages/view", {
            subject: email.subject,
            text: email.text,
        });
        //response.json(mails);
    });
});

app.get("/getAll", function (request, response) {
    Mail.find(function (err, mails) {
        if (err) return res.status(500).send({ error: "database failure" });
        response.json(mails);
    });
});

var public_key;
/**
 *
 * Step 1 – Alice send the N, e, x1, x2
 */
var msg = "HELLO WORLD";
var m0 = a2hex(msg.split(" ")[0]);
var m1 = a2hex(msg.split(" ")[1]);

// length of key in bits
var key = new NodeRSA({ b: 8 });

var bit = 2048;
var exp = 65537;

key.generateKeyPair(bit, exp);
console.log(key.exportKey("components"));
// N: key.exportKey('components').n
// e: key.exportKey('components').e
var private_D = key.exportKey("components").d;
// BOB

/**
 * Step 2: Bob select b and either x0 or x1,
 * generate v and send v to the Alice
 */

var public_N = key.exportKey("components").n;
var public_E = key.exportKey("components").e;

var x0 = makeid();
var x1 = makeid();

var xb;

var b = Math.floor(Math.random() * 10);
if (b === 0) {
    xb = x0;
    console.log("selected 0");
} else {
    xb = x1;
    console.log("selected 1");
}

var k = 1; //Math.floor(Math.random() * 20)/100;
console.log(xb);
console.log(parseInt(xb, 16));
var v =
    parseInt(xb, 16) + math.mod(Math.pow(k, public_E), public_N.readInt32BE());
console.log(v);

/**
 * Step 3: Alice generate k0 and k1,
 * send them to the Bob, and get the
 * original split message
 */

var k0 = Math.pow(v - parseInt(x0, 16), private_D.readInt32BE());
var k1 = Math.pow(v - parseInt(x1, 16), private_D.readInt32BE());

console.log(k0);
console.log(k1);

var m0_ = parseInt(m0, 16) + parseInt(k0, 16);
var m1_ = parseInt(m1, 16) + parseInt(k1, 16);
//console.log(m0_);
//console.log((m1_ - parseInt(k1, 16)).toString(16));

/**
 * final step
 * bob get the message
 */
var mb;

if (isNaN(m0_)) {
    mb = (m1_ - parseInt(k1, 16)).toString(16);
} else {
    mb = (m0_ - parseInt(k0, 16)).toString(16);
}

console.log(mb);
console.log(hex2a(mb));

function makeid() {
    var text = "";
    var possible = "ABCDEFGabcdef0123456789";

    for (var i = 0; i < 2; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function a2hex(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i++) {
        var hex = Number(str.charCodeAt(i)).toString(16);
        arr.push(hex);
    }
    return arr.join("");
}

function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = "";
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

app.get("/send", function (request, response) {
    //response.render('pages/inbox');
    //console.log(request.query.subject);

    var msg = request.query.text;
    var m0 = msg.split(" ")[0];
    var m1 = msg.split(" ")[1];

    var key = new NodeRSA({ b: 8 });

    var bit = 2048;
    var exp = 65537;

    public_key = key.generateKeyPair(bit, exp);

    // console.log(public_key);

    //var encrypted = key.encrypt(text, 'base64');

    var mail = new Mail({
        subject: request.query.subject,
        text: request.query.text,
    });

    mail.save(function (err) {
        if (err) {
            console.error(err);
            response.json({ msg: "ERR" });
            return;
        }

        response.json({ msg: "OK" });
    });
});

app.listen(app.get("port"), function () {
    console.log("Node app is running on port", app.get("port"));
});
