// run a free speed test for latency, upload, and download speeds  


const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { performance } = require('perf_hooks');
const mongoose = require('mongoose');



const speedtestSchema = new mongoose.Schema({
    download: Number,
    upload: Number,
    latency: Number,
    time: Number,
    timestamp: String
});
const Speedtest = mongoose.model('results', speedtestSchema);

//verify that the speedtest-cli is installed
async function verify() {
    try {
        await exec('speedtest-cli --version');
        console.log('Dependencies are installed, beginning testing!');
    } catch (error) {
        try{
            await exec('npm install speedtest-cli -g');
        }catch(e){
        console.log('speedtest-cli is not installed. Please install it and try again.');
        process.exit(1);
        }
    }
}




async function runSpeedTest()  {
    console.log('Running Speed Test at', new Date());
    const start = performance.now();
    const cmd = 'speedtest-cli --json';
    const { stdout, stderr } = await exec(cmd);
    const end = performance.now();
    //parse the json to get the results
    const result = JSON.parse(stdout);
    result.download = result.download / 1000000;
    result.upload = result.upload / 1000000;
    result.latency = result.ping;

    result.time = (end - start)/1000;
    result.timestamp = new Date().toISOString();
    console.log(result);
    if (stderr) {
        console.log('stderr: ' + stderr);
        process.exit(1);
    }
    console.log('Speed Test Complete at', new Date());
    console.log('Time Elapsed:', result.time, 'seconds');
    saveToDB(result).then(() => {
        console.log('Results saved to database');
    });
    calculateAverages();


}


//save the reults to mongoDB running on localhost:27017
//the database is called speedtest
//the collection is called results
//limit the collection to 300 documents
//if the collection is over 300 documents, delete the oldest document
//and save the new document

async function saveToDB(result) {
  //connect to the database
    mongoose.connect('mongodb://mongodb:27017/speedtest', { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('connected to database');
    }
    );
    //create a new document
    const newSpeedtest = new Speedtest(result);
    //save the document
    newSpeedtest.save(function (err, result) {
        if (err) return console.error(err);
        console.log('saved to database');
    }
    );
    //find the documents in the collection
    Speedtest.find({}, function (err, results) {
        if (err) return console.error(err);
        //if the collection is over 300 documents, delete the oldest document
        if (results.length > 300) {
            Speedtest.findOneAndRemove(
                {},
                { sort: { 'timestamp': 1 } },
                function (err, result) {
                    if (err) return console.error(err);
                    console.log('deleted oldest document');
                }
            );
        }
    }
    );
    //close the connection
}


//calculate the average latency, upload, and download speeds
//save the results to the speedtest database in a new collection called averages
//overwrite the averages collection every time the function is called

async function calculateAverages() {
    //connect to the database
    mongoose.connect('mongodb://mongodb:27017/speedtest', { useNewUrlParser: true });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('connected to database');
    }
    );
    //find the documents in the collection
    Speedtest.find({}, function (err, results) {
        if (err) return console.error(err);
        //create a new collection called averages
        const averages = mongoose.model('averages', speedtestSchema);
        //create a new document
        const newAverages = new averages({
            download: 0,
            upload: 0,
            latency: 0,
            time: 0,
            timestamp: new Date().toISOString()
        });
        //calculate the average latency, upload, and download speeds
        for (let i = 0; i < results.length; i++) {
            newAverages.latency += results[i].latency;
            newAverages.download += results[i].download;
            newAverages.upload += results[i].upload;
            newAverages.time += results[i].time;
        }
        newAverages.latency = newAverages.latency / results.length;
        newAverages.download = newAverages.download / results.length;
        newAverages.upload = newAverages.upload / results.length;
        newAverages.time = newAverages.time / results.length;
        //save the document
        newAverages.save(function (err, result) {
            if (err) return console.error(err);
            console.log('saved to database');
        }
        );
        //if a document exists in the averages collection, delete it and save the new document
        averages.findOneAndRemove(
            {},
            { sort: { 'timestamp': 1 } },
            function (err, result) {
                if (err) return console.error(err);
                console.log('deleted oldest document');
            }
        );
    }
    );

}








verify().then(() => {
    runSpeedTest();

    const express = require('express');
    const app = express();
    const server = require('http').Server(app);
    const cors = require('cors');

    const options = {cors:{origin:"*",}};

    const io = require('socket.io')(server, options);
    app.use(cors());
    
    //listen for socket connections and console log connections and disconnections
    //when a user conencts, send them all the data from the database
    // then send them an update every 5 minutes with all the data from the database
    io.on('connection', (socket) => {
        console.log('a user connected');
        Speedtest.find().sort({timestamp: 1}).exec(function(err, results) {
            if (err) return console.error(err);
            socket.emit('results', results);
            //emit averages
            Speedtest.findOne().sort({timestamp: -1}).exec(function(err, result) {
                if (err) return console.error(err);
                socket.emit('averages', result);
            });
            console.log('results sent to client');
        });
        setInterval(() => {
            Speedtest.find().sort({timestamp: 1}).exec(function(err, results) {
                if (err) return console.error(err);
                socket.emit('results', results);
                console.log('results sent to client');
            });
        }, 300000);
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    }
    );
    server.listen(8889, () => {
        console.log('Server Started at', new Date());
        setInterval(runSpeedTest, 300000);
    });
});