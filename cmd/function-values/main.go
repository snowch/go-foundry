package main

import (
	"fmt"
)

func double(value int) int                         { return value * 2 }
func triple(value int) int                         { return value * 3 }
func apply(value int, operation func(int) int) int { return operation(value) }

func main() {
	fmt.Println("applied", apply(4, double))
}
