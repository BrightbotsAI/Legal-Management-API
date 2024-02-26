import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
    try {
        if (event.requestContext.httpMethod === "GET") {
            const document_id = parseInt(event.pathParameters.document_id, 10); 
            if (isNaN(document_id)) { // Verificar si la conversión fue exitosa
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "ID no es un número válido" }),
                };
            }

            const params = {
                TableName: "legalDocuments",
                Key: {
                    document_id: document_id, // Usa el nombre correcto de la clave primaria
                },
            };

            const data = await ddbDocClient.send(new GetCommand(params));
            
            if (!data.Item) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: "Documento no encontrado" }),
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(data.Item),
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Método no permitido" }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
};

