package main

import (
	"fmt"
)

func work() {
	defer fmt.Println("cleanup")
	fmt.Println("work")
}

func main() {
	work()
	fmt.Println("finished")
}
