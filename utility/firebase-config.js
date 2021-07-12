var admin = require("firebase-admin");

var serviceAccount = require("../firebase.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://step-out-e531a.firebaseio.com"
})

module.exports = admin