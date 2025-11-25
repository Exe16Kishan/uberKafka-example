import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "riderLocation",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer()
export const run = async (coords) => {
  try {
    await producer.connect()
    await producer.send({
        topic:"ride",
        messages:[{value:JSON.stringify(coords)}]
    })

    console.log("connected kafka")
    
  } catch (err) {
    console.log(err);
  }
};
