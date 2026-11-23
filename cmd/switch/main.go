package main

import (
	"fmt"
)

func main() {
	operation := "add"
	left, right := 5, 2
	switch operation {
	case "add":
		fmt.Println("result", left+right)
	case "subtract":
		fmt.Println("result", left-right)
	default:
		fmt.Println("unknown operation")
	}
}
