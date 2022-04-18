import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Extend the default timeout so MongoDB binaries can download
jest.setTimeout(60000);

export class DBHandler {
  private mongoMemoryServer: MongoMemoryServer;

  constructor(mongoMemoryServer: MongoMemoryServer) {
    this.mongoMemoryServer = mongoMemoryServer;
  }

  connect = async () => {
    const uri = this.mongoMemoryServer.getUri();

    await mongoose.connect(uri);
  };

  closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.mongoMemoryServer.stop();
  };

  clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  };

  static setup() {
    let dbHandler: DBHandler;

    // Connect to a new in-memory database before running any tests.
    beforeAll(async () => {
      console.log("connect!")
      dbHandler = new DBHandler(await MongoMemoryServer.create());
    });

    // Clear all test data after every test.
    afterEach(async () => await dbHandler.clearDatabase());

    // Remove and close the db and server.
    afterAll(async () => await dbHandler.closeDatabase());
  }
}
