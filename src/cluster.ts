import os from 'os';
import cluster from 'cluster';
import app from './server';
import dotenv from 'dotenv';
import createTables from './utils/tables/createTables';
import resetDB from './utils/tables/resetDB';
import pool from './config/connectDB';

dotenv.config();

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'test'){
    console.log('Test environment detected. Cluster will not start');
} else if (process.env.NODE_ENV === 'dev'){
    app.listen(PORT, () => console.log('Listening...'));
} else if (cluster.isPrimary){
    const numCPUs = os.cpus().length;
    if (process.env.RESET_DB_ON_START?.toLowerCase() === 'true'){
        await resetDB(pool);
    }

    await createTables(pool);
    console.log(`Master process ${process.pid} is running with ${numCPUs} CPUs`);

    for (let i = 0; i < numCPUs; i++){
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Creating a new one...`);
        cluster.fork();
    })
} else {
    app.listen(PORT, () => console.log(`Cluster ${process.pid} listening on port ${PORT}`));
}