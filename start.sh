# Login as kafka user
su kafka
cd /home/kafka

# Start Kafka server
$KAFKA_HOME/bin/kafka-server-start.sh -daemon /home/kafka/kafka_2.12-3.7.0/config/kraft/server.properties
sleep 5
$KAFKA_HOME/bin/kafka-topics.sh --create --if-not-exists --topic OneToOne --replication-factor=1 --partitions=1 --bootstrap-server localhost:9092
$KAFKA_HOME/bin/kafka-topics.sh --create --if-not-exists --topic OneToMany --replication-factor=1 --partitions=1 --bootstrap-server localhost:9092

# Login as node user
su node
cd /home/node

# Start Node server
npm run socket-dev