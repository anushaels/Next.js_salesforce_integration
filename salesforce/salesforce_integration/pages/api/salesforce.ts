import { NextApiRequest, NextApiResponse } from "next";
import SalesforceClient from "../../src/salesforceClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const salesforce = new SalesforceClient();

  try {
    const username = process.env.SALESFORCE_USERNAME;
    const password = process.env.SALESFORCE_PASSWORD;

    if (!username || !password) {
      throw new Error("Salesforce username or password is missing");
    }

    await salesforce.login(username, password);
    console.log("Successfully logged into Salesforce");

    if (req.method === "POST") {
      const { name, phone, industry } = req.body;
      if (!name || !phone || !industry) {
        throw new Error("Missing required fields: name, phone, or industry");
      }

      const newAccount = { Name: name, Phone: phone, Industry: industry };
      const createdAccount = await salesforce.create("Account", newAccount);
      res.status(200).json({ message: "Account created successfully", createdAccount });
      return;
    }

    if (req.method === "GET") {
      const accountsQuery = "SELECT Id, Name, Phone, Industry FROM Account";
      const accounts = await salesforce.query(accountsQuery);
      
      
      console.log("Retrieved Accounts:", accounts.records);
    
      res.status(200).json({ message: "Accounts retrieved successfully", accounts });
      return;
    }
    

    if (req.method === "PATCH") {
      const { id, name, phone, industry } = req.body;
      if (!id) {
        throw new Error("Missing required field: id");
      }
    
      const updatedAccount = { Id: id, ...(name && { Name: name }), ...(phone && { Phone: phone }), ...(industry && { Industry: industry }) };
    
      try {
        const result = await salesforce.update("Account", updatedAccount);
        console.log("Update Result:", result); 
      
        if (result.some(res => !res.success)) {
          throw new Error(`Update failed for some records: ${JSON.stringify(result)}`);
        }
      
        res.status(200).json({ message: "Account updated successfully", result });
      } catch (error: unknown) {  
        if (error instanceof Error) {  
          console.error("Update operation failed:", error.message);
          res.status(500).json({ message: "Account update failed", error: error.message });
        } else {
          
          console.error("Unknown error:", error);
          res.status(500).json({ message: "Account update failed", error: "Unknown error" });
        }
      }
      
      return;
    }
    

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) {
        throw new Error("Missing required field: id");
      }

      const result = await salesforce.delete("Account", id);
      res.status(200).json({ message: "Account deleted successfully", result });
      return;
    }

    res.setHeader("Allow", ["POST", "GET", "PATCH", "DELETE"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in Salesforce integration:", error.message);
      res.status(500).json({ message: "Salesforce integration failed", error: error.message });
    } else {
      console.error("Unknown error in Salesforce integration:", error);
      res.status(500).json({ message: "Salesforce integration failed", error: "Unknown error" });
    }
  }
}
