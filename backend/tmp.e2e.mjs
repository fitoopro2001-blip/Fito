// Temporary end-to-end check of the products/blogs/reviews endpoints against
// an in-memory MongoDB. Exercises auth gating, replies, and rating rollup.
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const 