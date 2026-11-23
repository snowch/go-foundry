package main

import "fmt"

func main() {
	total := 0
	for value := 1; value <= 3; value++ {
		total += value
		fmt.Println("value", value, "total", total)
	}
}
