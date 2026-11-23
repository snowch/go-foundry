package main

import (
	"fmt"
)

type Point struct{ X, Y int }

func main() {
	point := Point{X: 2, Y: 3}
	moved := point
	moved.X = 9
	fmt.Println("original", point)
	fmt.Println("moved", moved)
}
