/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   parser.go                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: fakuz <fakuz@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/16 21:56:23 by fakuz             #+#    #+#             */
/*   Updated: 2025/12/16 22:03:23 by fakuz            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

package consumer

import (
	"encoding/json"
	"errors"
	"fmt"
)

func ParseTelemetryData(rawData []byte) (*TelemetryData, error) {
	var data TelemetryData

	if err := json.Unmarshal(rawData, &data); err != nil {
		return nil, fmt.Errorf("invalid json format: %w", err)
	}
	if data.VehicleID == 0 {
		return nil, errors.New("missing vehicle_id")
	}
	if data.Latitude == 0 || data.Longitude == 0 {
		return nil, errors.New("invalid coordinates")
	}
	if data.Time.IsZero() {
		return nil, errors.New("missing timestamp")
	}
	return &data, nil
}
