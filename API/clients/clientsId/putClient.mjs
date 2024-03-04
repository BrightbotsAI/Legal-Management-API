import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
    try {
        const id = parseInt(event.pathParameters.clientId, 10); // Obtener el clientId de la URL
        const { name, email, phone_number, address } = JSON.parse(event.body);

        // Obtener el cliente existente de DynamoDB
        const existingClient = await ddbDocClient.send(new GetCommand({
            TableName: "clients",
            Key: { client_id: id } // Usar client_id en lugar de clientId
        }));

        let updatedClient = {
            client_id: id, // Usar client_id en lugar de clientId
        };

        // Verificar si se proporcionan name, email, phone_number y address antes de asignarlos
        if (name) {
            updatedClient.name = name;
        }
        if (email) {
            updatedClient.email = email;
        }
        if (phone_number) {
            updatedClient.phone_number = phone_number;
        }
        if (address) {
            updatedClient.address = address;
        }

        if (existingClient.Item) {
            // Combinar los datos existentes con los nuevos datos
            updatedClient = { ...existingClient.Item, ...updatedClient };
        }

        // Actualizar solo los campos que han cambiado
        await ddbDocClient.send(new PutCommand({
            TableName: "clients",
            Item: updatedClient,
        }));

        if (existingClient.Item) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Client Successfully Updated" }),
            };
        } else {
            return {
                statusCode: 201,
                body: JSON.stringify({ message: "Client Created because it wasn't stored before" }),
            };
        }
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message }),
        };
    }
};