const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
const {NetSuiteCalls} = require('./NetSuiteCalls.js')
const dotenv = require('dotenv')

class AmazonFixShippingID {
    constructor() {
        dotenv.config()
        this.data = './data/3874252018921.csv'
        this.nsFixer = new NetSuiteCalls(true)
    }

    async ReadCSV(filename) {
        let self = this
        const aPromise = new Promise((resolve, reject) => {
            try {
                let inputStream = Fs.createReadStream(filename, 'utf8')

                let items = []
                inputStream
                    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true, asObject:true }))
                    .on('data', function (row) {
                        items.push(row)
                    })
                    .on('end', function () {
                        self.orderLines = items;
                        resolve(items)
                    })
            } catch(error) {
                reject(error)
            }
        })

        return aPromise;
    }

    getUpdateJson( item ) {
        let data = {
            "orderid": item['Amazon Order Id'],
            "quantity": item['Dispatched Quantity'],
            "sku": item['Merchant SKU'],
            "shipmentid": item['Shipment ID']
        }
        return data;
    }

    async run() {
        await this.ReadCSV(this.data)
        for( let index in this.orderLines ) {
            let item = this.orderLines[index]
            let anUpdate = this.getUpdateJson(item)
            console.log(`//--------------- Updating: ${item['Amazon Order Id']} ----------------------/`)
            try {
                console.log( 'ok', await this.nsFixer.fixShippingID(anUpdate) )
            } catch(error) {
            console.log('error',error)
            } 
        }
    }
}

let aFix = new AmazonFixShippingID
aFix.run()

