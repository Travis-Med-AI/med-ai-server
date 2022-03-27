var parseDbUrl = require("parse-database-url");
var url = process.env.POSTGRES_URL || "postgresql://test:test@postgres-db:5432/ai"
var dbConfig = parseDbUrl(url);

module.exports = {
   "type": "postgres",
   "host": dbConfig.host,
   "port": dbConfig.port,
   "username": dbConfig.user,
   "password": dbConfig.password,
   "database": dbConfig.database,
   "synchronize": true,
   "migrationsRun": true,
   "logging": false,
   "entities": [
      "build/entity/*.js"
   ],
   "migrations": [
      "build/migration/*.js"
   ],
   "subscribers": [
      "build/subscriber/*.js"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   }
}