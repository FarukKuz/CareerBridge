/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   redis-consumer.go                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: fakuz <fakuz@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/16 22:04:32 by fakuz             #+#    #+#             */
/*   Updated: 2025/12/16 22:26:59 by fakuz            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

package consumer

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

type TelemetryProcessorFunc func(data *TelemetryData) error

type RedisConsumer struct {
	client    *redis.Client
	streamKey string
	group     string
	consumer  string
}

func NewRedisConsumer(rdb *redis.Client, stream, group, consumerName string) *RedisConsumer {
	return &RedisConsumer{
		client:    rdb,
		streamKey: stream,
		group:     group,
		consumer:  consumerName,
	}
}

func (r *RedisConsumer) Start(ctx context.Context, processFunc TelemetryProcessorFunc) {
	log.Printf("Redis Consumer başlatildi. Stream: %s", r.streamKey)

	r.client.XGroupCreateMkStream(ctx, r.streamKey, r.group, "$").Err()

	for {
		select {
		case <-ctx.Done():
			log.Println("Redis Consumer durduruluyor...")
			return
		default:
			entries, err := r.client.XReadGroup(ctx, &redis.XReadGroupArgs{
				Group:    r.group,
				Consumer: r.consumer,
				Streams:  []string{r.streamKey, ">"},
				Count:    10,
				Block:    2 * time.Second,
			}).Result()

			if err != nil {
				if err != redis.Nil {
					log.Printf("Redis okuma hatasi: %v", err)
					time.Sleep(1 * time.Second)
				}
				continue
			}

			for _, stream := range entries {
				for _, message := range stream.Messages {
					payloadStr, ok := message.Values["payload"].(string)
					if !ok {
						log.Printf("Hatali veri formati, MessageID: %s", message.ID)
						continue
					}

					telemetry, err := ParseTelemetryData([]byte(payloadStr))
					if err != nil {
						log.Printf("Parse hatasi: %v. Data: %s", err, payloadStr)
						r.client.XAck(ctx, r.streamKey, r.group, message.ID)
						continue
					}

					if err := processFunc(telemetry); err != nil {
						log.Printf("İşleme hatası: %v", err)
					} else {
						r.client.XAck(ctx, r.streamKey, r.group, message.ID)
					}
				}
			}
		}
	}
}
