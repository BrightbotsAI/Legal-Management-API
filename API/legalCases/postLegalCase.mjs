import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const handler = async (event, context) => {
    try {
        const { case_id, case_title, court, date_filed, relevant_statutes, summary, client_id, lawyer_id, is_active} = JSON.parse(event.body);
        if (!case_id || !case_title || !court || !date_filed || !relevant_statutes || !summary || !client_id || !lawyer_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "case_id, case_title, court, created_at, date_filed, relevant_statutes, summary, client_id, lawyer_id are required." }),
            };
        }        
        const newLegalCase = {
            case_id, case_title, court, created_at: new Date().toLocaleDateString(), date_filed, relevant_statutes, summary, client_id, lawyer_id, is_active:true
        };
        await ddbDocClient.send(new PutCommand({
            TableName: "legalCases",
            Item: newLegalCase,
        }));
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Legal Case Successfully created" }),
            //body: JSON.stringify(newLegalCase),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};
