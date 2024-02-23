import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        if (event.requestContext.http.method === "GET") {
            // Código para manejar solicitudes GET (Obtener todos los documentos)
            const params = {
                TableName: "legalDocuments",
            };
            
            const data = await ddbDocClient.send(new ScanCommand(params));
            return {
                statusCode: 200,
                body: JSON.stringify(data.Items),
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Método no permitido" }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
};

export { handler };
