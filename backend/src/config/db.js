import dns from 'node:dns';
import mongoose from 'mongoose';

// A mongodb+srv:// URI makes Node resolve SRV *and* TXT records before it can
// connect, and some home/ISP resolvers answer the SRV but silently drop the
// TXT — which surfaces as "MongoDB connection error: queryTxt ETIMEOUT" with
// no other explanation. Setting DNS_SERVERS locally (e.g. "1.1.1.1,8.8.8.8")
// routes just those lookups around the broken resolver. Left unset — as it is
// in production — Node's default resolver is used and nothing changes here.
const dnsServers = process.env.DNS_SERVERS?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);
if (dnsServers?.length) {
    dns.setServers(dnsServers);
}

// Serverless functions (Vercel) can invoke this on every cold start, and
// multiple function instances can run concurrently — without caching the
// connection promise, each invocation would open a new connection and
// quickly exhaust MongoDB Atlas's connection limit. `global` survives across
// invocations on a warm instance, so this reuses one connection (or one
// in-flight connection attempt) per instance instead.
let cached = global._mongooseConnection;
if (!cached) {
    cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongooseInstance) => {
            console.log('MongoDB connected');
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        // Let the next invocation retry instead of reusing a rejected promise.
        cached.promise = null;
        throw err;
    }

    return cached.conn;
};

export default connectDB;
