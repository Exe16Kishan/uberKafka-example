const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-consumer-app',
  brokers: ['localhost:9092'], 
});

const consumer = kafka.consumer({ groupId: 'my-consumer-group' }); 

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'ride', fromBeginning: true }); // Replace with your Kafka topic name

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        value: message.value.toString(),
        topic,
        partition,
      });
      // Process the message here
    },
  });
};

runConsumer().catch(console.error);