# Login as kafka user
su kafka
cd /home/kafka

# Start Kafka server
$KAFKA_HOME/bin/kafka-server-start.sh -daemon /home/kafka/kafka_2.12-3.7.0/config/kraft/server.properties
sleep 5
$KAFKA_HOME/bin/kafka-topics.sh --create --if-not-exists --topic one-to-one-service --replication-factor=1 --partitions=1 --bootstrap-server localhost:9092
$KAFKA_HOME/bin/kafka-topics.sh --create --if-not-exists --topic one-to-many-service --replication-factor=1 --partitions=1 --bootstrap-server localhost:9092
$KAFKA_HOME/bin/kafka-topics.sh --create --if-not-exists --topic socket-service --replication-factor=1 --partitions=1 --bootstrap-server localhost:9092
sleep 5
# Login as node user
su node
cd /home/node

# Define default command.
rm /home/node/dump.rdb
redis-server --daemonize yes

echo "Redis server started"

# Start Node server
npm run start-socket
npm run one-to-one-dev