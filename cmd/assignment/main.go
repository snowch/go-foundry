package main

import (
	"fmt"
)

func main() {
	count := 3
	fmt.Println("before", count)
	count = count + 2
	fmt.Println("after", count)
}
