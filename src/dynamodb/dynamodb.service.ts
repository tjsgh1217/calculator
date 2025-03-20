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
    // DynamoDB 클라이언트 설정
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    // 문서 클라이언트 생성 (JavaScript 객체 ↔ DynamoDB 항목 변환 지원)
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  // 항목 생성/업데이트
  async put(tableName: string, item: Record<string, any>) {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });

    return this.docClient.send(command);
  }

  // 단일 항목 조회
  async get(tableName: string, key: Record<string, any>) {
    const command = new GetCommand({
      TableName: tableName,
      Key: key,
    });

    return this.docClient.send(command);
  }

  // 전체 항목 스캔
  async scan(tableName: string, options?: any) {
    const command = new ScanCommand({
      TableName: tableName,
      ...options,
    });

    return this.docClient.send(command);
  }

  // 항목 업데이트
  async update(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
  ) {
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    });

    return this.docClient.send(command);
  }

  // 항목 삭제
  async delete(tableName: string, key: Record<string, any>) {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key,
    });

    return this.docClient.send(command);
  }
}
