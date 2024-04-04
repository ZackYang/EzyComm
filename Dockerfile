FROM ubuntu:22.04

# Start install Kafka
USER root
RUN mkdir -p /home/kafka
WORKDIR /home/kafka

# Add kafka user
RUN useradd -rm -d /home/kafka -s /bin/bash -g root -G sudo -u 1002 kafka
RUN chown -R kafka:root /home/kafka

# Install Java
RUN apt-get update
RUN apt-get install -y wget gnupg2 software-properties-common
RUN wget -O- https://apt.corretto.aws/corretto.key | apt-key add - 
RUN add-apt-repository 'deb https://apt.corretto.aws stable main'
RUN apt-get update; apt-get install -y java-11-amazon-corretto-jdk

# Check if java is installed
RUN java -version

# Install Kafka
USER kafka
RUN wget https://downloads.apache.org/kafka/3.7.0/kafka_2.12-3.7.0.tgz
RUN tar xzf kafka_2.12-3.7.0.tgz

# Start Kafka with KRaft mode
WORKDIR /home/kafka/kafka_2.12-3.7.0
ENV KAFKA_HOME=/home/kafka/kafka_2.12-3.7.0
ENV PATH=$PATH:$KAFKA_HOME/bin

# Format the Kafka data directory
RUN bin/kafka-storage.sh format -t 1 -c config/kraft/server.properties
# RUN bin/kafka-server-start.sh config/kraft/server.properties
EXPOSE 9092
EXPOSE 9093
EXPOSE 9094

# Install Node.js
USER root
ENV NODE_VERSION=20.11.1
ENV NODE_ENV=production

RUN apt install -y curl

RUN useradd -rm -d /home/node -s /bin/bash -g root -G sudo -u 1001 node
RUN mkdir -p /home/node/src
WORKDIR /home/node

USER node

# Install nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
ENV NVM_DIR=/home/node/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use 20
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/home/node/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN node --version
RUN npm --version

# Install app dependencies
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install -g npm@10.5.1

# Bundle app source
USER root
RUN chown -R node:root /home/node

USER node
RUN npm install --production --silent 
RUN npm install -g ts-node
RUN npm install -g pino-pretty
COPY . .
EXPOSE 7070

# Start app with the shell script
USER root
CMD ["/bin/bash", "/home/node/start.sh"]
