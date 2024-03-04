import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = "clients";

export const handler = async (event, context) => {
  console.log('EVENT: ', event);
  try {
    const requestBody = JSON.parse(event.body);

    // Validar que los campos requeridos están presentes en la solicitud
    const requiredFields = ["name", "email", "phone_number", "address"];
    for (const field of requiredFields) {
      if (!requestBody[field]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: `${field} is required` }),
        };
      }
    }

    // Validar que el campo 'email' sea un correo válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestBody.email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid email format" }),
      };
    }

    // Generar un ID numérico aleatorio
    const randomId = Math.floor(Math.random() * 1000000);

    // Crear un objeto con los datos a almacenar en DynamoDB
    const clientItem = {
      client_id: randomId, // Cambiado de "id" a "client_id"
      name: requestBody.name,
      email: requestBody.email,
      phone_number: requestBody.phone_number,
      address: requestBody.address,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    // Almacenar el objeto en la tabla de DynamoDB
    await ddbDocClient.send(
      new PutCommand({
        TableName: tableName,
        Item: clientItem,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Client created successfully",
        client: clientItem,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating client" }),
    };
  }
};