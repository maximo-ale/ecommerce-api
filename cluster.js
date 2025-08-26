import os from 'os';
import cluster from 'cluster';
import app from './server.js';
import connectDB from './config/connectDB.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'test'){
    console.log('Test environment detected. Cluster will not start');
} else if (cluster.isPrimary){
    const numCPUs = os.cpus().length;
    console.log(`Master process ${process.pid} is running with ${numCPUs} CPUs`);

    for (let i = 0; i < numCPUs; i++){
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Creating a new one...`);
        cluster.fork();
    })
} else {
    connectDB()
        .then(() => {
            app.listen(PORT, () => console.log(`Cluster ${process.pid} listening on port ${PORT}`));
        });   
}