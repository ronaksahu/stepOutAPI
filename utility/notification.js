const admin = require('../utility/firebase-config')


const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };

async function sendNotification(registrationToken, message){
    try {
        const payload = {
            'notification': {
              'title': 'Ronak just logged an event',
              'body': 'a for b',
            }, 
            // NOTE: The 'data' object is inside payload, not inside notification
            'data': { 
                  'personSent': "Ronak" 
            }
          };
        const notificationSent = await admin.messaging().sendToDevice(registrationToken, payload, notification_options)
        console.log(JSON.stringify(notificationSent))
    } catch(error) {
        console.log(JSON.stringify(error))
    }
    
}

module.exports = sendNotification;