package main

import (
	"fmt"
)

func main() {
	for value := 1; value <= 6; value++ {
		if value == 2 {
			continue
		}
		if value == 5 {
			break
		}
		fmt.Println(value)
	}
}
