const uuid = require("uuid");
const Joi = require("@hapi/joi");
const decoratorValidator = require("./util/decoratorValidator");
const globalEnum = require("./util/globalEnum");
class Handler {
  constructor({ dynamoDbSvc }) {
    this.dynamoDbSvc = dynamoDbSvc;
    this.dynamodbTable = process.env.DYNAMODB_TABLE;
  }
  static validator() {
    return Joi.object({
      nome: Joi.string().max(100).min(2).required(),
      poder: Joi.string().max(20).required(),
    });
  }
  async getAllItens() {
    const params = {
      TableName: 'Heroes',
  };
    return this.dynamoDbSvc.scan(params).promise();
  }
  prepareData(data) {
    const params = {
      TableName: this.dynamodbTable,
      Item: {
        ...data,
        id: uuid.v1(),
        createdAt: new Date().toISOString(),
      },
    };
    return params;
  }
  handlerSuccess(data) {
    const response = {
      statusCode: 200,
      body: JSON.stringify(data),
    };
    return response;
  }
  handleError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't getall itens!!",
    };
  }
  async main(event) {
    try {
      const herores = await this.getAllItens();
      return this.handlerSuccess(herores);
    } catch (error) {
      console.error("Deu ruim**", error.stack);
      return this.handleError({ statusCode: 500 });
    }
  }
}
//factory
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'AKIANAQ2VOMFQBNO7KXE',  // needed if you don't have aws credentials at all in env
  secretAccessKey: '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' // needed if you don't have aws credentials at all in env

});
const handler = new Handler({
  dynamoDbSvc: dynamoDB,
});

module.exports = handler.main.bind(handler)
