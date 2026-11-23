package main

import (
	"fmt"
)

func guarded() {
	defer func() {
		if value := recover(); value != nil {
			fmt.Println("recovered", value)
		}
	}()
	panic("stop")
}

func main() {
	guarded()
	fmt.Println("continued")
}
