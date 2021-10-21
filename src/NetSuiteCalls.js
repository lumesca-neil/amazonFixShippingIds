const nsrestlet = require("nsrestlet");

class NetSuiteCalls {
    constructor( isLive ) {
        this.isLive = isLive
        if( this.isLive ) {
            this.accountSettings = {
                accountId: process.env.NS_ACCOUNT_ID,
                tokenKey: process.env.NS_TOKEN_KEY_LIVE,
                tokenSecret: process.env.NS_TOKEN_SECRET_LIVE,
                consumerKey: process.env.NS_CONSUMER_KEY_LIVE,
                consumerSecret: process.env.NS_CONSUMER_SECRET_LIVE
            }
        } else {
            this.accountSettings = {
                accountId: process.env.NS_ACCOUNT_ID_SB,
                tokenKey: process.env.NS_TOKEN_KEY_SB,
                tokenSecret: process.env.NS_TOKEN_SECRET_SB,
                consumerKey: process.env.NS_CONSUMER_KEY_SB,
                consumerSecret: process.env.NS_CONSUMER_SECRET_SB
            }
        }

        let fixAmazonShippingIds = false
        if( this.isLive ) {
            fixAmazonShippingIds = {
                url: this.getNSURL(
                    process.env.NS_FIX_SHIPINGID_LIVE,
                    process.env.NS_FIX_DEPLOY_LIVE
                ),
            }
        } else {
            fixAmazonShippingIds = {
                url: this.getNSURL(
                    process.env.NS_FIX_SHIPINGID_SB,
                    process.env.NS_FIX_DEPLOY_SB
                ),
            }
        }
        this.nsfixAmazonShippinLink = nsrestlet.createLink(
            this.accountSettings,
            fixAmazonShippingIds
        );
    }

    getNSURL(script, deploy) {
        let endpoint = false 
        if(this.isLive) {
            endpoint = process.env.NS_ENDPOINT
        } else {
            endpoint = process.env.NS_ENDPOINT_SB
        }
        return `${endpoint}/app/site/hosting/restlet.nl?script=${script}&deploy=${deploy}`;
    }

    async fixShippingID(update) {
        let aPromise = new Promise((resolve, reject) => {
            try {
                this.nsfixAmazonShippinLink.put(update, function (error, body) {
                    if (error) {
                        reject(error)
                    }

                    let result = false
                    try {
                        result = JSON.parse(body)
                    } catch(error) {
                        reject( new Error(`Failed to parse JSON result from netsuite for ${update.orderid}`))
                    }

                    if( result.success === 1 ) {
                        resolve({...update,"result":result})
                    } else {
                        reject( new Error(`Failed update to Netsuite for order ${update.orderid} message:${result.message}`))
                    }
                })
            } catch(error) {
                reject(error)
            }
        });

        return aPromise;
    }
}

module.exports = {
    NetSuiteCalls,
};
