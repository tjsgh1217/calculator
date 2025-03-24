import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoDBService {
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    this.docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        convertClassInstanceToMap: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  }

  async put(tableName: string, item: Record<string, any>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });

    return this.docClient.send(command);
  }

  async get(tableName: string, userId: string, calcId: string) {
    const command = new GetCommand({
      TableName: tableName,
      Key: { userId, calcId },
    });

    return this.docClient.send(command);
  }

  async scan(tableName: string, options?: any) {
    const command = new ScanCommand({
      TableName: tableName,
      ...options,
    });

    return this.docClient.send(command);
  }

  async update(
    tableName: string,
    userId: string,
    calcId: string,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
  ) {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: { userId, calcId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    });

    return this.docClient.send(command);
  }

  async delete(tableName: string, userId: string, calcId: string) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: { userId, calcId },
    });

    return this.docClient.send(command);
  }
}
