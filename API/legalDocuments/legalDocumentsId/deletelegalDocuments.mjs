import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const handler = async (event, context) => {
    try {
        if (event.httpMethod === "DELETE") {
            const documentData = JSON.parse(event.body);
            const document_id = parseInt(event.pathParameters.document_id, 10); // Obtener el ID del documento de la ruta del endpoint
            
            // Verificar si se proporciona el campo "status" en el cuerpo de la solicitud
            if (!documentData.hasOwnProperty("status")) {
                throw new Error("El campo 'status' es obligatorio para la actualización");
            }

            // Ejecuta la operación de actualización en DynamoDB
            await ddbDocClient.send(new UpdateCommand({
                TableName: "legalDocuments",
                Key: { document_id: document_id },
                UpdateExpression: "SET #s = :status",
                ExpressionAttributeValues: {
                    ":status": documentData.status
                },
                ExpressionAttributeNames: {
                    "#s": "status"
                }
            }));
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Documento actualizado correctamente" }),
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: "El método no está permitido" }),
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

export { handler };
