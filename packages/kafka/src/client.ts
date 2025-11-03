import { Kafka } from "kafkajs";

export const createKafkaClient = (service: string) => {
  // Support both local Kafka and AWS MSK
  // If KAFKA_BROKERS is set (for AWS MSK), use it, otherwise use local brokers
  const brokers = process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",").map((b) => b.trim())
    : ["localhost:9094", "localhost:9095", "localhost:9096"];

  const config: any = {
    clientId: service,
    brokers,
  };

  // AWS MSK requires SSL/SASL authentication
  // ONLY enable SSL if explicitly using AWS MSK (not localhost)
  // For local Kafka (localhost), do NOT use SSL
  const isLocalhost = brokers.some(b => b.includes('localhost') || b.includes('127.0.0.1'));
  
  if (!isLocalhost && process.env.KAFKA_USE_SSL === "true") {
    // This is AWS MSK - enable SSL
    config.ssl = true;
    if (process.env.KAFKA_SECURITY_PROTOCOL === "SASL_SSL") {
      config.sasl = {
        mechanism: process.env.KAFKA_SASL_MECHANISM || "PLAIN",
        username: process.env.KAFKA_USERNAME || "",
        password: process.env.KAFKA_PASSWORD || "",
      };
    }
  } else {
    // Local Kafka - no SSL, no authentication
    config.ssl = false;
  }

  return new Kafka(config);
};
