package main

import (
	"fmt"
)

func main() {
	messages := make(chan string, 1)
	// messages <- "ready"
	select {
	case message := <-messages:
		fmt.Println(message)
	default:
		fmt.Println("no message")
	}
}
