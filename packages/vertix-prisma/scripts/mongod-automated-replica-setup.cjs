const { execSync } = require( 'child_process' );
const path = require( 'path' );
const fs = require( 'fs' );
const os = require( 'os' );

const homeUser = process.env.SUDO_USER || os.userInfo().username;
const homeDirectory = process.env.SUDO_USER ? path.join( '/home/', homeUser ) : os.homedir();

const DEFAULT_CONFIG_DIR = path.join( homeDirectory, 'replica_config' );
const DEFAULT_TEMPLATE_CONF_PATH = '/etc/mongod.conf';
const DEFAULT_MONGO_USER_GROUP = 'mongodb:mongodb';
const DEFAULT_REPLICA_PORTS = [ 27018, 27019 ];
const DEFAULT_SERV_PORT = 27017; // This should be the primary
const DEFAULT_MAIN_CONF_PATH = 'main_mongod.conf';

const runCommand = ( command ) => {
    try {
        execSync( command, { stdio: 'pipe' } );
    } catch ( err ) {
        console.error( `Error running command: ${ command }` );
        console.error( err.message );
        throw err;
    }
};

const createDirAndSetOwnership = ( directory ) => {
    if ( ! fs.existsSync( directory ) ) {
        console.log( `Creating directory: ${ directory }` );
        fs.mkdirSync( directory, { recursive: true } );
    } else {
        console.log( `Directory already exists: ${ directory }` );
    }
    runCommand( `chown -R ${ DEFAULT_MONGO_USER_GROUP } ${ directory }` );
};

const sanitizeConfig = ( config ) => config.replace( /storage:\s*journal:\s*enabled:.*/g, '' );

const createMongodConf = ( port, dataPath, logPath ) => {
    const replicationConfig = `
replication:
  replSetName: "myReplicaSet"`;
    return sanitizeConfig(
        fs.readFileSync( DEFAULT_TEMPLATE_CONF_PATH, 'utf8' )
            .replace( /dbPath:.*/, `dbPath: ${ dataPath }` )
            .replace( /port:.*/, `port: ${ port }` )
            .replace( /systemLog:\s*destination: file\s*logAppend: true\s*path: .*/, `systemLog:\n  destination: file\n  logAppend: true\n  path: ${ logPath }` )
    ) + replicationConfig;
};

const ensureRootPrivilege = () => {
    if ( process.getuid() !== 0 ) {
        console.error( 'This script must be run as root. Please rerun it with sudo.' );
        process.exit( 1 );
    }
};

const stopMongodOnPorts = ( ports ) => {
    ports.forEach( port => {
        try {
            execSync( `mongosh --port ${ port } --eval "db.getSiblingDB('admin').shutdownServer()"`, { stdio: 'ignore' } );
        } catch {
            console.log( `No running mongod instance found on port ${ port }, skipping shutdown.` );
        }
    } );
};

const generateConfigFiles = ( ports, dataDirs, configDir ) => {
    ports.forEach( ( port, index ) => {
        const configDirName = `mongod${ index + 1 }`;
        const logPath = path.join( configDir, `${ configDirName }.log` );
        const mongodConf = createMongodConf( port, dataDirs[ index ], logPath );
        const outputMongodConfPath = path.join( configDir, `${ configDirName }.conf` );
        fs.writeFileSync( outputMongodConfPath, mongodConf, 'utf8' );
        console.log( `${ outputMongodConfPath } has been created.` );
    } );
    const mainLogPath = path.join( configDir, 'main_mongod.log' );
    const mainMongodConf = createMongodConf( DEFAULT_SERV_PORT, dataDirs[ 2 ], mainLogPath );
    const mainMongodConfPath = path.join( configDir, DEFAULT_MAIN_CONF_PATH );
    fs.writeFileSync( mainMongodConfPath, mainMongodConf, 'utf8' );
    console.log( `${ mainMongodConfPath } has been created.` );
};

const waitForService = ( port, timeout = 5000 ) => {
    const start = Date.now();
    while ( Date.now() - start < timeout ) {
        try {
            execSync( `mongosh --port ${ port } --eval "db.adminCommand('ping')"` );
            console.log( `Mongod service is up on port ${ port }` );
            return true;
        } catch {
            console.log( `Waiting for mongod service on port ${ port }...` );
        }
    }
    console.error( `Timeout waiting for mongod service on port ${ port }.` );
    process.exit( 1 );
};

const isReplicaSetInitialized = () => {
    try {
        console.log( 'Checking if replica set is initialized...' );
        const result = execSync( 'mongosh --port 27017 --eval "rs.status()"', { encoding: 'utf8' } );
        return result.includes( '"ok" : 1' ) || result.includes( 'name' ) || result.includes( 'self' );
    } catch ( err ) {
        return false;
    }
};

const addMembersToReplicaSet = () => {
    console.log( 'Adding members to the replica set if they are not present on ports 27018 and 27019...' );
    DEFAULT_REPLICA_PORTS.forEach( port => {
        try {
            console.log( `Checking if 127.0.0.1:${ port } is already a member...` );
            const status = execSync( 'mongosh --port 27017 --eval "rs.status()"', { encoding: 'utf8' } );
            if ( ! status.includes( `127.0.0.1:${ port }` ) ) {
                execSync( `mongosh --port 27017 --eval "rs.add('127.0.0.1:${ port }')"`, { stdio: 'pipe' } );
                console.log( `Added 127.0.0.1:${ port } to the replica set.` );
            } else {
                console.log( `127.0.0.1:${ port } is already a member of the replica set.` );
            }
        } catch ( err ) {
            console.error( `Failed to verify or add node 127.0.0.1:${ port } to the replica set: ${ err.message }` );
        }
    } );
};

const initializeReplicaSet = () => {
    if ( isReplicaSetInitialized() ) {
        console.log( 'Replica set is already initialized.' );
    } else {
        console.log( 'Initializing replica set with 27017 as primary...' );
        try {
            execSync( 'mongosh --port 27017 --eval "rs.initiate()"', { stdio: 'pipe' } );
        } catch ( err ) {
            console.error( `Failed to initialize the replica set: ${ err.message }` );
            process.exit( 1 );
        }
        waitForService( 27017, 10000 );
    }
    // Add secondary members to the replica set
    addMembersToReplicaSet();
};

const main = () => {
    ensureRootPrivilege();

    // Remove replica config if exist
    execSync( `rm -rf ${ DEFAULT_CONFIG_DIR }` );
    stopMongodOnPorts( DEFAULT_REPLICA_PORTS.concat( [ DEFAULT_SERV_PORT ] ) );
    const dataDirs = [
        path.join( DEFAULT_CONFIG_DIR, 'data1' ),
        path.join( DEFAULT_CONFIG_DIR, 'data2' ),
        path.join( DEFAULT_CONFIG_DIR, 'dataMain' )
    ];
    createDirAndSetOwnership( DEFAULT_CONFIG_DIR );
    dataDirs.forEach( createDirAndSetOwnership );
    generateConfigFiles( DEFAULT_REPLICA_PORTS, dataDirs, DEFAULT_CONFIG_DIR );
    try {
        DEFAULT_REPLICA_PORTS.forEach( port => {
            const configPath = path.join( DEFAULT_CONFIG_DIR, `mongod${ DEFAULT_REPLICA_PORTS.indexOf( port ) + 1 }.conf` );
            const logPath = path.join( DEFAULT_CONFIG_DIR, `mongod${ DEFAULT_REPLICA_PORTS.indexOf( port ) + 1 }.log` );
            console.log( `Starting mongod on port ${ port } with config ${ configPath }` );
            runCommand( `mongod --config ${ configPath } --fork` );
            console.log( `Mongod is logging to: ${ logPath }` );
        } );
        const mainConfigPath = path.join( DEFAULT_CONFIG_DIR, DEFAULT_MAIN_CONF_PATH );
        console.log( `Starting main mongod on port ${ DEFAULT_SERV_PORT } with config ${ mainConfigPath }` );
        runCommand( `mongod --config ${ mainConfigPath } --fork` );
        console.log( `Mongod is logging to: ${ path.join( DEFAULT_CONFIG_DIR, 'main_mongod.log' ) }` );
    } catch ( err ) {
        console.error( 'Error starting mongod instances:', err.message );
        process.exit( 1 );
    }

    DEFAULT_REPLICA_PORTS.concat( [ DEFAULT_SERV_PORT ] ).forEach( port => waitForService( port, 20000 ) );
    initializeReplicaSet();
};
main();
