import type { Kafka, Producer } from "kafkajs";

export const createProducer = (kafka: Kafka) => {
  const producer: Producer = kafka.producer({
    // For local development, allow topic auto-creation with replication factor 1
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
  });

  const connect = async () => {
    await producer.connect();
  };
  const send = async (topic: string, message: object) => {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
      // For local development, use replication factor 1
      acks: 1,
    });
  };

  const disconnect = async () => {
    await producer.disconnect();
  };

  return { connect, send, disconnect };
};
