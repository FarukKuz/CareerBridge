/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   model.go                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: fakuz <fakuz@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/16 20:54:48 by fakuz             #+#    #+#             */
/*   Updated: 2025/12/17 00:09:56 by fakuz            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

package consumer

import (
	"encoding/json"
	"time"
)

type TelemetryData struct {
	Time       time.Time       `json:"time"`
	VehicleID  int64           `json:"vehicle_id"`
	Latitude   float64         `json:"latitude"`
	Longitude  float64         `json:"longitude"`
	Speed      int             `json:"speed"`
	EngineTemp int             `json:"engine_temp"`
	FuelLevel  int             `json:"fuel_level"`
	Heading    int             `json:"heading"`
	Metadata   json.RawMessage `json:"metadata"`
}
