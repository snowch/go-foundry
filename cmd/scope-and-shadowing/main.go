package main

import (
	"fmt"
)

func main() {
	value := 10
	{
		value := 3
		fmt.Println("inner", value)
	}
	fmt.Println("outer", value)
}
