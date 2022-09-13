const { Kafka } = require("kafkajs")
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry')
const avro = require("avsc")

const registry = new SchemaRegistry({ host: 'http://host.docker.internal:8081' })

const clientId = "my-app"
const brokers = ["host.docker.internal:9093"]
const topic = "send-message"

const kafka = new Kafka({
    clientId,
    brokers
})

const consumer = kafka.consumer({
    groupId: clientId,
    minBytes: 5,
    maxBytes: 1e6,
    maxWaitTimeInMs: 3000,
})

const consume = async() => {
    await consumer.connect()
    await consumer.subscribe({ topic })
    await consumer.run({
        eachMessage: async({ message }) => {
            console.log("Message: " + message.value)
            const decodeValue = await registry.decode(message.value)

            console.log("DecodeValue: " + decodeValue)
        },
    })
}

consume()