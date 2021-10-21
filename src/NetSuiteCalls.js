const nsrestlet = require("nsrestlet");
const fs = require("fs");
const MwsApi = require("amazon-mws");

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
        
        let invoicesUrlSettings = false
        if( this.isLive ) {
            invoicesUrlSettings = {
                url: this.getNSURL(
                    process.env.NS_INVOICE_SCRIPTID,
                    process.env.NS_INVOICE_DEPLOY
                ),
            }
        } else {
            invoicesUrlSettings = {
                url: this.getNSURL(
                    process.env.NS_INVOICE_SCRIPTID_SB,
                    process.env.NS_INVOICE_DEPLOY_SB
                ),
            }
        }

        this.nsInvoicesLink = nsrestlet.createLink(
            this.accountSettings,
            invoicesUrlSettings
        );

        let invoiceUploadedSettings = false
        if( this.isLive ) {
            invoiceUploadedSettings = {
                url: this.getNSURL(
                    process.env.NS_INVOICE_COMPLETEDID,
                    process.env.NS_INVOICE_DEPLOY
                ),
            }
        } else {
            invoiceUploadedSettings = {
                url: this.getNSURL(
                    process.env.NS_INVOICE_COMPLETEDID_SB,
                    process.env.NS_INVOICE_DEPLOY_SB
                ),
            }
        }
        this.nsinvoiceUploadedLink = nsrestlet.createLink(
            this.accountSettings,
            invoiceUploadedSettings
        );

        this.debugLimitedNSIDS = false;
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

    async getNSSearch(searchId) {
        let self = this;
        let promise = new Promise(function (resolve, reject) {
            try {
                let script = 132;
                let deploy = 1;
                let options = { search_id: searchId };
    
                let searchUrl = {
                    url: self.getNSURL(script, deploy),
                };
                let nsLink = nsrestlet.createLink(self.accountSettings, searchUrl);
    
                let allData = [];
                nsLink.get(options, function (error, body) {
                    if (error) {
                        reject(error);
                        return;
                    }
    
                    for (let rowIndex in body.data) {
                        let rowData = {};
                        for (let columnIndex in body.data[rowIndex].columns) {
                            rowData[columnIndex] =
                                body.data[rowIndex].columns[columnIndex];
                        }
                        allData.push(rowData);
                    }
                    resolve(allData);
                });
            } catch(error) {
                reject(error);
            }
        });

        return promise;
    }
}

module.exports = {
    NetSuiteCalls,
};
