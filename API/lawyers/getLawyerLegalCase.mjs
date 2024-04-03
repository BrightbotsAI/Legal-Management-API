import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ddbClient = new DynamoDB({ region: 'us-east-1' }); 

export const handler = async (event) => {
    try {
        const lawyerId = event.pathParameters.lawyerId;
        // console.log('Lawyer ID:', lawyerId);

        const params = {
            TableName: 'legalCases',
            FilterExpression: '#lawyerId = :lawyerId',
            ExpressionAttributeNames: {
                '#lawyerId': 'lawyer_id', 
            },
            ExpressionAttributeValues: {
                ':lawyerId': { N: lawyerId },
            },
        };
        
    
        const data = await ddbClient.scan(params);

        console.log('data:', data.Items);

        if (data.Items.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No legal cases were found associated with this attorney.', lawyerId }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ cases: data.Items.map(item => unmarshall(item)), lawyerId }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred while processing the request.' }),
        };
    }
};
