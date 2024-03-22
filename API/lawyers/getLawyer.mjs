import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
  try {
    if (event.requestContext.http.method === "GET") {
      //Code to handle GET requests
      const id = parseInt(event.pathParameters?.lawyerId, 10);
      // console.log('event: ', event);
    
      const TableName = "lawyers";
      
      if (id) {
        //Code to handle GET requests (Retrieve lawyer by ID)
        const result = await ddbDocClient.send(new GetCommand({
          TableName,
          Key: { lawyer_id: id },
        }));
        if (!result.Item) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Lawyer not found" }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(result.Item),
        };
      } else {
        //Code for handling GET requests (Retrieve all lawyers)
        const result = await ddbDocClient.send(new ScanCommand({
          TableName,
        }));

        //Remove the "is_active" property of each lawyer
        const lawyersWithoutIsActive = result.Items.map(item => {
          const { is_active, ...lawyerWithoutIsActive } = item;
          return lawyerWithoutIsActive;
        });

        return {
          statusCode: 200,
          body: JSON.stringify(lawyersWithoutIsActive),
        };
      }
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Method not allowed" }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
      
    };
  }
};
