import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

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

    // Obtener el ID de la fila de la tabla "identifiers"
    const id = 1; // Reemplazar con el ID correcto de la fila de la tabla "identifiers"

    const getCommand = new GetCommand({
        TableName: "identifiers",
        Key: { id: id },
    });
    const { Item } = await ddbDocClient.send(getCommand);

    if (!Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Row with id 1 not found" })
        };
    }
    const idReference = Item.IdReference;
    const newId = idReference + 1;

    // Actualizar el valor de IdReference en la fila con id igual a 1 en la tabla "identifiers"
    const updateParams = {
        TableName: "identifiers",
        Key: { id: id },
        UpdateExpression: "SET IdReference = :newId",
        ExpressionAttributeValues: {
            ":newId": newId
        },
        ReturnValues: "ALL_NEW",
    };
    const updateCommand = new UpdateCommand(updateParams);
    await ddbDocClient.send(updateCommand);

    // Crear un objeto con los datos a almacenar en DynamoDB
    const clientItem = {
      client_id: newId, // Utilizar el nuevo ID generado
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