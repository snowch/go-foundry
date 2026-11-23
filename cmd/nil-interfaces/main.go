package main

import (
	"fmt"
)

func main() {
	var pointer *int
	var value any = pointer
	fmt.Println("pointer nil", pointer == nil)
	fmt.Println("interface nil", value == nil)
}
