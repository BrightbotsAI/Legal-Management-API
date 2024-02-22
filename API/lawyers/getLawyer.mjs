import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
  try {
    if (event.requestContext.http.method === "GET") {
      // Código para manejar solicitudes GET
      const id = event.pathParameters?.id;

      const TableName = "lawyers";

      if (id) {
        // Código para manejar solicitudes GET (Recuperar lawyer por ID)
        const result = await ddbDocClient.send(new GetCommand({
          TableName,
          Key: { lawyer_id: id },
        }));
        if (!result.Item) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Lawyer no encontrado" }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(result.Item),
        };
      } else {
        // Código para manejar solicitudes GET (Recuperar todos los lawyers)
        const result = await ddbDocClient.send(new ScanCommand({
          TableName,
        }));

        return {
          statusCode: 200,
          body: JSON.stringify(result.Items),
        };
      }
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: "Método no permitido" }),
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