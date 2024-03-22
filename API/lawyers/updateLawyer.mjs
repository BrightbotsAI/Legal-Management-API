import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

//Utilities
const isEmptyOrNull = (value) => value === null || value === undefined || value === '';

//Validations
const isValidField = (value, regex = null) => typeof value === 'string' && (regex ? regex.test(value) : true);


//Obtain information from a lawyer
const getLawyerData = async (lawyerId) => {
  return await ddbDocClient.send(new GetCommand({
    TableName: "lawyers",
    Key: { lawyer_id: lawyerId },
  }));
};

//Input validation
const validateInput = (lawyerData) => {
  if (lawyerData.name) {
    // Remove leading and trailing blanks
    lawyerData.name = lawyerData.name.trim();
    if (!isValidField(lawyerData.name, /^[a-zA-Z\s]+$/)) {
      throw new Error("Invalid name format");
    }
  }

  if (lawyerData.specialization) {
    // Remove leading and trailing blanks
    lawyerData.specialization = lawyerData.specialization.trim();
    if (!isValidField(lawyerData.specialization)) {
      throw new Error("Invalid specialization format");
    }
  }

  if (lawyerData.contact_info) {
    // Remove leading and trailing blanks
    lawyerData.contact_info = lawyerData.contact_info.trim();
    if (!isValidField(lawyerData.contact_info)) {
      throw new Error("Invalid contact info format");
    }
  }
};


//Construct the update expression
const buildUpdateExpression = (lawyerData) => {
  let expression = 'set ';
  let expressionValues = {};
  let expressionAttributeNames = {};

  Object.entries(lawyerData).forEach(([key, value], index) => {
    if (!isEmptyOrNull(value) && key !== 'is_active') {
      const prefix = index > 0 ? ', ' : '';
      expression += `${prefix}#${key} = :${key}`;
      expressionValues[`:${key}`] = value;
      expressionAttributeNames[`#${key}`] = key;
    }
  });

  return { expression, expressionValues, expressionAttributeNames };
};

//Main Handler
const handler = async (event) => {
  if (event.requestContext.http.method !== "PUT") {
    return { statusCode: 405, body: JSON.stringify({ message: "Method not allowed" }) };
  }

  const lawyerData = JSON.parse(event.body);
  const lawyerId = parseInt(event.pathParameters.lawyerId);

  try {
    //Validate input
    validateInput(lawyerData);

    const { Item } = await getLawyerData(lawyerId);
    if (!Item ||!Item.is_active) {
      return { statusCode: 404, body: JSON.stringify({ message: "Lawyer not found" }) };
    }

    const { expression, expressionValues, expressionAttributeNames } = buildUpdateExpression(lawyerData);

    //Update the lawyer in the DynamoDB table
    await ddbDocClient.send(new UpdateCommand({
      TableName: "lawyers",
      Key: { lawyer_id: lawyerId },
      UpdateExpression: expression,
      ExpressionAttributeValues: expressionValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "UPDATED_NEW"
    }));

    return { statusCode: 200, body: JSON.stringify({ message: "Lawyer successfully updated" }) };
  }catch (error) {
    console.error(error);
    return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
  }
};

export { handler };
