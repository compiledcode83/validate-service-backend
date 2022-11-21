#!/bin/bash
topics=("healthcheck" "user.create" "user.create.reply" "ticket.create" "ticket.create.reply" "ticket.transfer" "ticket.transfer.reply" "ticket.delete" "ticket.delete.reply", "message.send", "message.send.reply")

for i in "${topics[@]}"
do
  echo "Creating topic $i..."
  docker exec -it validate-kafka bash -c "./bin/kafka-topics.sh --create --topic $i --partitions 1 --replication-factor 1 --bootstrap-server localhost:9093"
done