'use strict'
const { Kafka } = require("kafkajs")
const { readAVSCAsync, SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry')
const clientId = "my-app"
const brokers = ["host.docker.internal:9093"]
const topic = "send-message"
const registry = new SchemaRegistry({ host: "http://host.docker.internal:8081" })

const schema = `
  {
    "type": "record",
    "name": "Training",
    "namespace": "training_examples",
    "fields": [{ "type": "string", "name": "FullName" }, { "type": "string", "name": "Age" }]
  }
`

const registrySchema = async() => {
    try {
        const { id } = await registry.register({ type: SchemaType.AVRO, schema })
        return id
    } catch (err) {
        console.log("RegistrySchemaError: " + err)
    }
}

const kafka = new Kafka({ clientId, brokers })
const producer = kafka.producer()

const produce = async() => {
    const idSchema = await registrySchema()
    console.log("id: " + idSchema)
    await producer.connect()
    let i = 0
    setInterval(async() => {
        try {
            const sendData = { FullName: `Quan Tran ${i}`, Age: "22" }

            const outgoingMessage = await registry.encode(idSchema, sendData)
            console.log("outgoingMessage: " + outgoingMessage)

            await producer.send({
                topic,
                messages: [{
                    value: outgoingMessage
                }, ],
            })
            i++
        } catch (err) {
            console.error("could not write message " + err)
        }
    }, 1000)
}
produce()