import jsforce, { Connection, Record, SaveResult, QueryResult } from "jsforce";

type SObjectRecord = Record & { Id: string };

class SalesforceClient {
  private conn: Connection;

  constructor() {
    this.conn = new jsforce.Connection({
      loginUrl: process.env.SALESFORCE_LOGIN_URL,
    });
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const loginResponse = await this.conn.login(username, password);
      console.log("Salesforce login successful:", loginResponse);
    } catch (error) {
      console.error("Salesforce login failed:", error);
      throw error;
    }
  }

  async query<T extends Record>(query: string): Promise<QueryResult<T>> {
    try {
      const result = await this.conn.query(query);
      return result as QueryResult<T>;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  async create<T extends Record>(objectName: string, records: T | T[]): Promise<SaveResult[]> {
    try {
      const result = await this.conn.sobject(objectName).create(records);
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error(`Error inserting records into ${objectName}:`, error);
      throw error;
    }
  }

  async update<T extends SObjectRecord>(objectName: string, records: T | T[]): Promise<SaveResult[]> {
    try {
      const result = await this.conn.sobject(objectName).update(records);
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error(`Error updating records in ${objectName}:`, error);
      throw error;
    }
  }

  async delete(objectName: string, ids: string | string[]): Promise<SaveResult[]> {
    try {
      const result = await this.conn.sobject(objectName).destroy(ids);
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error(`Error deleting records from ${objectName}:`, error);
      throw error;
    }
  }
  
}

export default SalesforceClient;
