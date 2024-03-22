import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
export const handler = async (event, context) => {
  try {
    if (event.requestContext.httpMethod === "GET") {
      const parts = event.path.split('/');
      const caseId = parseInt(parts[parts.length - 2], 10);

      if (isNaN(caseId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "The Legal case ID is not valid" }),
        };
      }
      const legalCasesParams = {
        TableName: "legalCases",
        Key: {
          case_id: caseId,
        },
      };
      const legalCasesData = await ddbDocClient.send(new GetCommand(legalCasesParams));
      if (!legalCasesData.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Error 404: Legal Case not found" }),
        };
      }
      const clientsParams = {
        TableName: "clients",
        Key: {
          client_id: legalCasesData.Item.client_id,
        },
        ProjectionExpression: "client_id, phone_number, email, address, created_at"
      };
      const clientsData = await ddbDocClient.send(new GetCommand(clientsParams));
      if (!clientsData.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Error 404: Client not found" }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(clientsData.Item),
      };
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "The method is not allowed" }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
