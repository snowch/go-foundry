package main

import (
	"fmt"
)

func main() {
	count := 3
	for index := range count {
		fmt.Println("index", index)
	}
	fmt.Println("done")
}
