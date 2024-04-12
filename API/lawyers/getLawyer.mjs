import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import filterActiveLawyers, {parsePathParameterToInt, parseQueryParamToInt} from './utils.mjs'

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event, context) => {
  try {
    if (event.requestContext.http.method === "GET") {
      
      const TableName = "lawyers";
      const id = parsePathParameterToInt("lawyerId", event)
      
      if (id) {
        //Code to handle GET requests (Retrieve lawyer by ID)
        const result = await ddbDocClient.send(new GetCommand({
          TableName,
          Key: { lawyer_id: id },
        }));
        
        if (!result.Item || !result.Item.is_active) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Lawyer not found" }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(filterActiveLawyers([result.Item])),
        };
      }else{
        // Gets page and limit query parameters
        const queryParams = event.queryStringParameters;
        const page = parseQueryParamToInt(queryParams, "page", 1);
        const limit = parseQueryParamToInt(queryParams, "limit", 5);
        
        if (page < 1 || limit < 1) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid page or limit parameter" }),
          };
        }
        // Gets the total number of lawyers
        const result = await ddbDocClient.send(new ScanCommand({
          TableName,
        }));
        const filterLawyers = filterActiveLawyers(result.Items);
        //Sorting lawyers by lawyer_id in descending order
        filterLawyers.sort((a, b) => b.lawyer_id - a.lawyer_id);
        const totalCount = filterLawyers.length;
        //Calculates the total number of pages
        const totalPages = Math.ceil(totalCount / limit);
        if (page > totalPages) {
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Page not found" }),
          };
        }
        // Calculate offset
        const offset = (page - 1) * limit;
        // Applies paging
        const paginatedLawyers = filterLawyers.slice(offset, offset + limit);
        return {
          statusCode: 200,
          body: JSON.stringify({
            total_pages: totalPages,
            current_page: page,
            lawyers: paginatedLawyers
          }),
        };
      }
    }else {
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