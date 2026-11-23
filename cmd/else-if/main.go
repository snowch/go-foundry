package main

import (
	"fmt"
)

func main() {
	temperature := 0
	if temperature < 0 {
		fmt.Println("freezing")
	} else if temperature < 20 {
		fmt.Println("cool")
	} else {
		fmt.Println("warm")
	}
}
