package main

import (
	"fmt"
)

type Metres float64
type Seconds float64
type Distance = Metres

func speed(distance Metres, duration Seconds) float64 { return float64(distance) / float64(duration) }

func main() {
	distance := Distance(12)
	fmt.Println("speed", speed(distance, Seconds(3)))
}
