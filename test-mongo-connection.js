const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://czfleo123:zxc51190@vertix.lfx637c.mongodb.net/discord';

async function connect() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('discord');
        const collections = await db.listCollections().toArray();
        console.log('📁 Collections:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await client.close();
    }
}

connect();
